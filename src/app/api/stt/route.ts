import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { promises as fsPromises, createReadStream } from 'fs'; // Import fs using ES modules
import os from 'os'; // For temporary directory

export async function POST(req: Request) {
  try {
    // Check content type and handle different request formats
    const contentType = req.headers.get('content-type') || '';
    let audio: string;

    if (contentType.includes('application/json')) {
      try {
        const body = await req.json();
        audio = body.audio;
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
      }
    } else if (contentType.includes('multipart/form-data') || contentType.includes('application/octet-stream')) {
      // Handle direct audio upload
      const audioBuffer = await req.arrayBuffer();
      audio = Buffer.from(audioBuffer).toString('base64');
    } else {
      // Try to read as text and parse
      try {
        const text = await req.text();
        if (text.startsWith('{')) {
          const body = JSON.parse(text);
          audio = body.audio;
        } else {
          return NextResponse.json({ error: "Unsupported content type. Expected JSON with audio field." }, { status: 400 });
        }
      } catch (parseError) {
        console.error('Text parsing error:', parseError);
        return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
      }
    }

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