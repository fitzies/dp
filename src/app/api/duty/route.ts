import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Parse the JSON body
    const { userId } = await request.json();
    console.log("Received:", { userId }); // Log input data

    // Example Prisma query to fetch duties based on date and userId
    const data = await prisma.duty.findMany({
      where: { userId },
    });
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
