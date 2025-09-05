import React, { useState, useEffect } from "react";
import type { EditorProps } from "@monaco-editor/react";
import { useFile } from "~/contexts/FileContext";
import { useComponents } from "~/contexts/ComponentContext";
import { useRightSidebar } from "~/contexts/RightSidebarContext";
import { useCanvasState } from "~/contexts/CanvasStateContext";
import { FaCode, FaRobot } from "react-icons/fa";
import { gptAPI } from "~/api/gpt";

export default function RightSidebar() {
  const [Editor, setEditor] = useState<React.ComponentType<EditorProps> | null>(
    null
  );
  const [isMounted, setIsMounted] = useState(false);
  const { selectedFile, setSelectedFile } = useFile();
  const { selectedComponents } = useComponents();
  const { canvasState } = useCanvasState();
  const [isLoading, setIsLoading] = useState(false);
  const {
    sidebarState: {
      code,
      generatedPrompt,
      activeTab,
      isGenerating,
      selectedApplicationIndex,
    },
    setCode,
    setGeneratedPrompt,
    setActiveTab,
    setIsGenerating,
    setSelectedApplicationIndex,
    setGeneratedConfig,
    setUnsavedChanges,
  } = useRightSidebar();

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
        // Check if this is a project-specific file
        const projectMatch = selectedFile.match(/^\.\/projects\/(\d+)\/(.*)/);

        if (projectMatch) {
          // This is a project-specific file, use backend API
          const [, projectId, filename] = projectMatch;
          const BASE_URL =
            import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

          try {
            const response = await fetch(
              `${BASE_URL}/api/file-content?path=${encodeURIComponent(filename)}&projectId=${projectId}`,
              {
                credentials: "include",
              }
            );
            const data = await response.json();
            if (data.content !== undefined) {
              setCode(data.content);
            } else if (data.error) {
              console.warn("Project file not found, falling back to default");
              // Fall back to default file loading
              await loadDefaultFile();
            }
          } catch (error) {
            console.error(
              "Error loading project file, falling back to default:",
              error
            );
            // Fall back to default file loading
            await loadDefaultFile();
          }
        } else {
          // Regular file, use Remix API
          const response = await fetch(
            `./api/file-content?path=${encodeURIComponent(selectedFile)}`
          );
          const data = await response.json();
          if (data.content !== undefined) {
            setCode(data.content);
          }
        }
      } else {
        await loadDefaultFile();
      }
    } catch (error) {
      console.error("Error loading file:", error);
      await loadDefaultFile();
    } finally {
      setIsLoading(false);
    }
  }

  async function loadDefaultFile() {
    try {
      const response = await fetch("./projects/defaultCode.ino");
      const text = await response.text();
      let modText = text.replace(/^\[|\]$/g, "");
      const lines = modText.split("\n");
      const modifiedLines = lines
        .map((line) => line.slice(3, -2))
        .map((line) => line.replace(/\\"/g, '"'));
      modifiedLines.push("}");
      const mergedLines = modifiedLines.join("\n");
      setCode(mergedLines);
    } catch (error) {
      console.error("Error loading default file:", error);
      setCode("// Error loading code file");
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
    const projectsIndex = selectedFile.indexOf("./projects/");
    if (projectsIndex === -1) return "";
    const relativePath = selectedFile.slice(projectsIndex + 15);
    const parts = relativePath.split("/");
    return parts.slice(0, -1).join("/");
  };

  const handleGeneratePrompt = async () => {
    if (selectedComponents.length === 0) {
      setGeneratedPrompt({
        error: "Please select at least one component from the left sidebar.",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await gptAPI.generatePrompt(selectedComponents);

      const responseJson = await response;

      // Handle the nested "applications" object
      if (
        responseJson &&
        responseJson.applications &&
        Array.isArray(responseJson.applications.applications)
      ) {
        setGeneratedPrompt({
          applications: responseJson.applications.applications,
        });
      } else {
        setGeneratedPrompt({
          error: "Unexpected response format. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error generating prompt:", error);
      setGeneratedPrompt({
        error: "Error generating prompt. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplicationSelect = (index: number) => {
    setSelectedApplicationIndex(
      selectedApplicationIndex === index ? null : index
    );
  };

  const handleGenerateWiringAndCode = async () => {
    // Use canvas components instead of selected components
    const canvasComponents = canvasState.components;
    if (canvasComponents.length === 0) {
      setGeneratedPrompt({
        error: "Please add at least one component to the canvas.",
      });
      return;
    }

    if (selectedApplicationIndex === null || !generatedPrompt?.applications) {
      setGeneratedPrompt({
        error: "Please select an application from the list.",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const selectedApp =
        generatedPrompt.applications[selectedApplicationIndex];

      // Load component data to get pin information
      const componentDataPromises = canvasComponents.map(async (component) => {
        const componentId = component.id;
        try {
          // Try to load from devBible.json first
          const devBibleResponse = await fetch("./packages/devBible.json");
          if (devBibleResponse.ok) {
            const devBibleData = await devBibleResponse.json();
            const component = devBibleData.components?.find(
              (c: any) => c.id === componentId
            );
            if (component && component["pin-map"]?.src) {
              const pinMapResponse = await fetch(component["pin-map"].src);
              const pinMapData = await pinMapResponse.json();
              return {
                id: componentId,
                name: component.name,
                pins: pinMapData["digital-pins"]?.id || [],
              };
            }
          }

          // If not found, try sensorBible.json
          const sensorBibleResponse = await fetch(
            "./packages/sensorBible.json"
          );
          if (sensorBibleResponse.ok) {
            const sensorBibleData = await sensorBibleResponse.json();
            const component = sensorBibleData.components?.find(
              (c: any) => c.id === componentId
            );
            if (component && component["pin-map"]?.src) {
              const pinMapResponse = await fetch(component["pin-map"].src);
              const pinMapData = await pinMapResponse.json();
              return {
                id: componentId,
                name: component.name,
                pins: pinMapData["digital-pins"]?.id || [],
              };
            }
          }

          return {
            id: componentId,
            name: componentId,
            pins: [],
          };
        } catch (error) {
          console.error(
            `Error loading component data for ${componentId}:`,
            error
          );
          return {
            id: componentId,
            name: componentId,
            pins: [],
          };
        }
      });

      const componentsWithPins = await Promise.all(componentDataPromises);

      // Format component information with pins
      const componentsInfo = componentsWithPins
        .map(
          (comp) =>
            `- ${comp.name} (${comp.id}): Available pins: ${comp.pins.join(", ")}`
        )
        .join("\n");

      const response = await gptAPI.generateCode(componentsInfo, selectedApp);
      if (!response || !response.code) {
        setGeneratedPrompt({
          error: "Failed to generate wiring and code. Please try again.",
        });
        return;
      }

      const data = await response;
      const result = data.code;
      console.log("Parsed JSON from GPT:", result);

      const componentsArr = Array.isArray(result.components)
        ? result.components
        : [];
      const wireArr = Array.isArray(result.wire) ? result.wire : [];
      const arduinoCodeStr =
        typeof result.arduinoCode === "string" ? result.arduinoCode : "";

      if (
        componentsArr.length === 0 ||
        wireArr.length === 0 ||
        !arduinoCodeStr
      ) {
        setGeneratedPrompt({
          error: "Incomplete response from GPT. Please try again.",
        });
        return;
      }

      const jsonString = JSON.stringify(
        { components: componentsArr, wire: wireArr },
        null,
        2
      );
      const cppString = arduinoCodeStr;

      if (jsonString && cppString) {
        // Store generated config/code locally only; no network persistence
        setGeneratedConfig(jsonString);
        setCode(cppString);
        setActiveTab("code");
        setUnsavedChanges(true);
        // Do NOT create / save project automatically anymore
        console.log("Generation complete. Changes are UNSAVED until user clicks Save.");
        // Force editor refresh logic remains unchanged below
        const currentFile = selectedFile;
        setSelectedFile(null);
        setTimeout(() => {
          setSelectedFile(currentFile || "./projects/defaultCode.ino");
        }, 300);
      } else {
        setGeneratedPrompt({
          error: "Failed to generate wiring and code. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error generating wiring and code:", error);
      setGeneratedPrompt({
        error: "Error generating wiring and code. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderGeneratedPrompt = () => {
    if (!generatedPrompt) {
      return (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
          {isGenerating ? (
            <div>Generating prompt...</div>
          ) : (
            <div>
              No prompt generated yet. Select components and click "Generate
              Ideas".
            </div>
          )}
        </div>
      );
    }

    if (generatedPrompt.error) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded">
          <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">
            Error:
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300">
            {generatedPrompt.error}
          </p>
        </div>
      );
    }

    return (
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
          Suggested Applications:
        </h3>
        <div className="space-y-4">
          {generatedPrompt.applications?.map((app: any, index: number) => (
            <div
              key={index}
              className={`bg-white dark:bg-gray-700 p-4 rounded shadow-sm cursor-pointer transition-all duration-200 ${
                selectedApplicationIndex === index
                  ? "ring-2 ring-green-500 dark:ring-green-400"
                  : "hover:ring-2 hover:ring-blue-200 dark:hover:ring-blue-800"
              }`}
              onClick={() => handleApplicationSelect(index)}
            >
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                {app.name}
              </h4>
              {selectedApplicationIndex === index && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {app.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          className={`flex-1 py-2 flex items-center justify-center ${
            activeTab === "prompt"
              ? "bg-gray-200 dark:bg-gray-700"
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
          onClick={() => setActiveTab("prompt")}
        >
          <FaRobot className="mr-2" />
          <span>Idea Lab</span>
        </button>

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
              Idea Lab
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Select components from the left sidebar, then generate project
              ideas.
            </p>
            <div className="flex space-x-2">
              <button
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleGeneratePrompt}
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : "Generate Ideas"}
              </button>
              <button
                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleGenerateWiringAndCode}
                disabled={
                  !generatedPrompt ||
                  !!generatedPrompt.error ||
                  selectedApplicationIndex === null ||
                  isGenerating
                }
              >
                {isGenerating ? "Generating..." : "Generate Wiring & Code"}
              </button>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {renderGeneratedPrompt()}
          </div>
        </div>
      )}
    </div>
  );
}
