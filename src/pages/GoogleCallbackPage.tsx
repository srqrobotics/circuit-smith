import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function GoogleCallbackPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if authentication was successful
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get("error");

        if (error) {
          console.error("Google auth error:", error);
          navigate("/login?error=google_auth_failed");
          return;
        }

        // If no error, the backend should have set the httpOnly cookie
        // We can verify by calling the validate endpoint
        login();
        navigate("/landing");
      } catch (error) {
        console.error("Google callback error:", error);
        navigate("/login?error=auth_failed");
      }
    };

    handleCallback();
  }, [login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-xl mb-4">Completing Google authentication...</div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C45E32] mx-auto"></div>
      </div>
    </div>
  );
}

export default GoogleCallbackPage;
