import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import nodemailer from "nodemailer";
import { z } from "zod";

const emailSchema = z.object({
  to: z.array(z.string().email()),
  subject: z.string(),
  body: z.string(),
  contactIds: z.array(z.string())
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const { to, subject, body, contactIds } = emailSchema.parse(json);

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD
      },
      secure: true
    });

    await Promise.all(
      to.map(async (email) => {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: email,
          subject,
          html: body
        });
      })
    );

    await prisma.activity.createMany({
      data: contactIds.map((contactId) => ({
        type: "EMAIL_SENT",
        description: `Email sent: ${subject}`,
        contactId,
        userId: session.user.id as string,
        metadata: {
          recipients: to,
          subject,
          sentAt: new Date()
        }
      }))
    });

    return NextResponse.json({ 
      message: `Emails sent successfully to ${to.length} recipients`
    });
  } catch (error) {
    console.error("[EMAIL_SEND]", error);
    return NextResponse.json(
      { error: "Failed to send emails" },
      { status: 500 }
    );
  }
}
