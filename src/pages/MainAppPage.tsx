import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authAPI } from "../api/auth";
import Layout from "../components/Layout/Layout";
import { FileProvider } from "../contexts/FileContext";
import { CoordinateProvider } from "../contexts/CoordinateContext";
import { AutoRoutingProvider } from "../contexts/AutoRoutingContext";
import { ComponentProvider } from "../contexts/ComponentContext";
import { RightSidebarProvider } from "../contexts/RightSidebarContext";
import { CanvasRefreshProvider } from "../contexts/CanvasRefreshContext";
import { ThemeProvider } from "../contexts/ThemeContext";

function MainAppPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
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

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

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

  return (
    // Wrap with ThemeProvider to ensure useTheme has access to context
    <ThemeProvider>
      <FileProvider>
        <CoordinateProvider>
          <AutoRoutingProvider>
            <ComponentProvider>
              <RightSidebarProvider>
                <CanvasRefreshProvider>
                  <Layout />
                </CanvasRefreshProvider>
              </RightSidebarProvider>
            </ComponentProvider>
          </AutoRoutingProvider>
        </CoordinateProvider>
      </FileProvider>
    </ThemeProvider>
  );
}

export default MainAppPage;
