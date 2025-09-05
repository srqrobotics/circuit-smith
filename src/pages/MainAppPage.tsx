import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authAPI } from "../api/auth";
import Layout from "../components/Layout/Layout";
import { FileProvider } from "../contexts/FileContext";
import { CoordinateProvider } from "../contexts/CoordinateContext";
import { AutoRoutingProvider } from "../contexts/AutoRoutingContext";
import { ComponentProvider } from "../contexts/ComponentContext";
import { RightSidebarProvider } from "../contexts/RightSidebarContext";
import { CanvasRefreshProvider } from "../contexts/CanvasRefreshContext";
import { CanvasStateProvider } from "../contexts/CanvasStateContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { ProjectProvider } from "../contexts/ProjectContext";

function MainAppPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [, setUser] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [authError, setAuthError] = useState("");
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isNewProject, setIsNewProject] = useState(false);

  const projectInitRanRef = useRef(false);
  const authValidateRanRef = useRef(false);

  // Get project ID from URL parameters
  const urlProjectId = searchParams.get("project");
  const urlIsNewProject = searchParams.get("new") === "true";

  console.log("MainAppPage - Project ID from URL:", urlProjectId);
  console.log("MainAppPage - Is new project:", urlIsNewProject);

  // Initialize project ID from URL or create new project
  useEffect(() => {
    if (projectInitRanRef.current) return; // guard against double-invoke (e.g., React.StrictMode)
    projectInitRanRef.current = true;
    const initializeProject = async () => {
      if (urlIsNewProject && !urlProjectId) {
        // Create a new project
        try {
          console.log("Creating new project...");
          const { project } = await import("../api/project");
          const saveResponse = await project.saveProject(
            "{}",
            "// New project",
            "0"
          );

          if (saveResponse && saveResponse.projectId) {
            const newProjectId = saveResponse.projectId;
            setCurrentProjectId(newProjectId);
            setIsNewProject(true);

            // Update URL with the new project ID
            const newUrl = `/app?project=${newProjectId}`;
            navigate(newUrl, { replace: true });
            console.log(`Created new project with ID: ${newProjectId}`);
          }
        } catch (error) {
          console.error("Error creating new project:", error);
        }
      } else if (urlProjectId) {
        // Load existing project
        setCurrentProjectId(urlProjectId);
        setIsNewProject(false);
        console.log(`Loading existing project: ${urlProjectId}`);
      }
    };

    initializeProject();
  }, [urlIsNewProject, urlProjectId, navigate]);

  useEffect(() => {
    if (authValidateRanRef.current) return; // guard against double-invoke
    authValidateRanRef.current = true;
    const validateAuthentication = async () => {
      try {
        const response = await authAPI.verifyToken();
        if (response.success && response.user) {
          setUser(response.user);
        } else {
          setAuthError("Authentication required");
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        }
      } catch (error) {
        console.error("Authentication validation failed:", error);
        setAuthError("Authentication failed. Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } finally {
        setIsValidating(false);
      }
    };

    validateAuthentication();
  }, [navigate]);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C45E32] mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">
            Validating authentication...
          </div>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">{authError}</div>
          <div className="text-gray-500">
            You will be redirected to login shortly.
          </div>
        </div>
      </div>
    );
  }

  // Optional: delay render until projectId resolved (if new project requested)
  if (urlIsNewProject && !currentProjectId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C45E32] mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Creating project...</div>
        </div>
      </div>
    );
  }

  return (
    // Wrap with ThemeProvider to ensure useTheme has access to context
    <ThemeProvider>
      <FileProvider>
        <CoordinateProvider>
          <AutoRoutingProvider>
            <ComponentProvider>
              <ProjectProvider
                initialProjectId={currentProjectId}
                initialIsNew={isNewProject}
              >
                <RightSidebarProvider>
                  <CanvasRefreshProvider>
                    <CanvasStateProvider>
                      <Layout />
                    </CanvasStateProvider>
                  </CanvasRefreshProvider>
                </RightSidebarProvider>
              </ProjectProvider>
            </ComponentProvider>
          </AutoRoutingProvider>
        </CoordinateProvider>
      </FileProvider>
    </ThemeProvider>
  );
}

export default MainAppPage;
