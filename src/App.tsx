import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [fileName, setFileName] = useState("example.txt");
  const [fileContent, setFileContent] = useState("Hello, OPFS!");
  const [output, setOutput] = useState<string | null>(null);

  // Function to write a file to the OPFS
  const writeFile = async () => {
    try {
      const rootDir = await navigator.storage.getDirectory();
      const fileHandle = await rootDir.getFileHandle(fileName, {
        create: true,
      });
      const writableStream = await fileHandle.createWritable();
      await writableStream.write(fileContent);
      await writableStream.close();
      setOutput(`File "${fileName}" written successfully!`);
    } catch (error) {
      setOutput(`Error writing file: ${error}`);
    }
  };

  // Function to read a file from the OPFS
  const readFile = async () => {
    try {
      const rootDir = await navigator.storage.getDirectory();
      const fileHandle = await rootDir.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      const text = await file.text();
      setOutput(`File content: ${text}`);
    } catch (error) {
      setOutput(`Error reading file: ${error}`);
    }
  };

  // Function to save file to OS file system
  const saveFileToOS = async () => {
    try {
      const rootDir = await navigator.storage.getDirectory();
      const fileHandle = await rootDir.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      const blob = new Blob([await file.text()], { type: "text/plain" });

      // Check if the File System Access API is supported
      if ("showSaveFilePicker" in window) {
        const saveHandle = await (window as any).showSaveFilePicker({
          suggestedName: fileName,
        });
        const writableStream = await saveHandle.createWritable();
        await writableStream.write(blob);
        await writableStream.close();
        setOutput(`File "${fileName}" saved to OS!`);
      } else {
        // Fallback to using a download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        setOutput(`File "${fileName}" downloaded!`);
      }
    } catch (error) {
      setOutput(`Error saving file: ${error}`);
    }
  };

  return (
    <div>
      <h1>Origin Private File System Test</h1>
      <div>
        <label>
          File Name:
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          File Content:
          <textarea
            value={fileContent}
            onChange={(e) => setFileContent(e.target.value)}
          />
        </label>
      </div>
      <button onClick={writeFile}>Write File</button>
      <button onClick={readFile}>Read File</button>
      <button onClick={saveFileToOS}>Save File to OS</button>
      {output && <p>{output}</p>}
    </div>
  );
}

export default App;
