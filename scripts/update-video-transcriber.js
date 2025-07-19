const fs = require('fs');
const path = require('path');

// Path to the VideoTranscriber component
const videoTranscriberPath = path.join(__dirname, 'src', 'lib', 'transcriber', 'video-transcriber.ts');

// Add the improved downloadYoutubeMedia method
fs.readFile(videoTranscriberPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }
  
  // Add ytdl-wrapper import
  let updatedContent = data.replace(
    'import { TranscriptionOptions, TranscriptionResult } from "./types";',
    'import { TranscriptionOptions, TranscriptionResult } from "./types";\nimport { downloadYouTubeVideo } from "./ytdl-wrapper";'
  );
  
  // Replace downloadYoutubeMedia method
  const methodPattern = /async downloadYoutubeMedia\([^{]*\{(\s|.)*?}\s*\n/;
  const newMethod = `async downloadYoutubeMedia(
    youtubeUrl: string,
    outputPath: string,
    mediaType: "audio" | "video" = "video"
  ): Promise<string> {
    await createDirectoryIfNotExists(outputPath);
    
    try {
      // Use the enhanced YouTube downloader
      const outputFilePath = await downloadYouTubeVideo(
        youtubeUrl, 
        outputPath, 
        mediaType === "audio" ? "highestaudio" : "highest"
      );
      
      // If audio is requested, convert video to audio
      if (mediaType === "audio") {
        const audioPath = outputFilePath.replace(".mp4", ".m4a");
        await this.convertMp4ToM4a(outputFilePath, audioPath);
        await fs.remove(outputFilePath); // Remove the video file
        return audioPath;
      }
      
      return outputFilePath;
    } catch (error) {
      console.error("Error downloading YouTube video:", error);
      throw error;
    }
  }

  `;
  
  // Check if the method exists and replace it
  if (methodPattern.test(updatedContent)) {
    updatedContent = updatedContent.replace(methodPattern, newMethod);
  } else {
    // If the method doesn't exist, add it to the class
    const classEndIndex = updatedContent.lastIndexOf('}');
    updatedContent = updatedContent.slice(0, classEndIndex) + newMethod + updatedContent.slice(classEndIndex);
  }
  
  // Write the updated file
  fs.writeFile(videoTranscriberPath, updatedContent, 'utf8', (writeErr) => {
    if (writeErr) {
      console.error('Error writing file:', writeErr);
      return;
    }
    console.log('Successfully updated VideoTranscriber class with improved YouTube handling!');
  });
});
