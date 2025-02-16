import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { promises as fsPromises, createReadStream } from 'fs'; // Import fs using ES modules
import os from 'os'; // For temporary directory

export async function POST(req: Request) {
  try {
    const { audio } = await req.json();

    if (!audio) {
      return NextResponse.json({ error: "No audio data provided" }, { status: 400 });
    }

    const audioBuffer = Buffer.from(audio, 'base64');

    // More robust temporary file handling using os.tmpdir()
    const tempFileName = `temp-${Date.now()}.webm`;
    const tempFilePath = `${os.tmpdir()}/${tempFileName}`; // Use os.tmpdir()

    await fsPromises.writeFile(tempFilePath, audioBuffer);

    const audioFileStream = createReadStream(tempFilePath); // Use createReadStream

    const transcription = await openai.audio.transcriptions.create({
      file: audioFileStream,
      model: "whisper-1",
      response_format: "text",
    });

    await fsPromises.unlink(tempFilePath); // Clean up

    return NextResponse.json({ text: transcription });
  } catch (error) {
    console.error("STT error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe speech" },
      { status: 500 }
    );
  }
}