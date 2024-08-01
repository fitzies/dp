"use server";

import { DutyName, PrismaClient } from "@prisma/client";
import { getDay } from "date-fns"; // Import getDay for determining day of the week

const prisma = new PrismaClient();

interface UserWithPoints {
  userId: string; // Ensure this matches the type used in your Prisma schema
  points: number;
  unavailableDates: string[];
}

export const assignDuty = async (formData: FormData) => {
  try {
    // Extract values from FormData
    const dutyName = formData.get("dutyName") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const teamIdString = formData.get("teamId") as string;

    // Convert teamId from string to number
    const teamId = parseInt(teamIdString, 10);

    if (!dutyName || !startDate || !endDate || isNaN(teamId)) {
      throw new Error("Invalid input data");
    }

    // Generate an array of dates between startDate and endDate
    const dateList: string[] = [];
    let currentDate = new Date(startDate);
    const finalDate = new Date(endDate);

    while (currentDate <= finalDate) {
      dateList.push(currentDate.toISOString().split("T")[0]); // Add formatted date to list
      currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
    }

    // Fetch users in the team with their points and availability
    const team = await prisma.team.findUnique({
      where: { id: teamId }, // Ensure id is used as a number
      include: { members: true }, // Assuming 'members' contains the users in the team
    });

    if (!team) {
      throw new Error(`Team with ID ${teamId} not found`);
    }

    // Fetch all users in the team with their points and unavailable dates
    const usersWithPoints: UserWithPoints[] = await Promise.all(
      team.members.map(async (user) => {
        const unavailableDates = await prisma.duty.findMany({
          where: {
            userId: user.userId,
            date: {
              gte: startDate,
              lte: endDate,
            },
            name: DutyName.NOT_AVAILABLE, // Assuming 'NOT_AVAILABLE' represents unavailable status
          },
          select: { date: true },
        });
        return {
          userId: user.userId,
          points: user.points || 0, // Default to 0 if points are not set
          unavailableDates: unavailableDates.map((duty) => duty.date),
        };
      })
    );

    // Initialize an empty list to keep track of assigned duties
    const assignedDuties: { date: string; userId: string }[] = [];

    // Function to get a weighted user based on the day of the week
    const getWeightedUser = (
      availableUsers: UserWithPoints[],
      isWeekend: boolean
    ) => {
      // Adjust weight based on the points and whether it's a weekend
      const weightedUsers = availableUsers.map((user) => {
        // Higher points users have less chance for weekend duties
        const weight = isWeekend ? Math.max(0, 10 - user.points) : user.points;
        return { ...user, weight };
      });

      // Normalize weights to create a probability distribution
      const totalWeight = weightedUsers.reduce(
        (sum, user) => sum + user.weight,
        0
      );
      const randomWeight = Math.random() * totalWeight;

      let cumulativeWeight = 0;
      for (const user of weightedUsers) {
        cumulativeWeight += user.weight;
        if (randomWeight < cumulativeWeight) {
          return user;
        }
      }

      // Fallback, should not generally reach here
      return availableUsers[Math.floor(Math.random() * availableUsers.length)];
    };

    // Randomly assign duties ensuring no duplicate dates
    for (const date of dateList) {
      const isWeekend =
        getDay(new Date(date)) === 0 || getDay(new Date(date)) === 6;

      // Filter out users who are unavailable on the current date
      const availableUsers = usersWithPoints.filter(
        (user) => !user.unavailableDates.includes(date)
      );

      if (availableUsers.length === 0) {
        console.warn(`No available users for date ${date}`);
        continue;
      }

      // Get a weighted user for the current date
      const selectedUser = getWeightedUser(availableUsers, isWeekend);

      // Check if a duty with the same date and teamId already exists
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
          name: dutyName as DutyName, // Assuming the dutyName is valid DutyName
          points_awarded: isWeekend ? 2 : 1, // 1 for weekdays, 2 for weekends
        },
      });
    }

    // Accumulate and update points for each user based on assigned duties
    for (const user of usersWithPoints) {
      // Calculate total points awarded
      const totalPoints = assignedDuties
        .filter((duty) => duty.userId === user.userId)
        .reduce((acc, duty) => {
          const date = new Date(duty.date);
          const points = getDay(date) >= 1 && getDay(date) <= 5 ? 1 : 2; // 1 for weekdays, 2 for weekends
          return acc + points;
        }, 0);

      // Update user points
      await prisma.user.update({
        where: { userId: user.userId }, // Ensure userId is used as a string
        data: { points: user.points + totalPoints },
      });
    }
  } catch (error) {
    console.error("Error assigning duties:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};
