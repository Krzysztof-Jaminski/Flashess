"use client";
import type { NextPage } from "next";
import { useCallback, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Buttons from "../../components/buttons";
import TopBar from "../../components/topbar";
import { authApi } from "../../utils/api";

const LoginPage: NextPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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

    const response = await authApi.login(username, password);
    if (response.success) {
      router.push("/");
    } else {
      setError(response.error);
    }
    
    setLoading(false);
  }, [username, password, router]);

  return (
    <div className="w-full relative bg-[#010706] overflow-hidden flex flex-col !pb-[0rem] !pl-[0rem] !pr-[0rem] box-border leading-[normal] tracking-[normal]">
      {/* Background Eclipse Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Left Eclipse - Large and Bright */}
        <div className="absolute top-[5%] -left-[30%] w-[50rem] h-[45rem] rounded-full bg-[rgba(36,245,228,0.18)] blur-[120px]" />

        {/* Top Right Eclipse - Large and Dim */}
        <div className="absolute top-[-5%] right-[-10%] w-[42rem] h-[42rem] rounded-full bg-[rgba(36,245,228,0.08)] blur-[100px]" />

        {/* Bottom Right Eclipse - Small and Medium Bright */}
        <div className="absolute top-[22%] right-[-15%] w-[35rem] h-[35rem] rounded-full bg-[rgba(36,245,228,0.15)] blur-[100px]" />
      </div>

      <main className="w-full flex flex-col !pt-[0rem] !pb-[32rem] !pl-[0rem] !pr-[0rem] box-border gap-[2.625rem] max-w-full mq1225:!pb-[24rem] mq1225:box-border mq450:gap-[1.313rem] mq450:!pb-[16rem] mq450:box-border mq1525:h-auto">
        <main className="w-full flex flex-col gap-[5.062rem] max-w-full text-left text-[0.938rem] text-White font-['Russo_One'] mq850:gap-[2.5rem] mq450:gap-[1.25rem]">
          <div className="w-full">
            <TopBar />
          </div>
          
          {/* Login Page Specific Content */}
          <div className="flex flex-row items-start justify-center gap-16 w-full max-w-[1400px] mx-auto px-4">
            {/* Left Column - Text Content */}
            <div className="flex-1 max-w-[500px] space-y-8">
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

              <div className="space-y-4">
                <Buttons
                  property1="Default"
                  logInButtonMarginTop="unset"
                  logInButtonHeight="3rem"
                  logInButtonWidth="100%"
                  bUTTON="CONTINUE WITH GOOGLE"
                  bUTTONColor="#fff"
                  bUTTONTextShadow="unset"
                />
                <Buttons
                  property1="Default"
                  logInButtonMarginTop="unset"
                  logInButtonHeight="3rem"
                  logInButtonWidth="100%"
                  bUTTON="CONTINUE WITH APPLE"
                  bUTTONColor="#fff"
                  bUTTONTextShadow="unset"
                />
                <Buttons
                  property1="Default"
                  logInButtonMarginTop="unset"
                  logInButtonHeight="3rem"
                  logInButtonWidth="100%"
                  bUTTON="CONTINUE WITH PHONE"
                  bUTTONColor="#fff"
                  bUTTONTextShadow="unset"
                />
              </div>
            </div>

            {/* Right Column - Login Form */}
            <div className="flex-1 max-w-[500px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.3)] rounded-lg p-8">
              <h2 className="text-2xl mb-6">Login</h2>
              
              <div className="space-y-4">
                {error && (
                  <div className="w-full p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                    {error}
                  </div>
                )}
                <div className="w-full">
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    autoComplete="username"
                    suppressHydrationWarning
                    className="w-full px-4 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.3)] rounded-lg text-white placeholder-white/70 focus:border-[rgba(36,245,228,0.84)] focus:outline-none"
                  />
                </div>
                <div className="w-full">
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    autoComplete="current-password"
                    suppressHydrationWarning
                    className="w-full px-4 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.3)] rounded-lg text-white placeholder-white/70 focus:border-[rgba(36,245,228,0.84)] focus:outline-none"
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
