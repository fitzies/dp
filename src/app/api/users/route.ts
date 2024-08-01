import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const data = await prisma.user.findMany();
    console.log("Data fetched:", data); // Log fetched data

    // Return the response with status 200
    return new Response(JSON.stringify({ data }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error); // Log the error for debugging
    // Return a 500 response with error details
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
