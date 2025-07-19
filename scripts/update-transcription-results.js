const fs = require('fs');
const path = require('path');

// Path to the TranscriptionResults component
const resultsComponentPath = path.join(__dirname, 'src', 'components', 'transcriber', 'transcription-results.tsx');

// Read the current component file
fs.readFile(resultsComponentPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }
  
  // Add import for FolderSelector
  let updatedContent = data.replace(
    'import { formatDistanceToNow } from "date-fns";',
    'import { formatDistanceToNow } from "date-fns";\nimport { FolderSelector } from "./folder-selector";'
  );
  
  // Add state for downloadFolder
  updatedContent = updatedContent.replace(
    'export function TranscriptionResults({ jobs }: TranscriptionResultsProps) {',
    'export function TranscriptionResults({ jobs }: TranscriptionResultsProps) {\n  const [downloadFolder, setDownloadFolder] = useState<string>("");'
  );
  
  // Replace the handleDownloadText function
  const oldHandleDownloadText = /const handleDownloadText = \(job: TranscriptionJob\) => \{(\s|.)*?\};/;
  const newHandleDownloadText = `const handleDownloadText = async (job: TranscriptionJob) => {
    if (!job.result) return;
    
    const blob = new Blob([job.result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    
    // Create a safe filename
    const safeFilename = job.name
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "_")
      .substring(0, 100);
    
    const filename = \`\${safeFilename}.txt\`;
    
    try {
      // If the browser supports the File System Access API and we have a selected directory
      // @ts-ignore - The File System Access API might not be typed in current TypeScript versions
      if (window.selectedDirectoryHandle && downloadFolder) {
        try {
          // @ts-ignore
          const fileHandle = await window.selectedDirectoryHandle.getFileHandle(filename, { create: true });
          // @ts-ignore
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
          
          toast({
            title: "File saved",
            description: \`Saved to \${downloadFolder}/\${filename}\`,
          });
        } catch (error) {
          console.error("Error saving to selected folder:", error);
          // Fall back to regular download
          downloadWithAnchor(url, filename);
        }
      } else {
        // Regular download for browsers without File System Access API support
        downloadWithAnchor(url, filename);
      }
    } catch (error) {
      console.error("Error during download:", error);
      toast({
        title: "Download error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      URL.revokeObjectURL(url);
    }
  };
  
  const downloadWithAnchor = (url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };`;
  
  updatedContent = updatedContent.replace(oldHandleDownloadText, newHandleDownloadText);
  
  // Add FolderSelector component
  updatedContent = updatedContent.replace(
    '<CardContent>',
    '<CardContent>\n        <div className="mb-4">\n          <FolderSelector onFolderSelect={setDownloadFolder} />\n        </div>'
  );
  
  // Write the updated file
  fs.writeFile(resultsComponentPath, updatedContent, 'utf8', (writeErr) => {
    if (writeErr) {
      console.error('Error writing file:', writeErr);
      return;
    }
    console.log('Successfully updated TranscriptionResults component with folder selection!');
  });
});
