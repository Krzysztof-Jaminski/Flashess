"use client";
import type { NextPage } from "next";
import { useCallback, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import Buttons from "./buttons";
import { authApi, getCurrentUser, type User } from "../utils/api";

export type TopBarType = {
  className?: string;
};

const TopBar: NextPage<TopBarType> = ({ className = "" }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // Aktualizuj stan autentykacji po hydratacji
  useEffect(() => {
    setIsMounted(true);
    const updateAuth = () => {
      setIsAuthenticated(authApi.isAuthenticated());
      setCurrentUser(getCurrentUser());
    };
    
    // Ustaw początkowy stan po hydratacji
    updateAuth();
    
    // Nasłuchuj zmian w localStorage (działa między kartami)
    window.addEventListener('storage', updateAuth);
    
    // Nasłuchuj custom event dla zmian w tej samej karcie
    window.addEventListener('auth-change', updateAuth);
    
    return () => {
      window.removeEventListener('storage', updateAuth);
      window.removeEventListener('auth-change', updateAuth);
    };
  }, []);

  const handleLogInClick = useCallback(() => {
    router.push("/login-page");
    setIsMenuOpen(false);
  }, [router]);

  const handleCreationClick = useCallback(() => {
    router.push("/creation-page");
    setIsMenuOpen(false);
  }, [router]);

  const handleTrainingClick = useCallback(() => {
    router.push("/training-page");
    setIsMenuOpen(false);
  }, [router]);

  const handleHomeClick = useCallback(() => {
    router.push("/");
    setIsMenuOpen(false);
  }, [router]);

  const handleRegisterClick = useCallback(() => {
    router.push("/register-page");
    setIsMenuOpen(false);
  }, [router]);

  const handleLogout = useCallback(() => {
    authApi.logout();
    router.push("/");
    setIsMenuOpen(false);
  }, [router]);

  const getLinkClassName = useCallback(
    (path: string) => {
      const baseClasses =
        "shrink-0 cursor-pointer z-[2] text-White font-['Russo_One']";
      const activeClasses =
        "text-[rgba(36,245,228,0.84)] [text-shadow:0px_0px_12px_rgba(36,_245,_228,_0.9)]";
      
      // Check if we're on a training subpage
      const isTrainingPage = pathname === "/training-page" || 
                           pathname === "/puzzles" || 
                           pathname === "/puzzle-rush" || 
                           pathname === "/flashcards";
      
      // Check if we're on a creation subpage
      const isCreationPage = pathname === "/creation-page";
      
      if (path === "/training-page" && isTrainingPage) {
        return `${baseClasses} ${activeClasses}`;
      }
      
      if (path === "/creation-page" && isCreationPage) {
        return `${baseClasses} ${activeClasses}`;
      }
      
      return `${baseClasses} ${pathname === path ? activeClasses : ""}`;
    },
    [pathname]
  );

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(!isMenuOpen);
  }, [isMenuOpen]);

  const titleClass = "text-[1.8rem] font-bold";
  const blueShadow = '0px 0px 12px var(--blue-84)';

  return (
    <div
      className={`w-full h-[120px] relative z-50 ${className}`}
      style={{
        background: 'rgba(1,7,6,0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(36,245,228,0.2)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(36,245,228,0.08)',
      }}
    >
      {/* Tytuł wyżej */}
      <h1 className="absolute left-1/2 top-[15%] transform -translate-x-1/2 text-[2rem] font-normal font-['Russo_One'] z-[2] text-center whitespace-nowrap mq850:text-[1.625rem] mq450:text-[1.188rem]">
        <span className="" style={{ color: 'var(--blue-84)', textShadow: '0 0 20px rgba(36,245,228,0.5)' }}>FLASH</span>
        <span className="text-white">ESS</span>
      </h1>

      {/* Content */}
      <div className="relative h-full max-w-screen-xl mx-auto flex justify-between items-center px-10 lg:px-20">
        {/* Left nav - visible on desktop */}
        <div className="hidden xl:flex items-center gap-6 z-[2]">
          <Buttons
            bUTTON="HOME"
            onLogInButtonContainerClick={handleHomeClick}
            className={`!py-1 !px-4 !text-sm ${pathname === "/" ? "!border-cyan-400 !shadow-[0_0_20px_rgba(36,245,228,0.3)]" : ""}`}
            bUTTONColor={pathname === "/" ? "rgba(36,245,228,0.84)" : "#fff"}
            bUTTONTextShadow={pathname === "/" ? "0px 0px 12px rgba(36,245,228,0.9)" : undefined}
          />
          <Buttons
            bUTTON="TRAINING"
            onLogInButtonContainerClick={handleTrainingClick}
            className={`!py-1 !px-4 !text-sm ${
              pathname === "/training-page" || pathname === "/puzzles" || pathname === "/puzzle-rush" || pathname === "/flashcards"
                ? "!border-cyan-400 !shadow-[0_0_20px_rgba(36,245,228,0.3)]"
                : ""
            }`}
            bUTTONColor={
              pathname === "/training-page" || pathname === "/puzzles" || pathname === "/puzzle-rush" || pathname === "/flashcards"
                ? "rgba(36,245,228,0.84)"
                : "#fff"
            }
            bUTTONTextShadow={
              pathname === "/training-page" || pathname === "/puzzles" || pathname === "/puzzle-rush" || pathname === "/flashcards"
                ? "0px 0px 12px rgba(36,245,228,0.9)"
                : undefined
            }
          />
          <Buttons
            bUTTON="CREATION"
            onLogInButtonContainerClick={handleCreationClick}
            className={`!py-1 !px-4 !text-sm ${pathname === "/creation-page" ? "!border-cyan-400 !shadow-[0_0_20px_rgba(36,245,228,0.3)]" : ""}`}
            bUTTONColor={pathname === "/creation-page" ? "rgba(36,245,228,0.84)" : "#fff"}
            bUTTONTextShadow={pathname === "/creation-page" ? "0px 0px 12px rgba(36,245,228,0.9)" : undefined}
          />
        </div>

        {/* Right section - visible on desktop */}
        <div className="hidden xl:flex items-center gap-10 z-[2]">
          {isAuthenticated ? (
            <>
              <div className="text-white text-sm">
                <span className="text-cyan-400">Logged in as:</span> {currentUser?.username || 'User'}
              </div>
              <Buttons
                property1="Default"
                onLogInButtonContainerClick={handleLogout}
                bUTTON="LOG OUT"
                className="flex-shrink-0 px-4 transition-all duration-150"
              />
            </>
          ) : (
            <>
              <Buttons
                property1="Default"
                onLogInButtonContainerClick={handleRegisterClick}
                bUTTON="PROFILE"
                className={`flex-shrink-0 px-4 transition-all duration-150 ${pathname === "/register-page" ? "!border-cyan-400 !shadow-[0_0_20px_rgba(36,245,228,0.3)]" : ""}`}
                bUTTONColor={pathname === "/register-page" ? "rgba(36,245,228,0.84)" : "#fff"}
                bUTTONTextShadow={pathname === "/register-page" ? "0px 0px 12px rgba(36,245,228,0.9)" : undefined}
              />
              <Buttons
                property1="Default"
                onLogInButtonContainerClick={handleLogInClick}
                bUTTON="LOG IN"
                className={`flex-shrink-0 px-4 transition-all duration-150 ${pathname === "/login-page" ? "!border-cyan-400 !shadow-[0_0_20px_rgba(36,245,228,0.3)]" : ""}`}
                bUTTONColor={pathname === "/login-page" ? "rgba(36,245,228,0.84)" : "#fff"}
                bUTTONTextShadow={pathname === "/login-page" ? "0px 0px 12px rgba(36,245,228,0.9)" : undefined}
              />
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="xl:hidden z-[3] relative ml-auto">
          <Buttons
            property1="Default"
            bUTTON={isMenuOpen ? "CLOSE" : "MENU"}
            onLogInButtonContainerClick={toggleMenu}
            className="flex-shrink-0 px-4 transition-all duration-150"
          />
          {/* Mobile menu dropdown */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 w-32 flex flex-col items-center py-4 gap-4 rounded-xl transition-all duration-150 ${
              isMenuOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-4 pointer-events-none"
            }`}
            style={{
              background: 'rgba(1,7,6,0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(36,245,228,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
            }}
          >
            <Buttons
              bUTTON="HOME"
              onLogInButtonContainerClick={handleHomeClick}
              className={`!py-1 !px-4 !text-xs ${pathname === "/" ? "!border-cyan-400 !shadow-[0_0_20px_rgba(36,245,228,0.3)]" : ""}`}
              bUTTONColor={pathname === "/" ? "rgba(36,245,228,0.84)" : "#fff"}
              bUTTONTextShadow={pathname === "/" ? "0px 0px 12px rgba(36,245,228,0.9)" : undefined}
            />
            <Buttons
              bUTTON="TRAINING"
              onLogInButtonContainerClick={handleTrainingClick}
              className={`!py-1 !px-4 !text-xs ${
                pathname === "/training-page" || pathname === "/puzzles" || pathname === "/puzzle-rush" || pathname === "/flashcards"
                  ? "!border-cyan-400 !shadow-[0_0_20px_rgba(36,245,228,0.3)]"
                  : ""
              }`}
              bUTTONColor={
                pathname === "/training-page" || pathname === "/puzzles" || pathname === "/puzzle-rush" || pathname === "/flashcards"
                  ? "rgba(36,245,228,0.84)"
                  : "#fff"
              }
              bUTTONTextShadow={
                pathname === "/training-page" || pathname === "/puzzles" || pathname === "/puzzle-rush" || pathname === "/flashcards"
                  ? "0px 0px 12px rgba(36,245,228,0.9)"
                  : undefined
              }
            />
            <Buttons
              bUTTON="CREATION"
              onLogInButtonContainerClick={handleCreationClick}
              className={`!py-1 !px-4 !text-xs ${pathname === "/creation-page" ? "!border-cyan-400 !shadow-[0_0_20px_rgba(36,245,228,0.3)]" : ""}`}
              bUTTONColor={pathname === "/creation-page" ? "rgba(36,245,228,0.84)" : "#fff"}
              bUTTONTextShadow={pathname === "/creation-page" ? "0px 0px 12px rgba(36,245,228,0.9)" : undefined}
            />
            {isAuthenticated ? (
              <>
                <div className="text-white text-xs text-center px-2">
                  <span className="text-cyan-400">Logged in:</span><br />
                  {currentUser?.username || 'User'}
                </div>
                <div
                  className="text-White font-['Russo_One'] cursor-pointer hover:text-cyan-400"
                  onClick={handleLogout}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleLogout();
                    }
                  }}
                >
                  LOG OUT
                </div>
              </>
            ) : (
              <>
                <div
                  className={getLinkClassName("/register-page")}
                  onClick={handleRegisterClick}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleRegisterClick();
                    }
                  }}
                >
                  PROFILE
                </div>
                <div
                  className={getLinkClassName("/login-page")}
                  onClick={handleLogInClick}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleLogInClick();
                    }
                  }}
                >
                  LOG IN
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
