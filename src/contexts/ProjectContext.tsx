import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

interface ProjectContextValue {
  projectId: string | null;
  isNew: boolean;
  setProject: (id: string, isNew: boolean) => void;
  clearProject: () => void;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

interface ProjectProviderProps {
  children: ReactNode;
  initialProjectId?: string | null;
  initialIsNew?: boolean;
}

export function ProjectProvider({
  children,
  initialProjectId = null,
  initialIsNew = false,
}: ProjectProviderProps) {
  const [projectId, setProjectId] = useState<string | null>(initialProjectId);
  const [isNew, setIsNew] = useState<boolean>(initialIsNew);

  const setProject = useCallback((id: string, newFlag: boolean) => {
    setProjectId(id);
    setIsNew(newFlag);
  }, []);

  const clearProject = useCallback(() => {
    setProjectId(null);
    setIsNew(false);
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        projectId,
        isNew,
        setProject,
        clearProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used within a ProjectProvider");
  return ctx;
}
