import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authAPI } from "../api/auth";
import SplashScreen from "~/components/SplashScreen";

function LandingPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateUser = async () => {
      try {
        const response = await authAPI.verifyToken();
        if (response.success && response.user) {
          setUser(response.user);
        }
      } catch (error) {
        console.error("Validation failed:", error);
        // Don't redirect to login, just continue without user
      } finally {
        //set 2000 timer
        const timer = setTimeout(() => {
          setIsValidating(false);
        }, 2000);

        // Cleanup function
        return () => clearTimeout(timer);
      }
    };

    validateUser();
  }, []);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      logout();
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const slides = [
    {
      id: 1,
      src: "/public/landing/slide1.jpg",
      alt: "Circuit Smith Feature 1",
    },
    {
      id: 2,
      src: "/public/landing/slide2.jpg",
      alt: "Circuit Smith Feature 2",
    },
    {
      id: 3,
      src: "/public/landing/slide3.jpg",
      alt: "Circuit Smith Feature 3",
    },
    {
      id: 4,
      src: "/public/landing/slide4.jpg",
      alt: "Circuit Smith Feature 4",
    },
    {
      id: 5,
      src: "/public/landing/slide5.jpg",
      alt: "Circuit Smith Feature 5",
    },
  ];
  const cardData = [
    {
      id: 1,
      image: `${import.meta.env.BASE_URL}landing/2.gif`,
      alt: "Feature 1",
      title: "Circuit Design",
      description:
        "Drag and drop components to create your electronic circuits with ease",
      imageSize: "w-[216px] h-[160px]",
    },
    {
      id: 2,
      image: `${import.meta.env.BASE_URL}landing/3.gif`,
      alt: "Feature 2",
      title: "Code Editor",
      description:
        "Write Arduino code with syntax highlighting and real-time feedback",
      imageSize: "w-[197px] h-[136px]",
    },
    {
      id: 3,
      image: `${import.meta.env.BASE_URL}landing/1.gif`,
      alt: "Feature 3",
      title: "Live Simulation",
      description:
        "Watch your circuits come alive with interactive simulations",
      imageSize: "w-[154px] h-[154px]",
    },
  ];
  const getSlideStyle = (index: number) => {
    const diff = index - currentSlide;

    if (diff === 0) {
      // Center slide - full size (100% visible)
      return {
        transform: "translateX(0) scale(1)",
        zIndex: 5,
        opacity: 1,
        width: "420px",
        height: "272px",
      };
    } else if (diff === -1 || diff === 4) {
      // Left immediate - 2nd size (70% visible)
      return {
        transform: "translateX(-90%) scale(0.9)",
        zIndex: 4,
        opacity: 1,
        width: "294px",
        height: "190px",
      };
    } else if (diff === -2 || diff === 3) {
      // Left far - 3rd size (70% visible)
      return {
        transform: "translateX(-150%) scale(0.6)",
        zIndex: 3,
        opacity: 1,
        width: "294px",
        height: "190px",
      };
    } else if (diff === 1 || diff === -4) {
      // Right immediate - 2nd size (70% visible)
      return {
        transform: "translateX(90%) scale(0.9)",
        zIndex: 4,
        opacity: 1,
        width: "294px",
        height: "190px",
      };
    } else if (diff === 2 || diff === -3) {
      // Right far - 3rd size (70% visible)
      return {
        transform: "translateX(150%) scale(0.6)",
        zIndex: 3,
        opacity: 1,
        width: "294px",
        height: "190px",
      };
    } else {
      // Hidden
      return {
        transform: "translateX(300%) scale(0.4)",
        zIndex: 1,
        opacity: 1,
        width: "168px",
        height: "109px",
      };
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (isValidating) {
    return <SplashScreen />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <nav className="bg-[#C45E32] shadow-md">
        <div className="max-w-[1512px] h-[150px] w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-full">
            {/* Logo */}
            <div className="flex items-center">
              <img
                src={`${import.meta.env.BASE_URL}SplashPage/logo.png`}
                alt="Circuit Smith Logo"
                className="h-24 w-auto"
              />
            </div>
            {/* Brand Name */}
            <div className="hidden md:flex items-center justify-center flex-1">
              <span className="text-4xl md:text-6xl font-normal text-white font-squada tracking-wider">
                CIRCUITSMITH
              </span>
            </div>

            {/* Conditional Navigation */}
            {user ? (
              /* User Info and Logout */
              <div className="flex items-center space-x-6">
                <span className="text-white text-lg">
                  Welcome, {user.fullName}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-8 py-3 w-[180px] h-[60px] flex items-center justify-center rounded-[25px] border-[6px] border-white text-white hover:bg-white/10 transition font-medium text-xl"
                >
                  Logout
                </button>
              </div>
            ) : (
              /* Auth Buttons */
              <div className="flex items-center space-x-6">
                <Link
                  to="/login"
                  className="px-8 py-3 w-[180px] h-[60px] flex items-center justify-center rounded-[25px] border-[6px] border-white text-white hover:bg-white/10 transition font-medium text-xl"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-8 py-3 w-[180px] h-[60px] flex items-center justify-center rounded-[25px] bg-white text-[#C45E32] hover:bg-white/90 transition font-medium text-xl"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="bg-[#E6F6FF] h-[571px] flex items-center">
        <div className="max-w-[1512px] w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center h-full">
            {/* Left Side - Text */}{" "}
            <div className="flex flex-col justify-center space-y-4 lg:space-y-6">
              <div className="text-center lg:text-left">
                <h1 className=" text-gray-900 font-squada leading-tight ml-16">
                  <div className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
                    BUILD
                  </div>
                  <div className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
                    BEYOND
                  </div>
                  <div className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl">
                    CODE!
                  </div>
                </h1>
              </div>
            </div>{" "}
            {/* Right Side - Image */}
            <div className="flex justify-center lg:justify-end items-center mr-8">
              <div className="w-full ">
                <img
                  src={`${import.meta.env.BASE_URL}landing/hero-image.gif`}
                  alt="Circuit Smith Hero"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>{" "}
          </div>
        </div>
      </section>{" "}
      {/* Overlapping Image Section */}
      <div className="relative">
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex justify-center">
            <img
              src={`${import.meta.env.BASE_URL}landing/image.jpg`}
              alt="Circuit Smith Feature"
              className="w-[656px] border-8 border-[#D9D9D9] rounded-lg"
              style={{
                boxShadow: "0 4px 4px #00000040, inset 0 4px 4px #00000040",
              }}
            />
          </div>
        </div>
      </div>{" "}
      {/* Description Section */}
      <section className="pt-[410px] pb-24 ">
        <div className="max-w-[1512px] w-full mx-auto">
          <div className="text-center">
            <p className="text-2xl font-normal font-mono text-[#000000A8] leading-[97%] max-w-[1306px] mx-auto">
              Discover Circuit-Smith: a browser-based electronics playground
              where you drag virtual components, write Arduino code, and watch
              live simulations unfold. LEDs blink, sensors respond, and circuits
              buzz—all without hardware. Save and share designs instantly.
              Perfect for learners, educators, and tinkerers eager to
              experiment, prototype, and spark creativity in a digital lab
            </p>{" "}
            {/* Let's Start Button */}
            <div className="mt-12 flex justify-center">
              <Link
                to="/app"
                className="flex items-center justify-center gap-3 w-[336px] h-[79px] bg-[#3B9EEE] text-white font-bold rounded-[30px] hover:bg-[#2A8BD9] transition-colors duration-200"
                style={{
                  fontFamily: "Roboto, sans-serif",
                  fontSize: "32px",
                  lineHeight: "97%",
                  fontWeight: 700,
                }}
              >
                {" "}
                Let's Start
                <svg
                  className="w-[35px] h-[35px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 21C9 21.5523 9.44772 22 10 22H14C14.5523 22 15 21.5523 15 21V20H9V21Z"
                    fill="currentColor"
                  />
                  <path
                    d="M12 2C8.13401 2 5 5.13401 5 9C5 11.3869 6.33193 13.4619 8.25 14.5V17C8.25 17.4142 8.58579 17.75 9 17.75H15C15.4142 17.75 15.75 17.4142 15.75 17V14.5C17.6681 13.4619 19 11.3869 19 9C19 5.13401 15.866 2 12 2Z"
                    fill="currentColor"
                  />
                  <path
                    d="M12 0L13.5 2.5L16 1L15 4H17L15.5 6.5L18 7L15.5 8.5L17 11H15L16 14L13.5 12.5L12 15L10.5 12.5L8 14L9 11H7L8.5 8.5L6 7L8.5 6.5L7 4H9L8 1L10.5 2.5L12 0Z"
                    fill="currentColor"
                    opacity="0.7"
                  />
                </svg>
              </Link>
            </div>{" "}
            {/* Image Carousel */}
            <div className="mt-16 relative">
              <div className="flex justify-center items-center h-[350px]">
                <div className="relative w-full flex justify-center items-center">
                  {slides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className="absolute transition-all duration-500 ease-in-out cursor-pointer bg-[#E6E6E6] rounded-[23px]"
                      style={{
                        ...getSlideStyle(index),
                        boxShadow: "0 4px 2px 1px #00000040",
                      }}
                      onClick={() => setCurrentSlide(index)}
                    >
                      <img
                        src={slide.src}
                        alt={slide.alt}
                        className="w-full h-full object-cover rounded-[23px]"
                      />
                    </div>
                  ))}
                </div>
              </div>
              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-200 z-10"
              >
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-200 z-10"
              >
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>{" "}
              {/* Dots Indicator */}
              <div className="flex justify-center mt-6 space-x-3">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-4 h-4 rounded-full transition-all duration-200 ${
                      index === currentSlide ? "bg-[#C45E32B8]" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>{" "}
            {/* 3 Cards Section */}
            <div className="mt-32">
              <div className="flex justify-center items-center space-x-8">
                {cardData.map((card) => (
                  <div
                    key={card.id}
                    className="flex flex-col items-center text-center w-[350px] space-y-6"
                  >
                    {" "}
                    <img
                      src={card.image}
                      alt={card.alt}
                      className={`${card.imageSize} mb-4 object-cover`}
                    />{" "}
                    <h3 className="text-black mb-2 font-roboto font-bold text-xl leading-97">
                      {card.title}
                    </h3>
                    <p className="text-black font-roboto font-light text-xl">
                      {card.description}
                    </p>
                  </div>
                ))}
              </div>{" "}
            </div>
          </div>
        </div>
      </section>
      {/* Footer Section */}
      <footer
        className="relative h-[256px] flex items-center justify-center"
        style={{
          backgroundImage: `url('${import.meta.env.BASE_URL}landing/footer-bg.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0"></div>
        <div className="relative z-10 text-center">
          <h2 className="text-white font-roboto font-black text-[50px] leading-tight">
            "Spark curiosity; let innovation
            <br />
            flow through every wire."
          </h2>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
