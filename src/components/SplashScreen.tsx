import React from "react";

function SplashScreen() {
  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Left section with different background */}
      <div
        className="absolute h-full w-3/7 left-0 top-0"
        style={{ background: "#233B4F" }}
      />

      {/* Main background */}
      <div
        className="absolute h-full right-0 top-0"
        style={{
          width: "calc(100% )",
          background: "linear-gradient(180deg, #101833 0%, #131B33 100%)",
        }}
      />

      {/* Content container */}
      <div className="h-full w-full flex flex-col items-center justify-center relative">
        {/* Centered Animation - Made responsive */}
        <div className="absolute w-full max-w-[1472px] transform -translate-x-1/2 left-1/2">
          <img
            src={`${import.meta.env.BASE_URL}SplashPage/splashAnimation.gif`}
            alt="Loading Animation"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Bottom Right Logo - Positioned at the bottom right corner */}
        <div className="absolute bottom-0 right-0 mb-4 mr-4 md:mb-6 md:mr-6 lg:mb-8 lg:mr-8 w-48">
          <img
            src={`${import.meta.env.BASE_URL}SplashPage/logo.png`}
            alt="Circuit Smith Logo"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;
