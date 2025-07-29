import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "~/api/auth";
import { project } from "~/api/project";

interface Project {
  id: string;
  created_at: string;
  updated_at: string;
}

function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const validateAndLoadProjects = async () => {
      try {
        // Verify user authentication
        const authResponse = await authAPI.verifyToken();
        if (authResponse.success && authResponse.user) {
          setUser(authResponse.user);

          // Load user's projects from API
          try {
            const projectsResponse = await project.getProjectsByUserId(
              authResponse.user.id
            );
            if (projectsResponse.success) {
              setProjects(projectsResponse.projects || []);
            } else {
              console.error("Failed to load projects:", projectsResponse.error);
              setProjects([]);
            }
          } catch (projectError) {
            console.error("Error loading projects:", projectError);
            setProjects([]);
          }
        } else {
          // Redirect to login if not authenticated
          navigate("/login");
        }
      } catch (error) {
        console.error("Error loading projects:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    validateAndLoadProjects();
  }, [navigate]);

  const handleNewProject = () => {
    // Navigate to main app with a flag to start a new project
    navigate("/app?new=true");
  };

  const handleOpenProject = (projectId: string) => {
    // Navigate to main app with the specific project ID
    navigate(`/app?project=${projectId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C45E32] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="bg-[#C45E32] shadow-md">
        <div className="max-w-[1512px] h-[150px] w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-full">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src="/public/SplashPage/logo.png"
                alt="Circuit Smith Logo"
                className="h-24 w-auto"
              />
            </Link>

            {/* Brand Name */}
            <div className="hidden md:flex items-center justify-center flex-1">
              <span className="text-4xl md:text-6xl font-normal text-white font-squada tracking-wider">
                CIRCUITSMITH
              </span>
            </div>

            {/* User Info */}
            {user && (
              <div className="flex items-center space-x-6">
                <span className="text-white text-lg">
                  Welcome, {user.fullName}
                </span>
                <Link
                  to="/"
                  className="px-8 py-3 w-[180px] h-[60px] flex items-center justify-center rounded-[25px] border-[6px] border-white text-white hover:bg-white/10 transition font-medium text-xl"
                >
                  Back to Home
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Projects
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Manage your circuit designs and continue where you left off. Create
            new projects or open existing ones to start building amazing
            circuits.
          </p>
        </div>

        {/* New Project Button */}
        <div className="flex justify-center mb-12">
          <button
            onClick={handleNewProject}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-[#3B9EEE] text-white font-bold rounded-lg hover:bg-[#2A8BD9] transition-colors duration-200 text-lg"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create New Project
          </button>
        </div>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    ID: {project.id}
                  </span>
                </div>

                <div className="text-xs text-gray-500 space-y-1 mb-4">
                  <div>Created: {formatDate(project.created_at)}</div>
                  <div>Modified: {formatDate(project.updated_at)}</div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleOpenProject(project.id)}
                    className="flex-1 bg-[#C45E32] text-white py-2 px-4 rounded hover:bg-[#A54A2A] transition-colors duration-200 text-sm font-medium"
                  >
                    Open Project
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <svg
                className="w-24 h-24 mx-auto text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No projects yet
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by creating your first circuit design project.
              </p>
              <button
                onClick={handleNewProject}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#3B9EEE] text-white font-medium rounded-lg hover:bg-[#2A8BD9] transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Your First Project
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectsPage;
