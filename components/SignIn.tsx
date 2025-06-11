import React, { useEffect, useRef, useState } from "react";
import {
  FaTelegram,
  FaExclamationTriangle,
  FaUser,
  FaUserPlus,
} from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { NEXT_PUBLIC_TELEGRAM_BOT_NAME } from "@/config";

interface TelegramAuthData {
  id: string;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: string;
  hash: string;
}


declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramAuthData) => void;
  }
}

interface SignInProps {
  backgroundImageUrl?: string;
}

const SignIn: React.FC<SignInProps> = ({ backgroundImageUrl }) => {
  const { login } = useAuth();
  const telegramWidgetRef = useRef<HTMLDivElement>(null);
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [widgetError, setWidgetError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorType, setErrorType] = useState<
    "disabled" | "notFound" | "general"
  >("general");

  const verifyTelegramAuthViaAPI = async (authData: TelegramAuthData): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(authData),
      });

      const result = await response.json();

      if (response.ok && result.verified) {
        localStorage.setItem("authToken", result.token);

        login(result.user, result.backendUser);

        return true;
      } else {
        if (result.accountDisabled) {
          setErrorType("disabled");
          setErrorMessage(
            "Your account has been disabled. Please contact support for assistance."
          );
        } else if (result.userNotFound) {
          setErrorType("notFound");
          setErrorMessage(
            "User not found in our database. Please contact support to register your account."
          );
        } else {
          setErrorType("general");
          setErrorMessage(
            result.error || "Authentication failed. Please try again."
          );
        }

        setShowErrorModal(true);
        return false;
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setErrorType("general");
      setErrorMessage(
        "Network error occurred. Please check your connection and try again."
      );
      setShowErrorModal(true);
      return false;
    }
  };

  useEffect(() => {
    const handleTelegramAuth = async (user: TelegramAuthData) => {

      const isVerified = await verifyTelegramAuthViaAPI(user);

      if (!isVerified) {
        console.log("Authentication failed");
      }
    };

    window.onTelegramAuth = handleTelegramAuth;

    return () => {
      delete window.onTelegramAuth;
    };
  }, [login]);

  const createTelegramWidget = () => {
    setIsLoading(true);
    setWidgetLoaded(false);
    setWidgetError(false);

    if (telegramWidgetRef.current) {
      telegramWidgetRef.current.innerHTML = "";

      const script = document.createElement("script");
      script.src = "https://telegram.org/js/telegram-widget.js?22";
      script.async = true;
      script.setAttribute("data-telegram-login", `${NEXT_PUBLIC_TELEGRAM_BOT_NAME}`);
      script.setAttribute("data-size", "large");
      script.setAttribute("data-radius", "10");
      script.setAttribute("data-onauth", "onTelegramAuth(user)");
      script.setAttribute("data-request-access", "write");

      script.onload = () => {
        setTimeout(() => {
          setWidgetLoaded(true);
          setWidgetError(false);
          setIsLoading(false);
        }, 500);
      };

      script.onerror = () => {
        setWidgetError(true);
        setWidgetLoaded(false);
        setIsLoading(false);
      };

      telegramWidgetRef.current.appendChild(script);

      setTimeout(() => {
        setIsLoading(false);
        setWidgetLoaded(true);
      }, 3000);
    }
  };

  useEffect(() => {
    createTelegramWidget();

    return () => {
      if (telegramWidgetRef.current) {
        telegramWidgetRef.current.innerHTML = "";
      }
    };
  }, []);

  const ErrorModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md mx-4 text-center">
        <div className="mb-4">
          <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">
            {errorType === "disabled"
              ? "Account Disabled"
              : errorType === "notFound"
              ? "Account Not Found"
              : "Authentication Error"}
          </h3>
          <p className="text-gray-300 text-sm">{errorMessage}</p>
        </div>
        <button
          onClick={() => setShowErrorModal(false)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );

  return (
    <div className=" font-mont min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="fixed h-screen inset-0 z-0">
        <img
          src={backgroundImageUrl || ""}
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-transparent to-black/90"></div>
      </div>

      <div className="relative z-10 bg-gray-900/70 backdrop-blur-md rounded-lg p-8 w-full max-w-md mx-4 border border-gray-700/80">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Log in or Sign up
          </h2>
          <p className="text-gray-300 text-sm">
            Use your telegram account to log in or sign up.
          </p>
        </div>

        <div className="space-y-3">
          <div className="w-full">
            {isLoading && (
              <div className="w-full flex items-center justify-center gap-3 bg-blue-500 text-white font-medium py-3 px-4 rounded-lg">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Loading Telegram login...</span>
              </div>
            )}

            {widgetError && !isLoading && (
              <button
                onClick={createTelegramWidget}
                className="w-full flex items-center justify-center gap-3 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                <FaTelegram size={18} />
                Continue with Telegram
              </button>
            )}

            <div
              ref={telegramWidgetRef}
              className={`flex justify-center ${
                isLoading ? "hidden" : "block"
              }`}
              style={{ minHeight: widgetLoaded && !isLoading ? "36px" : "0" }}
            ></div>
          </div>
        </div>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-600"></div>
        </div>

        <div className="space-y-3">
          <button
            disabled
            className="flex items-center justify-center gap-2 bg-transparent text-white text-sm font-medium py-2 px-4 rounded-lg cursor-not-allowed mx-auto"
          >
            <FaUser size={16} />
            Continue as Guest (Coming Soon)
          </button>

          <Link
            href={`https://t.me/${NEXT_PUBLIC_TELEGRAM_BOT_NAME}?start=signup`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="flex items-center justify-center gap-2 bg-blue-400 border hover:bg-blue-500 border-gray-600 text-white hover:border-gray-500 hover:text-white text-sm font-medium py-2 px-12 rounded-lg transition-colors mx-auto">
              <FaUserPlus size={16} />
              Sign up with Telegram
            </button>
          </Link>
        </div>
      </div>

      {showErrorModal && <ErrorModal />}
    </div>
  );
};

export default SignIn;
