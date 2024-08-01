import { PrismaClient } from "@prisma/client";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const prisma = new PrismaClient();

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};

export const fetchDuties = async (userId: string) => {
  // try {
  //   const response = await fetch("/api/duty", {
  //     method: "POST", // Specify the request method
  //     headers: {
  //       "Content-Type": "application/json", // Set the content type to JSON
  //     },
  //     body: JSON.stringify({ userId }), // Convert the data to JSON
  //   });

  //   if (!response.ok) {
  //     // Handle non-2xx HTTP responses
  //     throw new Error(`HTTP error! status: ${response.status}`);
  //   }

  //   const data = await response.json(); // Parse the JSON response
  //   return data; // Return the data to the caller
  // } catch (error) {
  //   // Handle errors
  //   console.error("Fetch error:", error);
  //   throw error; // Re-throw the error to be handled by the caller
  // }
  const data = await prisma.duty.findMany({
    where: { userId },
  });

  return data;
};

export const fetchUsers = async () => {
  const data = await prisma.user.findMany();
  return data;
};
