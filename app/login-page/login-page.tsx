"use client";
import type { NextPage } from "next";
import { useCallback, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Buttons from "../../components/buttons";
import TopBar from "../../components/topbar";
import { authApi } from "../../utils/api";
import AnimatedBackground from "../../components/AnimatedBackground";

const LoginPage: NextPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const onTopBarContainerClick = useCallback(() => {
    router.push("/register-page");
  }, [router]);

  const onCREATIONTextClick = useCallback(() => {
    router.push("/creation-page");
  }, [router]);

  const onTRANINGTextClick = useCallback(() => {
    router.push("/training-page");
  }, [router]);

  const onHOMETextClick = useCallback(() => {
    router.push("/");
  }, [router]);

  const handleLogin = useCallback(async () => {
    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const response = await authApi.login(username, password);
    if (response.success) {
      setSuccess("Login successful! Redirecting...");
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } else {
      setError(response.error);
    }
    
    setLoading(false);
  }, [username, password, router]);

  return (
    <div className="page-container w-full relative overflow-hidden flex flex-col items-center justify-center !pb-[0rem] !pl-[0rem] !pr-[0rem] box-border leading-[normal] tracking-[normal] min-h-screen">
      <AnimatedBackground variant="home" />
      <TopBar />
      <main className="content-layer w-full flex flex-col items-center justify-center !py-[4rem] !pl-[0rem] !pr-[0rem] box-border gap-[2rem] max-w-full flex-1">
        <main className="w-full flex flex-col gap-4 max-w-full text-left text-[0.938rem] text-White font-['Russo_One'] mq850:gap-4 mq450:gap-4">
          {/* Login Page Specific Content */}
          <div className="flex flex-row items-center justify-center gap-16 w-full max-w-[1400px] mx-auto px-4">
            {/* Left Column - Text Content */}
            <div className="flex-1 max-w-[500px] space-y-8 flex flex-col items-center justify-center text-center">
              <h1 className="text-4xl">
                Welcome to <span className="text-[rgba(36,245,228,0.84)]">FLASHESS</span>
              </h1>
              
              <div className="space-y-6">
                <p className="text-lg text-white/80">
                  Your personal chess training companion
                </p>
                <p className="text-white/70">
                  Track your progress, build your own flashcards, and prepare for opponents using real games.
                </p>
              </div>

              <div className="space-y-4 flex flex-col items-center">
                <Buttons
                  property1="Default"
                  logInButtonMarginTop="unset"
                  logInButtonHeight="4rem"
                  logInButtonWidth="28rem"
                  bUTTON="CONTINUE WITH GOOGLE"
                  bUTTONColor="#fff"
                  bUTTONTextShadow="unset"
                />
                <Buttons
                  property1="Default"
                  logInButtonMarginTop="unset"
                  logInButtonHeight="4rem"
                  logInButtonWidth="28rem"
                  bUTTON="CONTINUE WITH APPLE"
                  bUTTONColor="#fff"
                  bUTTONTextShadow="unset"
                />
                <Buttons
                  property1="Default"
                  logInButtonMarginTop="unset"
                  logInButtonHeight="4rem"
                  logInButtonWidth="28rem"
                  bUTTON="CONTINUE WITH PHONE"
                  bUTTONColor="#fff"
                  bUTTONTextShadow="unset"
                />
              </div>
            </div>

            {/* Right Column - Login Form */}
            <div className="flex-1 max-w-[500px] glass-panel rounded-lg p-8">
              <h2 className="text-2xl mb-6">Login</h2>
              
              <div className="space-y-4">
                {error && (
                  <div className="w-full flex justify-center">
                    <div className="w-full max-w-[480px] px-4 py-2 rounded-lg text-sm font-['Russo_One'] transition-all duration-200" style={{ 
                      background: 'rgba(255, 100, 100, 0.1)', 
                      border: '1px solid rgba(255, 100, 100, 0.3)',
                      color: 'rgba(255, 180, 180, 0.9)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 2px 8px rgba(255, 100, 100, 0.15)'
                    }}>
                      {error}
                    </div>
                  </div>
                )}
                {success && (
                  <div className="w-full flex justify-center">
                    <div className="w-full max-w-[480px] px-4 py-2 rounded-lg text-sm font-['Russo_One'] transition-all duration-200" style={{ 
                      background: 'rgba(100, 255, 100, 0.1)', 
                      border: '1px solid rgba(100, 255, 100, 0.3)',
                      color: 'rgba(180, 255, 180, 0.9)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 2px 8px rgba(100, 255, 100, 0.15)'
                    }}>
                      {success}
                    </div>
                  </div>
                )}
                <div className="w-full flex justify-center">
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    autoComplete="username"
                    suppressHydrationWarning
                    className="w-full max-w-[480px] px-4 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.3)] rounded-lg text-white placeholder-white/70 focus:border-[rgba(36,245,228,0.84)] focus:outline-none"
                  />
                </div>
                <div className="w-full flex justify-center">
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    autoComplete="current-password"
                    suppressHydrationWarning
                    className="w-full max-w-[480px] px-4 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.3)] rounded-lg text-white placeholder-white/70 focus:border-[rgba(36,245,228,0.84)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-4 text-right">
                <a href="#" className="text-sm text-white/70 hover:text-[rgba(36,245,228,0.84)]">
                  Forgot your password?
                </a>
              </div>

              <div className="mt-6">
                <Buttons
                  property1="Default"
                  logInButtonMarginTop="unset"
                  logInButtonHeight="3rem"
                  logInButtonWidth="100%"
                  bUTTON={loading ? "LOGGING IN..." : "LOG IN"}
                  bUTTONColor="#fff"
                  bUTTONTextShadow="unset"
                  onLogInButtonContainerClick={handleLogin}
                />
              </div>
            </div>
          </div>
        </main>
      </main>
    </div>
  );
};

export default LoginPage;
