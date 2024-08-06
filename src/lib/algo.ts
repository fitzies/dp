"use server";

import { countScore } from "./server";
import { DutyName, PrismaClient } from "@prisma/client";
import { getDay } from "date-fns";

const prisma = new PrismaClient();

interface UserWithPoints {
  userId: string;
  points: number;
  unavailableDates: string[];
}

const maxPoints = 100; // Set this high enough to handle large point values

const getWeightedUser = (
  availableUsers: UserWithPoints[],
  isWeekend: boolean,
  excludeUserId?: string // Optionally exclude a specific user
) => {
  const totalPoints = availableUsers.reduce(
    (sum, user) => sum + user.points,
    0
  );

  // Balance the weight: the more points a user has, the less weight they get
  const weightedUsers = availableUsers.map((user) => {
    if (user.userId === excludeUserId) {
      return { ...user, weight: 0 }; // Exclude this user
    }
    const weight = isWeekend
      ? (totalPoints - user.points) / availableUsers.length
      : user.points;
    return { ...user, weight: Math.max(weight, 0) }; // Ensure weight is non-negative
  });

  const totalWeight = weightedUsers.reduce((sum, user) => sum + user.weight, 0);
  const randomWeight = Math.random() * totalWeight;

  let cumulativeWeight = 0;
  for (const user of weightedUsers) {
    cumulativeWeight += user.weight;
    if (randomWeight < cumulativeWeight) {
      return user;
    }
  }

  return availableUsers[Math.floor(Math.random() * availableUsers.length)];
};

export const assignDuty = async (formData: FormData) => {
  await countScore();

  try {
    const dutyName = formData.get("dutyName") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const teamIdString = formData.get("teamId") as string;

    const teamId = parseInt(teamIdString, 10);
    if (!dutyName || !startDate || !endDate || isNaN(teamId)) {
      throw new Error("Invalid input data");
    }

    const dateList: string[] = [];
    let currentDate = new Date(startDate);
    const finalDate = new Date(endDate);

    while (currentDate <= finalDate) {
      dateList.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true },
    });

    if (!team) {
      throw new Error(`Team with ID ${teamId} not found`);
    }

    const usersWithPoints: UserWithPoints[] = await Promise.all(
      team.members.map(async (user) => {
        const unavailableDates = await prisma.duty.findMany({
          where: {
            userId: user.userId,
            date: {
              gte: startDate,
              lte: endDate,
            },
            name: DutyName.NOT_AVAILABLE,
          },
          select: { date: true },
        });
        return {
          userId: user.userId,
          points: user.points || 0,
          unavailableDates: unavailableDates.map((duty) => duty.date),
        };
      })
    );

    const assignedDuties: { date: string; userId: string }[] = [];
    let lastAssignedUserId: string | undefined;
    let lastAssignedDate: string | undefined;

    for (const date of dateList) {
      const isWeekend =
        getDay(new Date(date)) === 0 || getDay(new Date(date)) === 6;

      const availableUsers = usersWithPoints.filter(
        (user) => !user.unavailableDates.includes(date)
      );

      let selectedUser: UserWithPoints | undefined;

      if (availableUsers.length > 0) {
        // Filter out the user who was assigned on the last date
        const filteredUsers = availableUsers.filter(
          (user) => user.userId !== lastAssignedUserId
        );
        selectedUser = getWeightedUser(filteredUsers, isWeekend);
      } else {
        // No available users, choose the one with the lowest points
        selectedUser = usersWithPoints.reduce(
          (minUser, user) => (user.points < minUser.points ? user : minUser),
          usersWithPoints[0]
        );

        // Update the unavailable duty to include the current date
        await prisma.duty.updateMany({
          where: {
            userId: selectedUser.userId,
            date,
            name: DutyName.NOT_AVAILABLE,
          },
          data: {
            name: dutyName as DutyName,
            points_awarded: isWeekend ? 2 : 1,
          },
        });
      }

      const existingDuty = await prisma.duty.findUnique({
        where: {
          date_teamId: {
            date,
            teamId,
          },
        },
      });

      if (existingDuty) {
        console.warn(
          `Duty already assigned for date ${date} and teamId ${teamId}`
        );
        continue;
      }

      assignedDuties.push({ date, userId: selectedUser.userId });

      await prisma.duty.create({
        data: {
          date,
          userId: selectedUser.userId,
          teamId,
          name: dutyName as DutyName,
          points_awarded: isWeekend ? 2 : 1,
        },
      });

      // Update points immediately after assigning each duty
      await prisma.user.update({
        where: { userId: selectedUser.userId },
        data: {
          points: {
            increment: isWeekend ? 2 : 1,
          },
        },
      });

      lastAssignedUserId = selectedUser.userId; // Update the last assigned user
      lastAssignedDate = date; // Update the last assigned date
    }

    // Remove countScore call since we are updating points in real-time now
    // await countScore();
  } catch (error) {
    console.error("Error assigning duties:", error);
    throw error;
  }
};
