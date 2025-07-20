import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { promises as fsPromises, createReadStream } from 'fs'; // Import fs using ES modules
import os from 'os'; // For temporary directory

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    
    let audioBuffer: Buffer;
    let fileExtension = 'wav'; // Default extension
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData from frontend
      const formData = await req.formData();
      const audioFile = formData.get('audio') as File;
      
      if (!audioFile) {
        return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
      }
      
      // Get the actual file type and set appropriate extension
      const audioType = audioFile.type;
      console.log('Received audio type:', audioType);
      
      // Map MIME types to file extensions
      if (audioType.includes('webm')) {
        fileExtension = 'webm';
      } else if (audioType.includes('ogg')) {
        fileExtension = 'ogg';
      } else if (audioType.includes('mp4') || audioType.includes('m4a')) {
        fileExtension = 'm4a';
      } else if (audioType.includes('wav')) {
        fileExtension = 'wav';
      } else if (audioType.includes('mp3')) {
        fileExtension = 'mp3';
      } else {
        // Default to webm for unknown types (most common from MediaRecorder)
        fileExtension = 'webm';
      }
      
      audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    } else if (contentType.includes('application/json')) {
      // Handle base64 encoded audio
      const body = await req.json();
      if (!body.audio) {
        return NextResponse.json({ error: "No audio data provided" }, { status: 400 });
      }
      audioBuffer = Buffer.from(body.audio, 'base64');
    } else {
      return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
    }

    // Create temporary file with correct extension
    const tempFileName = `temp-audio-${Date.now()}.${fileExtension}`;
    const tempFilePath = `${os.tmpdir()}/${tempFileName}`;

    await fsPromises.writeFile(tempFilePath, audioBuffer);
    console.log(`Created temp file: ${tempFilePath} with extension: ${fileExtension}`);

    // Create file stream for OpenAI
    const audioFileStream = createReadStream(tempFilePath);
    
    // Add filename to the stream for OpenAI to properly detect format
    (audioFileStream as any).path = tempFilePath;

    const transcription = await openai.audio.transcriptions.create({
      file: audioFileStream,
      model: "whisper-1",
      response_format: "text",
    });

    // Clean up temporary file
    await fsPromises.unlink(tempFilePath);

    return NextResponse.json({ text: transcription });
  } catch (error) {
    console.error("STT error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe speech" },
      { status: 500 }
    );
  }
}