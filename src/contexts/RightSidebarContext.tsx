import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useProject } from "./ProjectContext";

interface RightSidebarState {
  code: string;
  generatedPrompt: any;
  activeTab: "code" | "prompt";
  isGenerating: boolean;
  selectedApplicationIndex: number | null;
  generatedConfig: string | null; // Add this to store the generated JSON configuration
  currentProjectId: string | null; // Add this to store the current project ID
  isNewProject: boolean; // Add this to track if this is a newly created project
  unsavedChanges: boolean; // new flag
}

interface RightSidebarContextType {
  sidebarState: RightSidebarState;
  setCode: (code: string, markUnsaved?: boolean) => void;
  setGeneratedPrompt: (prompt: any) => void;
  setActiveTab: (tab: "code" | "prompt") => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setSelectedApplicationIndex: (index: number | null) => void;
  setGeneratedConfig: (config: string | null) => void; // Add this method
  setCurrentProjectId: (projectId: string | null) => void; // Add this method
  clearCurrentProject: () => void; // Add this method to clear project state
  updateProjectIdInUrl: (projectId: string | null) => void; // Add this method to update URL
  setUnsavedChanges: (dirty: boolean) => void; // new setter
}

const RightSidebarContext = createContext<RightSidebarContextType | undefined>(
  undefined
);

// Removed props for initialProjectId/isNewProject – now sourced from ProjectContext
export function RightSidebarProvider({ children }: { children: ReactNode }) {
  const { projectId, isNew, setProject, clearProject } = useProject();

  const [sidebarState, setSidebarState] = useState<RightSidebarState>({
    code: "",
    generatedPrompt: null,
    activeTab: "code",
    isGenerating: false,
    selectedApplicationIndex: null,
    generatedConfig: null,
    currentProjectId: projectId,
    isNewProject: isNew,
    unsavedChanges: false,
  });

  useEffect(() => {
    setSidebarState((prev) => ({
      ...prev,
      currentProjectId: projectId,
      isNewProject: isNew,
    }));
  }, [projectId, isNew]);

  const setCode = (code: string, markUnsaved: boolean = true) => {
    // Clean log for code updates
    if (code) {
      console.log("[RightSidebarContext] setCode: code updated, length:", code.length, "markUnsaved:", markUnsaved);
    }
    setSidebarState((prev) => ({ ...prev, code, unsavedChanges: markUnsaved }));
  };

  const setGeneratedPrompt = (prompt: any) =>
    setSidebarState((prev) => ({
      ...prev,
      generatedPrompt: prompt,
      selectedApplicationIndex: null,
      unsavedChanges: true,
    }));

  const setActiveTab = (tab: "code" | "prompt") =>
    setSidebarState((prev) => ({ ...prev, activeTab: tab }));

  const setIsGenerating = (isGenerating: boolean) =>
    setSidebarState((prev) => ({ ...prev, isGenerating }));

  const setSelectedApplicationIndex = (index: number | null) =>
    setSidebarState((prev) => ({ ...prev, selectedApplicationIndex: index }));

  const setGeneratedConfig = (config: string | null) =>
    setSidebarState((prev) => ({ ...prev, generatedConfig: config, unsavedChanges: true }));

  const setCurrentProjectId = (id: string | null) => {
    if (id) {
      setProject(id, false);
    } else {
      clearProject();
    }
  };

  const setUnsavedChanges = (dirty: boolean) =>
    setSidebarState((prev) => ({ ...prev, unsavedChanges: dirty }));

  const clearCurrentProject = () => {
    clearProject();
    setSidebarState((prev) => ({
      ...prev,
      currentProjectId: null,
      generatedConfig: null,
      code: "",
      isNewProject: false,
    }));
  };

  const updateProjectIdInUrl = (id: string | null) => {
    if (typeof window === "undefined") return;
    // Using HashRouter: keep search params inside hash fragment only
    if (id) {
      const newHash = `/app?project=${id}`;
      if (window.location.hash !== `#${newHash}`) {
        window.history.replaceState({}, "", `${window.location.pathname}#${newHash}`);
      }
    } else {
      const newHash = `/app`;
      if (window.location.hash !== `#${newHash}`) {
        window.history.replaceState({}, "", `${window.location.pathname}#${newHash}`);
      }
    }
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
        clearCurrentProject,
        updateProjectIdInUrl,
        setUnsavedChanges,
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