"use server";

import { PrismaClient, DutyName, Duty, User } from "@prisma/client";
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
};

//   const AvailableDuty = await prisma.duty.delete({
//     where: { id: unavailableDuty?.id },
//   });
//   revalidatePath("/");
//   return true;
// };

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
  try {
    // Fetch all duties and users using raw queries
    const duties: Duty[] = await prisma.$queryRaw`SELECT * FROM "Duty"`;
    const users: User[] = await prisma.$queryRaw`SELECT * FROM "User"`;

    // Create a map for user points initialization
    const usersMap = new Map(
      users.map((user) => [user.userId, { ...user, points: 0 }])
    );

    // Aggregate points for each user based on duties
    duties.forEach((duty) => {
      const user = usersMap.get(duty.userId);
      if (user) {
        user.points += duty.points_awarded;
      }
    });

    // Convert map back to array
    const updatedUsers = Array.from(usersMap.values());

    // Update the user points in the database
    await Promise.all(
      updatedUsers.map(
        (user) =>
          prisma.$executeRaw`UPDATE "User" SET points = ${user.points} WHERE "userId" = ${user.userId}`
      )
    );

    // Optionally, revalidate the path to reflect changes
    revalidatePath("/");

    console.log("User points updated successfully");
  } catch (error) {
    console.error("Error updating user points:", error);
  }
};

const requestDutySwitch = async (data: FormData) => {
  const requestingDutyId = parseInt(
    (data.get("requesting-duty") ?? "NO USER").toString()
  ); // These are the duty IDs

  const originalDutyId = parseInt(
    (data.get("duty-to-change") ?? "NO USER").toString()
  ); // These are the duty IDs

  // Fetch the requesting duty object
  const requestingDuty = await prisma.duty.findUnique({
    where: { id: requestingDutyId },
  });

  if (!requestingDuty) {
    throw new Error("Requesting duty not found");
  }

  // Ensure uniqueness of the originalDutyId in the requestSwitch array
  const updatedRequestSwitch = Array.from(
    new Set([...requestingDuty.requestSwitch, originalDutyId])
  );

  // Update the duty object with the new array
  const updatedDuty = await prisma.duty.update({
    where: { id: requestingDutyId },
    data: {
      requestSwitch: updatedRequestSwitch,
    },
  });

  console.log(updatedDuty);
  revalidatePath("/");

  return updatedDuty;
};

const createSwitchObjects = async () => {
  // Fetch all duties with pending switch requests
  const requestedDutySwitches = (await fetchDuties()).filter(
    (duty) => duty.requestSwitch.length > 0
  );

  // Create an array of objects
  const switchObjects = await Promise.all(
    requestedDutySwitches.flatMap(async (duty) => {
      // Create an array of objects for each duty's requestSwitch
      return Promise.all(
        duty.requestSwitch.map(async (dutyToSwitchId) => {
          // Fetch full duty object for the duty to switch
          const dutyToSwitch = await prisma.duty.findUnique({
            where: { id: dutyToSwitchId },
            select: {
              id: true,
              date: true,
              userId: true,
              teamId: true,
              name: true,
              description: true,
              points_awarded: true,
              requestSwitch: true,
            }, // Fetch the complete duty object
          });

          // Fetch the user object for the duty to switch
          const userToSwitch = dutyToSwitch?.userId
            ? await prisma.user.findUnique({
                where: { userId: dutyToSwitch.userId },
                // Fetch the necessary fields for the user object
                select: {
                  userId: true,
                  username: true,
                  points: true,
                  admin: true,
                },
              })
            : null;

          return {
            duty, // The full duty object (the one requesting the switch)
            dutyToSwitch: dutyToSwitch, // The full duty object being switched to
            userToSwitch, // Full user object for the dutyToSwitch
          };
        })
      );
    })
  );

  // Flatten the resulting array of arrays
  return switchObjects.flat();
};

export {
  submitLogin,
  fetchDuties,
  getUser,
  createTeam,
  getTeams,
  updateTeamMembers,
  createSwitchObjects,
  makeNotAvailable,
  getUsers,
  makeAvailable,
  logout,
  updateCredentials,
  countScore,
  fetchAllDuties,
  requestDutySwitch,
};
