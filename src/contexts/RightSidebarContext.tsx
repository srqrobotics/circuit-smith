import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface RightSidebarState {
  code: string;
  generatedPrompt: any;
  activeTab: "code" | "prompt";
  isGenerating: boolean;
  selectedApplicationIndex: number | null;
  generatedConfig: string | null; // Add this to store the generated JSON configuration
  currentProjectId: string | null; // Add this to store the current project ID
}

interface RightSidebarContextType {
  sidebarState: RightSidebarState;
  setCode: (code: string) => void;
  setGeneratedPrompt: (prompt: any) => void;
  setActiveTab: (tab: "code" | "prompt") => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setSelectedApplicationIndex: (index: number | null) => void;
  setGeneratedConfig: (config: string | null) => void; // Add this method
  setCurrentProjectId: (projectId: string | null) => void; // Add this method
}

const RightSidebarContext = createContext<RightSidebarContextType | undefined>(
  undefined
);

export function RightSidebarProvider({ children }: { children: ReactNode }) {
  const [sidebarState, setSidebarState] = useState<RightSidebarState>({
    code: "",
    generatedPrompt: null,
    activeTab: "code",
    isGenerating: false,
    selectedApplicationIndex: null,
    generatedConfig: null,
    currentProjectId: null,
  });

  const setCode = (code: string) => {
    setSidebarState((prev) => ({ ...prev, code }));
  };

  const setGeneratedPrompt = (prompt: any) => {
    setSidebarState((prev) => ({
      ...prev,
      generatedPrompt: prompt,
      selectedApplicationIndex: null,
    }));
  };

  const setActiveTab = (tab: "code" | "prompt") => {
    setSidebarState((prev) => ({ ...prev, activeTab: tab }));
  };

  const setIsGenerating = (isGenerating: boolean) => {
    setSidebarState((prev) => ({ ...prev, isGenerating }));
  };

  const setSelectedApplicationIndex = (index: number | null) => {
    setSidebarState((prev) => ({ ...prev, selectedApplicationIndex: index }));
  };

  const setGeneratedConfig = (config: string | null) => {
    setSidebarState((prev) => ({ ...prev, generatedConfig: config }));
  };

  const setCurrentProjectId = (projectId: string | null) => {
    setSidebarState((prev) => ({ ...prev, currentProjectId: projectId }));
  };

  return (
    <RightSidebarContext.Provider
      value={{
        sidebarState,
        setCode,
        setGeneratedPrompt,
        setActiveTab,
        setIsGenerating,
        setSelectedApplicationIndex,
        setGeneratedConfig,
        setCurrentProjectId,
      }}
    >
      {children}
    </RightSidebarContext.Provider>
  );
}

export function useRightSidebar() {
  const context = useContext(RightSidebarContext);
  if (context === undefined) {
    throw new Error(
      "useRightSidebar must be used within a RightSidebarProvider"
    );
  }
  return context;
}
