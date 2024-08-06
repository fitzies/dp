"use server";

import { PrismaClient, DutyName } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { checkPassword, hashPassword } from "./utils";

const prisma = new PrismaClient();

interface LoginData {
  username: string;
  password: string;
}

const submitLogin = async (data: FormData) => {
  // Extract and validate form data
  const username = data.get("username")?.toString().trim();
  const password = data.get("password")?.toString();

  if (!username || !password) {
    throw new Error("Username and password are required");
  }

  try {
    // Fetch the user by username
    const user = await prisma.user.findFirst({
      where: { username },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Check if the provided password matches the stored password

    const matchPassword: boolean = await checkPassword(password, user.password);

    if (matchPassword) {
      console.log("Login successful for user:", username);
      cookies().set("userId", user.userId.toString());
      return user;
    } else {
      throw new Error("Invalid password");
    }
  } catch (error) {
    console.error("Error during login:", error);
    throw new Error("Username or password are incorrect");
  }
};

const getUser = async () => {
  const userId = cookies().get("userId")!.value;

  const user = await prisma.user.findFirst({ where: { userId } });
  if (!user) {
    throw Error("Can't find user");
  }
  return user;
};

const createTeam = async (form: FormData) => {
  const [name, userId] = [
    form.get("name")!.toString(),
    form.get("userId")!.toString(),
  ];

  const newTeam = await prisma.team.create({ data: { name, admin: userId } });
  revalidatePath("/teams");
  return newTeam;
};

const getTeams = async () => {
  return await prisma.team.findMany({
    include: {
      members: true,
    },
  });
};

const updateTeamMembers = async (data: FormData) => {
  const members = JSON.parse(data.get("members")!.toString());
  const teamId = parseInt(data.get("team-id")!.toString());

  // Array to store userId values
  const memberUserIds = [];

  for (const username of members) {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
      select: {
        userId: true,
      },
    });

    if (user && user.userId) {
      memberUserIds.push({ userId: user.userId });
    }
  }

  const team = await prisma.team.update({
    where: {
      id: teamId, // ID of the team you want to update
    },
    data: {
      members: {
        connect: memberUserIds, // Connect users by their userId
      },
    },
  });

  console.log(team);
};

const makeNotAvailable = async (data: FormData) => {
  const date = data.get("date")!.toString();
  const userId = data.get("userId")!.toString();

  const notAvailableDuty = await prisma.duty.create({
    data: {
      date,
      name: DutyName.NOT_AVAILABLE,
      userId,
      points_awarded: 0,
      teamId: -1,
    },
  });
  revalidatePath("/");
  return notAvailableDuty;
};

const makeAvailable = async (data: FormData) => {
  const date = data.get("date")!.toString();
  const userId = data.get("userId")!.toString();

  const unavailableDuty = await prisma.duty.findFirst({
    where: { date, userId, name: DutyName.NOT_AVAILABLE },
  });

  if (!unavailableDuty) {
    throw Error("No unavailable duty on this date");
    return false;
  }

  const AvailableDuty = await prisma.duty.delete({
    where: { id: unavailableDuty?.id },
  });
  revalidatePath("/");
  return true;
};

const getUsers = async () => {
  const users = await prisma.user.findMany();
  return users;
};

const logout = (data: FormData) => {
  cookies().delete("userId");
  revalidatePath("/");
};

const updateCredentials = async (data: FormData) => {
  const id = parseInt(data.get("id")!.toString());
  const username = data.get("username")?.toString().trim();
  const password = data.get("password")?.toString();
  const confirmPassword = data.get("confirm-password")?.toString();

  if (password !== confirmPassword || !password || !confirmPassword) {
    throw Error("Passwords do not match");
  }

  const hashedPassword: string = hashPassword(password);

  await prisma.user.update({
    where: { id, username },
    data: { username, password: hashedPassword },
  });

  return true;
};

export {
  submitLogin,
  getUser,
  createTeam,
  getTeams,
  updateTeamMembers,
  makeNotAvailable,
  getUsers,
  makeAvailable,
  logout,
  updateCredentials,
};
