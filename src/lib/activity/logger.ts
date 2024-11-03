import { prisma } from "@/lib/db/prisma";

export type ActivityType = 
  | "STATUS_CHANGE"
  | "NOTE_ADDED"
  | "EMAIL_SENT"
  | "CONTACT_CREATED"
  | "CONTACT_UPDATED"
  | "CONTACT_DELETED";

export async function logActivity({
  contactId,
  userId,
  type,
  description,
  metadata = {}
}: {
  contactId: string;
  userId: string;
  type: ActivityType;
  description: string;
  metadata?: Record<string, any>;
}) {
  try {
    const activity = await prisma.activity.create({
      data: {
        contactId,
        userId,
        type,
        description,
        metadata,
      },
    });
    return activity;
  } catch (error) {
    console.error("Failed to log activity:", error);
    return null;
  }
}
