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
      // OPFS의 루트 디렉토리를 가져옵니다.
      const rootDir = await navigator.storage.getDirectory();

      // 파일을 생성하고 쓰기 권한을 부여합니다.
      const fileHandle = await rootDir.getFileHandle(fileName, {
        // 파일이 이미 존재하면 덮어쓰기를 합니다.
        create: true,
      });

      // 파일에 쓸 수 있도록 writable stream을 생성합니다.
      const writableStream = await fileHandle.createWritable();

      // 파일에 내용을 씁니다.
      await writableStream.write(fileContent);

      // 파일을 닫습니다. - 이 시점에서 파일에 반영됩니다.
      await writableStream.close();
      setOutput(`File "${fileName}" written successfully!`);
    } catch (error) {
      setOutput(`Error writing file: ${error}`);
    }
  };

  // Function to read a file from the OPFS
  const readFile = async () => {
    try {
      // OPFS의 루트 디렉토리를 가져옵니다.
      const rootDir = await navigator.storage.getDirectory();

      // 파일을 읽기 위해 파일 핸들을 가져옵니다.
      const fileHandle = await rootDir.getFileHandle(fileName);

      // 파일을 가져와서 file object로 변환합니다.
      const file = await fileHandle.getFile();

      // 파일의 내용을 읽어옵니다.
      const text = await file.text();
      setOutput(`File content: ${text}`);
    } catch (error) {
      setOutput(`Error reading file: ${error}`);
    }
  };

  // Function to save file to OS file system
  const saveFileToOS = async () => {
    try {
      // OPFS의 루트 디렉토리를 가져옵니다.
      const rootDir = await navigator.storage.getDirectory();

      // 파일을 읽기 위해 파일 핸들을 가져옵니다.
      const fileHandle = await rootDir.getFileHandle(fileName);

      // 파일을 가져와서 Blob으로 변환합니다.
      const file = await fileHandle.getFile();

      // Blob을 생성합니다.
      const blob = new Blob([await file.text()], { type: "text/plain" });

      // File System Access API 지원 여부를 확인합니다.
      if ("showSaveFilePicker" in window) {
        const saveHandle = await (window as any).showSaveFilePicker({
          suggestedName: fileName,
        });
        const writableStream = await saveHandle.createWritable();
        await writableStream.write(blob);
        await writableStream.close();
        setOutput(`File "${fileName}" saved to OS!`);
      } else {
        // File System Access API를 지원하지 않는 경우 다른 방법으로 파일을 저장합니다.
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

  // OPFS에서 파일을 삭제하는 함수
  const deleteFile = async () => {
    try {
      const rootDir = await navigator.storage.getDirectory();
      await rootDir.removeEntry(fileName);
      setOutput(`File "${fileName}" deleted successfully!`);
    } catch (error) {
      setOutput(`Error deleting file: ${error}`);
    }
  };

  // OPFS에서 디렉토리를 생성하는 함수
  const createDirectory = async () => {
    try {
      const rootDir = await navigator.storage.getDirectory();
      await rootDir.getDirectoryHandle(directoryName, { create: true });
      setOutput(`Directory "${directoryName}" created successfully!`);
    } catch (error) {
      setOutput(`Error creating directory: ${error}`);
    }
  };

  // 외부로부터 파일을 OPFS로 가져오는 함수
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

  // 파일 선택 시 호출되는 함수
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
