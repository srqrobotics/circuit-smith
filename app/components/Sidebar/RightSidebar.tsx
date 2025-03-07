import React, { useState, useEffect } from "react";
import type { EditorProps } from "@monaco-editor/react";
import { useFile } from "~/contexts/FileContext";

export default function RightSidebar() {
  const [code, setCode] = useState("");
  const [Editor, setEditor] = useState<React.ComponentType<EditorProps> | null>(
    null
  );
  const [isMounted, setIsMounted] = useState(false);
  const { selectedFile, setSelectedFile } = useFile();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    import("@monaco-editor/react").then((module) => {
      setEditor(() => module.default);
    });
  }, []);

  async function loadFileContent() {
    setIsLoading(true);
    try {
      if (selectedFile) {
        const response = await fetch(
          `/api/file-content?path=${encodeURIComponent(selectedFile)}`
        );
        const data = await response.json();
        if (data.content !== undefined) {
          setCode(data.content);
        }
      } else {
        const response = await fetch("/projects/defaultCode.ino");
        const text = await response.text();
        // console.log("text: \n", text);
        let modText = text.replace(/^\[|\]$/g, "");
        const lines = modText.split("\n");
        const modifiedLines = lines
          .map((line) => line.slice(3, -2))
          .map((line) => line.replace(/\\"/g, '"'));

        modifiedLines.forEach((line, index) => {
          console.log(`Modified Line ${index + 1}: ${line}`);
        });
        modifiedLines.push("}"); // Add closing brace to the end of modifiedLines

        const mergedLines = modifiedLines.join("\n");
        setCode(mergedLines);
      }
    } catch (error) {
      console.error("Error loading file:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadFileContent();
  }, [selectedFile]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  const getFileName = () => {
    if (!selectedFile) return "defaultCode.ino";
    const parts = selectedFile.split("/");
    return parts[parts.length - 1];
  };

  const getFilePath = () => {
    if (!selectedFile) return "";
    const projectsIndex = selectedFile.indexOf("/projects/");
    if (projectsIndex === -1) return "";

    const relativePath = selectedFile.slice(projectsIndex + 15); // 'public/projects/'.length = 15
    const parts = relativePath.split("/");
    return parts.slice(0, -1).join("/");
  };

  return (
    <div className="w-96 border-l border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800 min-h-0">
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">
          Code Editor
        </h2>
        {isLoading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : (
          <div className="text-sm flex items-center mt-0.5 min-h-[1.25rem]">
            <span className="text-gray-500 dark:text-gray-400 truncate">
              {getFilePath()}
            </span>
            {getFilePath() && (
              <span className="mx-1 text-gray-500 dark:text-gray-400">/</span>
            )}
            <span className="text-gray-700 dark:text-gray-300 truncate font-medium">
              {getFileName()}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        {isMounted && Editor ? (
          <Editor
            height="100%"
            defaultLanguage="cpp"
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: "on",
              roundedSelection: false,
              scrollBeyondLastLine: false,
              readOnly: false,
              automaticLayout: true,
            }}
          />
        ) : (
          <div className="p-4 font-mono text-sm whitespace-pre-wrap text-gray-900 dark:text-gray-100">
            {code}
          </div>
        )}
      </div>
    </div>
  );
}
