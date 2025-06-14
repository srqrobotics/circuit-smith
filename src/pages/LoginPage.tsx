import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authAPI, LoginData } from "../api/auth";
import BackgroundEllipses from "../components/common/BackgroundEllipses";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authAPI.login(formData);
      if (response.success) {
        login();
        navigate("/landing");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    authAPI.googleLogin();
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Background sections */}
      <div className="absolute top-0 left-0 h-full w-5/8 bg-custom-blue">
        {/* Design Image in left corner with white filter */}
        <img
          src="/sign/design.png"
          alt="Design Element"
          className="h-full object-contain object-left-top absolute top-0 left-0 brightness-0 invert opacity-30"
        />
      </div>
      <div className="absolute top-0 right-0 h-full w-3/8 bg-navy-dark"></div>

      {/* Background Ellipses at bottom right */}
      <BackgroundEllipses position="bottom-right" />

      {/* Layout container */}
      <div className="flex items-center w-full relative z-10 py-6 justify-end">
        <div className="relative mx-0 mr-[5%] w-11/12 md:w-3/4 lg:w-2/3">
          {/* Right side - white container */}
          <div className="bg-white w-full min-h-[700px] md:min-h-[800px] lg:min-h-[850px] rounded-3xl shadow-lg p-6 md:p-8 lg:p-10 flex flex-col relative">
            {/* Content */}
            <div className="flex-grow md:ml-[54%] lg:ml-[59%]">
              <h2 className="text-xl md:text-5xl font-squada mt-4 mb-8 md:mb-10 text-gray-700">
                Login
              </h2>

              {/* Error message */}
              {error && (
                <div className="w-[95%] mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              {/* Form */}
              <form className="space-y-8" onSubmit={handleSubmit}>
                {/* Email field */}
                <div className="relative w-[95%]">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 pointer-events-none">
                    {/* Email Icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full py-3 pl-10 pr-4 bg-[#F1ECEC] rounded-lg shadow-[inset_0px_4px_4px_rgba(0,0,0,0.25)] focus:outline-none text-black placeholder-black font-roboto"
                    placeholder="Email Address"
                  />
                </div>

                {/* Password field */}
                <div className="relative w-[95%]">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 pointer-events-none">
                    {/* Lock Icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full py-3 pl-10 pr-4 bg-[#F1ECEC] rounded-lg shadow-[inset_0px_4px_4px_rgba(0,0,0,0.25)] focus:outline-none text-black placeholder-black font-roboto"
                    placeholder="Password"
                  />
                </div>

                {/* Forgot Password */}
                <div className="w-[95%] flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-[#C45E32] text-sm hover:underline font-roboto"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Login Button */}
                <div className="w-[95%] mt-8">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-[#C45E32] text-white font-bold rounded-lg shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25),0px_-3px_6px_0px_rgba(0,0,0,0.17)] hover:opacity-90 transition-opacity font-roboto disabled:opacity-50"
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </button>
                </div>

                {/* Don't have an account section */}
                <div className="w-[95%] text-center mt-4">
                  <p className="text-gray-600 font-roboto">
                    Don't have an account?{" "}
                    <Link
                      to="/signup"
                      className="text-[#C45E32] font-medium hover:underline"
                    >
                      Sign Up
                    </Link>
                  </p>
                </div>

                {/* OR divider */}
                <div className="w-[95%] flex items-center my-4">
                  <div className="flex-grow h-px bg-gray-300"></div>
                  <span className="mx-4 text-gray-500 font-roboto">OR</span>
                  <div className="flex-grow h-px bg-gray-300"></div>
                </div>

                {/* Google Sign In Button */}
                <div className="w-[95%]">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 font-roboto"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="text-gray-800">Continue with Google</span>
                  </button>
                </div>
              </form>

              {/* Spacer */}
              <div className="flex-grow min-h-[50px]"></div>

              {/* Terms of service text */}
              <div className="w-[95%] text-center mt-auto mb-4">
                <p className="text-xs text-gray-500 font-roboto">
                  By logging in, you agree to our Terms of Service and Privacy
                  Policy
                </p>
              </div>
            </div>
          </div>

          {/* Left side - navy blue container */}
          <div className="hidden md:block absolute top-0 left-0 bg-navy-dark w-[50%] lg:w-[55%] min-h-[700px] md:min-h-[800px] lg:min-h-[850px] rounded-3xl z-20 shadow-lg">
            {/* Logo in the left top corner */}
            <div className="absolute top-8 left-8">
              <img
                src="/sign/logo.png"
                alt="Circuit Smith Logo"
                className="w-24 h-auto"
              />
            </div>

            {/* "BUILD BEYOND CODE!" */}
            <div className="absolute flex flex-col text-white left-8 top-32 font-squada">
              <span className="text-4xl mb-1">BUILD</span>
              <span className="text-5xl mb-1">BEYOND</span>
              <span className="text-6xl">CODE!</span>
            </div>

            {/* Animation at bottom center */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-4/5">
              <img
                src="/sign/animation.gif"
                alt="Animation"
                className="w-full h-auto"
              />
            </div>

            {/* Top right corner ellipses */}
            <BackgroundEllipses position="top-right" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
