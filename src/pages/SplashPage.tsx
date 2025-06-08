import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to login after showing splash for 3 seconds
    const timer = setTimeout(() => {
      navigate("/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #101833 0%, #131B33 100%)",
      }}
    >
      {/* Centered Animation - Made responsive */}
      <div className="absolute w-full max-w-[1472px] transform -translate-x-1/2 left-1/2">
        <img
          src="/SplashPage/splashAnimation.gif"
          alt="Loading Animation"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Bottom Right Logo - Positioned at the bottom right corner */}
      <div className="absolute bottom-0 right-0 mb-4 mr-4 md:mb-6 md:mr-6 lg:mb-8 lg:mr-8 w-48">
        <img
          src="/SplashPage/logo.png"
          alt="Circuit Smith Logo"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}

export default SplashPage;
