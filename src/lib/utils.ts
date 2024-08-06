import { PrismaClient } from "@prisma/client";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import crypto from "crypto";

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
  const data = await prisma.duty.findMany({
    where: { userId },
  });

  return data;
};

export const fetchUsers = async () => {
  const data = await prisma.user.findMany();
  return data;
};

export function hashPassword(password: string): string {
  const salt = process.env.SALT!;
  const hash = crypto.createHmac("sha256", salt);
  hash.update(password);
  const hashedPassword = hash.digest("hex");
  return hashedPassword;
}

export function checkPassword(
  password: string,
  hashedPassword: string
): boolean {
  const salt = process.env.SALT!;
  const hash = crypto.createHmac("sha256", salt);
  hash.update(password);
  const computedHash = hash.digest("hex");
  return computedHash === hashedPassword;
}
