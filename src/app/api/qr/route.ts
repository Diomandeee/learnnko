import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { z } from "zod";

// Define the style schema
const styleSchema = z.object({
  opacity: z.number(),
  blurRadius: z.number(),
  brightness: z.number(),
  contrast: z.number(),
  borderRadius: z.number(),
  borderWidth: z.number(),
  borderColor: z.string(),
  shadowColor: z.string(),
  shadowBlur: z.number(),
  shadowOffsetX: z.number(),
  shadowOffsetY: z.number(),
  gradientType: z.enum(['none', 'linear', 'radial']),
  gradientStart: z.string(),
  gradientEnd: z.string(),
  gradientRotation: z.number(),
  padding: z.number(),
  blend: z.boolean(),
  blendMode: z.string()
});

// Define the logo style schema
const logoStyleSchema = z.object({
  opacity: z.number(),
  blurRadius: z.number(),
  brightness: z.number(),
  contrast: z.number(),
  borderRadius: z.number(),
  borderWidth: z.number(),
  borderColor: z.string(),
  shadowColor: z.string(),
  shadowBlur: z.number(),
  shadowOffsetX: z.number(),
  shadowOffsetY: z.number(),
  padding: z.number(),
  backgroundColor: z.string(),
  removeBackground: z.boolean(),
  position: z.union([
    z.string(),
    z.object({
      x: z.number(),
      y: z.number()
    })
  ]),
  rotation: z.number(),
  blend: z.boolean(),
  blendMode: z.string(),
  scale: z.number()
});

// Define the design schema
const designSchema = z.object({
  size: z.number(),
  backgroundColor: z.string(),
  foregroundColor: z.string(),
  logoWidth: z.number(),
  logoHeight: z.number(),
  dotStyle: z.string(),
  margin: z.number(),
  errorCorrectionLevel: z.string(),
  imageRendering: z.string(),
  style: styleSchema,
  logoStyle: logoStyleSchema.optional(),
  logoImage: z.string().optional()
});

// Define the main schema for QR code creation
const createQRCodeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  defaultUrl: z.string()
    .min(1, "URL is required")
    .transform(val => {
      if (!val.match(/^https?:\/\//i)) {
        return `https://${val}`;
      }
      return val;
    }),
  folderId: z.string().nullable(),
  design: designSchema
});

export async function POST(req: Request) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = createQRCodeSchema.parse(body);

    // Generate unique short code
    const generateShortCode = (length: number = 6): string => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      return Array(length)
        .fill(0)
        .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
        .join('');
    };

    // Create QR code
    const qrCode = await prisma.qRCode.create({
      data: {
        name: validatedData.name,
        defaultUrl: validatedData.defaultUrl,
        shortCode: generateShortCode(),
        isActive: true,
        design: validatedData.design,
        userId: user.id,
        folderId: validatedData.folderId
      }
    });

    return NextResponse.json({
      message: "QR code created successfully",
      qrCode
    });

  } catch (error) {
    console.error("[QR_CREATE_ERROR]", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: "Validation error",
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      error: "Internal server error"
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const qrCodes = await prisma.qRCode.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        folder: true,
      },
    });

    return NextResponse.json(qrCodes);
    
  } catch (error) {
    console.error("[QR_GET_ERROR]", error);
    return NextResponse.json({
      error: "Internal server error"
    }, { status: 500 });
  }
}
