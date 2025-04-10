import React, { useState, useEffect } from "react";
import type { EditorProps } from "@monaco-editor/react";
import { useFile } from "~/contexts/FileContext";
import { useComponents } from "~/contexts/ComponentContext";
import { FaCode, FaRobot } from "react-icons/fa";

export default function RightSidebar() {
  const [code, setCode] = useState("");
  const [Editor, setEditor] = useState<React.ComponentType<EditorProps> | null>(
    null
  );
  const [isMounted, setIsMounted] = useState(false);
  const { selectedFile, setSelectedFile } = useFile();
  const { selectedComponents } = useComponents();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "prompt">("code");
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

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
        let modText = text.replace(/^\[|\]$/g, "");
        const lines = modText.split("\n");
        const modifiedLines = lines
          .map((line) => line.slice(3, -2))
          .map((line) => line.replace(/\\"/g, '"'));
        modifiedLines.push("}");
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
    const relativePath = selectedFile.slice(projectsIndex + 15);
    const parts = relativePath.split("/");
    return parts.slice(0, -1).join("/");
  };

  const handleGeneratePrompt = async () => {
    if (selectedComponents.length === 0) {
      setGeneratedPrompt(
        "Please select at least one component from the left sidebar."
      );
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate API call for prompt generation
      // In a real implementation, this would call your actual API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const prompt = `Generate Arduino code for a project using the following components: ${selectedComponents.join(", ")}. 
      The code should initialize all components, set up necessary connections, and implement basic functionality.`;

      setGeneratedPrompt(prompt);
    } catch (error) {
      console.error("Error generating prompt:", error);
      setGeneratedPrompt("Error generating prompt. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyPrompt = () => {
    if (generatedPrompt) {
      setCode(generatedPrompt);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          className={`flex-1 py-2 flex items-center justify-center ${
            activeTab === "code"
              ? "bg-gray-200 dark:bg-gray-700"
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
          onClick={() => setActiveTab("code")}
        >
          <FaCode className="mr-2" />
          <span>Code Editor</span>
        </button>
        <button
          className={`flex-1 py-2 flex items-center justify-center ${
            activeTab === "prompt"
              ? "bg-gray-200 dark:bg-gray-700"
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
          onClick={() => setActiveTab("prompt")}
        >
          <FaRobot className="mr-2" />
          <span>Prompt Generator</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "code" ? (
        <>
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
                  <span className="mx-1 text-gray-500 dark:text-gray-400">
                    /
                  </span>
                )}
                <span className="text-gray-700 dark:text-gray-300 truncate font-medium">
                  {getFileName()}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 relative">
            {isMounted && Editor ? (
              <div className="absolute inset-0">
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
              </div>
            ) : (
              <div className="p-4 font-mono text-sm whitespace-pre-wrap text-gray-900 dark:text-gray-100">
                {code}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Prompt Generator
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Select components from the left sidebar, then generate a prompt
              for your project.
            </p>
            <div className="flex space-x-2">
              <button
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
                onClick={handleGeneratePrompt}
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : "Generate Prompt"}
              </button>
              <button
                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
                onClick={handleApplyPrompt}
                disabled={!generatedPrompt}
              >
                Apply to Code
              </button>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {generatedPrompt ? (
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Generated Prompt:
                </h3>
                <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {generatedPrompt}
                </pre>
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                {isGenerating ? (
                  <div>Generating prompt...</div>
                ) : (
                  <div>
                    No prompt generated yet. Select components and click
                    "Generate Prompt".
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
