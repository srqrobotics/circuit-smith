import GoogleCallbackPage from "./pages/GoogleCallbackPage";
import React from "react";
import { Routes, Route } from "react-router-dom";
import SplashPage from "./pages/SplashPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import LandingPage from "./pages/LandingPage";
import MainAppPage from "./pages/MainAppPage";
import NotFoundPage from "./pages/NotFoundPage";
import "./assets/styles/index.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SplashPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/app/*" element={<MainAppPage />} />
      <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
