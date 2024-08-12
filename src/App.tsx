import { useState } from "react";

import "./App.css";

function App() {
  const [fileName, setFileName] = useState("example.txt");
  const [fileContent, setFileContent] = useState("Hello, OPFS!");
  const [output, setOutput] = useState<string | null>(null);
  const [directoryName, setDirectoryName] = useState("myDirectory");

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

  // Function to delete a file from the OPFS
  const deleteFile = async () => {
    try {
      const rootDir = await navigator.storage.getDirectory();
      await rootDir.removeEntry(fileName);
      setOutput(`File "${fileName}" deleted successfully!`);
    } catch (error) {
      setOutput(`Error deleting file: ${error}`);
    }
  };

  // Function to create a directory in the OPFS
  const createDirectory = async () => {
    try {
      const rootDir = await navigator.storage.getDirectory();
      await rootDir.getDirectoryHandle(directoryName, { create: true });
      setOutput(`Directory "${directoryName}" created successfully!`);
    } catch (error) {
      setOutput(`Error creating directory: ${error}`);
    }
  };

  // Function to import an external file into the OPFS
  const importFileToOPFS = async (file: File) => {
    try {
      const rootDir = await navigator.storage.getDirectory();
      const dirHandle = await rootDir.getDirectoryHandle(directoryName, {
        create: true,
      });
      const fileHandle = await dirHandle.getFileHandle(file.name, {
        create: true,
      });
      const writableStream = await fileHandle.createWritable();
      await writableStream.write(file);
      await writableStream.close();
      setFileName(file.name);
      setOutput(
        `File "${file.name}" imported successfully into "${directoryName}"!`
      );
    } catch (error) {
      setOutput(`Error importing file: ${error}`);
    }
  };

  // Function to handle file selection from the input
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      importFileToOPFS(files[0]);
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
      <button onClick={deleteFile}>Delete File</button>
      <button onClick={createDirectory}>Create Directory</button>
      <div>
        <label>
          Import File:
          <input type="file" onChange={handleFileSelect} />
        </label>
      </div>
      {output && <p>{output}</p>}
    </div>
  );
}

export default App;
