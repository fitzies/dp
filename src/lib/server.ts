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

const fetchDuties = async () => {
  const userId = cookies().get("userId")?.value;
  await countScore();

  const data = await prisma.duty.findMany({
    where: { userId },
  });

  return data;
};

const fetchAllDuties = async () => {
  const data = await prisma.duty.findMany();

  return data;
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
};

const makeNotAvailable = async (data: FormData) => {
  const date = data.get("date")!.toString();
  const userId = data.get("userId")!.toString();
  const reason = data.get("reason") ?? "No reason given";

  const notAvailableDuty = await prisma.duty.create({
    data: {
      date,
      name: DutyName.NOT_AVAILABLE,
      userId,
      points_awarded: 0,
      teamId: -1,
      description: reason.toString(),
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

const countScore = async () => {
  const duties = await prisma.duty.findMany();
  const users = await prisma.user.findMany();

  // Create a map to hold user points
  const usersMap = new Map(
    users.map((user) => [user.userId, { ...user, points: 0 }])
  );

  // Iterate over all duties and add points to corresponding user
  duties.forEach((duty) => {
    const user = usersMap.get(duty.userId);
    if (user) {
      user.points += duty.points_awarded;
    }
  });

  // Convert map back to array
  const updatedUsers = Array.from(usersMap.values());

  // Update users in the database
  for (const user of updatedUsers) {
    await prisma.user.update({
      where: { userId: user.userId },
      data: { points: user.points },
    });
  }

  revalidatePath("/");

  console.log("User points updated successfully");
};

export {
  submitLogin,
  fetchDuties,
  getUser,
  createTeam,
  getTeams,
  updateTeamMembers,
  makeNotAvailable,
  getUsers,
  makeAvailable,
  logout,
  updateCredentials,
  countScore,
  fetchAllDuties,
};
