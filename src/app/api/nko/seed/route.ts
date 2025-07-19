import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { seedNkoLessons } from "@/lib/nko/seed/seed-lessons";

export async function POST(req: Request) {
  try {
    await seedNkoLessons();

    return NextResponse.json({
      success: true,
      message: "Successfully seeded N'Ko lessons"
    });
  } catch (error) {
    console.error("Error in seed route:", error);
    return NextResponse.json(
      { error: "Failed to seed lessons" },
      { status: 500 }
    );
  }
}
