"use server";

import { PrismaClient, DutyName, User } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { checkPassword, hashPassword } from "./utils";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redirect } from "next/navigation";

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
    const user = await prisma.user.findUnique({
      where: { username },
    });

    console.log(user);

    if (!user) {
      throw new Error("User not found");
    }

    // Check if the provided password matches the stored password

    const matchPassword: boolean = await checkPassword(password, user.password);

    if (matchPassword) {
      console.log("Login successful for user:", username);
      // cookies().set("userId", user.userId.toString());
      signToken(user);
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
  const token = cookies().get("token");
  if (!token) {
    console.log("No user token");
    redirect("/login");
  }

  let possibleUser: User = JSON.parse(
    Buffer.from(token.value.split(".")[1], "base64").toString()
  );

  const user = await prisma.user.findFirst({
    where: { userId: possibleUser.userId },
  });
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

const signToken = async (user: User) => {
  // let jwtToken = signToken({ id: user.id }, process.env.NEXT_PUBLIC_JWT_SECRET);
  const privateKey = process.env.JWT_SECRET ?? "secret";
  const token = jwt.sign(
    {
      token: user,
    },
    privateKey,
    { expiresIn: "1h" }
  );

  cookies().set("token", token);

  return token;
};

const verifyToken = async (token: any) => {
  const privateKey = process.env.JWT_SECRET ?? "secret";
  // const token = cookies().get("token")?.value;

  if (!token) {
    throw Error("No token available");
  }

  try {
    const verified = await jwt.verify(token, privateKey);
    return verified;
  } catch (error) {
    // Clear the token cookie
    cookies().set("token", "", { maxAge: -1 });
    // Redirect to login page
    return false;
  }
};

// export function getUser() {
//   const token = cookies().get("token")!.value;
//   // const privateKey = process.env.JWT_SECRET ?? "secret";

//   try {
//     // const decoded = jwt.verify(token, privateKey);
//     let user: User = JSON.parse(
//       Buffer.from(token.split(".")[1], "base64").toString()
//     );
//     return user.userId;
//   } catch (err) {}
// }

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
  signToken,
  verifyToken,
};
