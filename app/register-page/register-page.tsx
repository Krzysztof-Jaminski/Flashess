"use client";
import type { NextPage } from "next";
import { useCallback, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Buttons from "../../components/buttons";
import TopBar from "../../components/topbar";
import { authApi } from "../../utils/api";
import AnimatedBackground from "../../components/AnimatedBackground";

const RegisterPage: NextPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogInButtonContainerClick = useCallback(() => {
    router.push("/login-page");
  }, [router]);

  const onHOMETextClick = useCallback(() => {
    router.push("/");
  }, [router]);

  const onTRANINGTextClick = useCallback(() => {
    router.push("/training-page");
  }, [router]);

  const onCREATIONTextClick = useCallback(() => {
    router.push("/creation-page");
  }, [router]);

  const handleRegister = useCallback(async () => {
    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError("");

    const response = await authApi.register(username, email, password);
    if (response.success) {
      router.push("/");
    } else {
      setError(response.error);
    }
    
    setLoading(false);
  }, [username, email, password, confirmPassword, router]);

  return (
    <div className="page-container w-full relative overflow-hidden flex flex-col items-center justify-center !pb-[0rem] !pl-[0rem] !pr-[0rem] box-border leading-[normal] tracking-[normal] min-h-screen">
      <AnimatedBackground variant="home" />
      <TopBar />
      <main className="content-layer w-full flex flex-col items-center justify-center !py-[4rem] !pl-[0rem] !pr-[0rem] box-border gap-[2rem] max-w-full flex-1">
        <main className="w-full flex flex-col gap-4 max-w-full text-left text-[0.938rem] text-White font-['Russo_One'] mq850:gap-4 mq450:gap-4">
          {/* Register Page Specific Content */}
          <div className="flex flex-row items-center justify-center gap-16 w-full max-w-[1400px] mx-auto px-4">
            {/* Left Column - Text Content */}
            <div className="flex-1 max-w-[500px] space-y-8 flex flex-col items-center justify-center text-center">
              <h1 className="text-4xl">
                Join <span className="text-[rgba(36,245,228,0.84)]">FLASHESS</span>
              </h1>
              
              <div className="space-y-6">
                <p className="text-lg text-white/80">
                  Start your chess training journey
                </p>
                <p className="text-white/70">
                  Create your free Flashess account and start training smarter. Track your progress, build your own flashcards, and prepare for opponents using real games.
                </p>
                <p className="text-white/70">
                  It takes less than a minute
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

            {/* Right Column - Register Form */}
            <div className="flex-1 max-w-[500px] glass-panel rounded-lg p-8">
              <h2 className="text-2xl mb-6">Create Account</h2>
              
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
                    onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                    autoComplete="username"
                    suppressHydrationWarning
                    className="w-full px-4 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.3)] rounded-lg text-white placeholder-white/70 focus:border-[rgba(36,245,228,0.84)] focus:outline-none"
                  />
                </div>
                <div className="w-full">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                    autoComplete="email"
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
                    onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                    autoComplete="new-password"
                    suppressHydrationWarning
                    className="w-full px-4 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.3)] rounded-lg text-white placeholder-white/70 focus:border-[rgba(36,245,228,0.84)] focus:outline-none"
                  />
                </div>
                <div className="w-full">
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                    autoComplete="new-password"
                    suppressHydrationWarning
                    className="w-full px-4 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.3)] rounded-lg text-white placeholder-white/70 focus:border-[rgba(36,245,228,0.84)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6">
                <Buttons
                  property1="Default"
                  logInButtonMarginTop="unset"
                  logInButtonHeight="3rem"
                  logInButtonWidth="100%"
                  bUTTON={loading ? "REGISTERING..." : "REGISTER"}
                  bUTTONColor="#fff"
                  bUTTONTextShadow="unset"
                  onLogInButtonContainerClick={handleRegister}
                />
              </div>
            </div>
          </div>
        </main>
      </main>
    </div>
  );
};

export default RegisterPage;
