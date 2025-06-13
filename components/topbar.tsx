"use client";
import type { NextPage } from "next";
import { useCallback, useState } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import Buttons from "./buttons";

export type TopBarType = {
  className?: string;
};

const TopBar: NextPage<TopBarType> = ({ className = "" }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  return (
    <div
      className={`w-full h-[120px] relative z-50 ${className}`}
      style={{
        borderLeft: "2px solid rgba(36, 245, 228, 0.25)",
      }}
    >
      {/* Dolna gradientowa linia */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "2px",
          width: "50%",
          background:
            "linear-gradient(to right, rgba(36, 245, 228, 0.25), transparent)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Tytuł wyżej */}
      <h1 className="absolute left-1/2 top-[15%] transform -translate-x-1/2 text-[2rem] font-normal font-['Russo_One'] z-[2] text-center whitespace-nowrap mq850:text-[1.625rem] mq450:text-[1.188rem]">
        <span className="text-[rgba(36,245,228,0.84)]">FLASH</span>
        <span className="text-white">ESS</span>
      </h1>

      {/* Content */}
      <div className="relative h-full max-w-screen-xl mx-auto flex justify-between items-center px-10 lg:px-20">
        {/* Left nav - visible on desktop */}
        <div className="hidden xl:flex items-center gap-14 z-[2]">
          <div className={getLinkClassName("/")} onClick={handleHomeClick}>
            HOME
          </div>
          <div
            className={getLinkClassName("/training-page")}
            onClick={handleTrainingClick}
          >
            TRAINING
          </div>
          <div
            className={getLinkClassName("/creation-page")}
            onClick={handleCreationClick}
          >
            CREATION
          </div>
        </div>

        {/* Right section - visible on desktop */}
        <div className="hidden xl:flex items-center gap-10 z-[2]">
          <Buttons
            property1="Default"
            onLogInButtonContainerClick={handleRegisterClick}
            bUTTON="PROFILE"
            className="flex-shrink-0 px-4 transition-all duration-150"
          />
          <Buttons
            property1="Default"
            onLogInButtonContainerClick={handleLogInClick}
            bUTTON="LOG IN"
            className="flex-shrink-0 px-4 transition-all duration-150"
          />
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
            className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 w-32 bg-black/10 backdrop-blur-sm flex flex-col items-center py-4 gap-4 rounded-xl transition-all duration-150 ${
              isMenuOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-4 pointer-events-none"
            }`}
          >
            <div className={getLinkClassName("/")} onClick={handleHomeClick}>
              HOME
            </div>
            <div
              className={getLinkClassName("/training-page")}
              onClick={handleTrainingClick}
            >
              TRAINING
            </div>
            <div
              className={getLinkClassName("/creation-page")}
              onClick={handleCreationClick}
            >
              CREATION
            </div>
            <div
              className={getLinkClassName("/register-page")}
              onClick={handleRegisterClick}
            >
              PROFILE
            </div>
            <div
              className={getLinkClassName("/login-page")}
              onClick={handleLogInClick}
            >
              LOG IN
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
