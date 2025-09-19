import React, { useState, useEffect } from "react";
import type { EditorProps } from "@monaco-editor/react";
import { useComponents } from "~/contexts/ComponentContext";
import { useRightSidebar } from "~/contexts/RightSidebarContext";
import { useCanvasState } from "~/contexts/CanvasStateContext";
import { FaCode, FaRobot } from "react-icons/fa";
import { gptAPI } from "~/api/gpt";

export default function RightSidebar() {
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
  // Debug: Log code value on every render
  console.log("[RightSidebar] code from context:", code);
  const [Editor, setEditor] = useState<React.ComponentType<EditorProps> | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { selectedComponents } = useComponents();
  const { canvasState } = useCanvasState();
  // All code is now loaded from the database/project API only. No local file loading.

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value, true); // Mark as unsaved when user edits
    }
  };

  // No file name/path logic needed; code is always from the database.

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
        // No longer reset selectedFile to force refresh; setCode is enough
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

  useEffect(() => {
    setIsMounted(true);
    console.log("[RightSidebar] useEffect: setting isMounted to true");
    import("@monaco-editor/react").then((module) => {
      setEditor(() => module.default);
      console.log("[RightSidebar] Monaco Editor loaded:", !!module.default);
    }).catch((err) => {
      console.error("[RightSidebar] Failed to load Monaco Editor:", err);
    });
  }, []);

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
            {/* No loading state or file path/name; code is always from the database */}
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
