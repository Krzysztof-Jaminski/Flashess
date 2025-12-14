"use client";
import type { NextPage } from "next";
import {
  useMemo,
  type CSSProperties,
  ReactNode,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

export type ButtonsType = {
  className?: string;
  bUTTON?: string;
  children?: ReactNode;

  /** Variant props */
  property1?: string;

  /** Style props */
  logInButtonMarginTop?: CSSProperties["marginTop"];
  logInButtonHeight?: CSSProperties["height"];
  logInButtonWidth?: CSSProperties["width"];
  bUTTONColor?: CSSProperties["color"];
  bUTTONTextShadow?: CSSProperties["textShadow"];
  secondWordColor?: CSSProperties["color"];

  /** Action props */
  onLogInButtonContainerClick?: () => void;
};

const Buttons: NextPage<ButtonsType> = ({
  className = "",
  property1 = "Default",
  logInButtonMarginTop,
  logInButtonHeight,
  logInButtonWidth,
  bUTTON,
  children,
  bUTTONColor,
  bUTTONTextShadow,
  secondWordColor,
  onLogInButtonContainerClick,
}) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const logInButtonStyle: CSSProperties = useMemo(() => {
    return {
      marginTop: logInButtonMarginTop,
      height: logInButtonHeight,
      width: logInButtonWidth,
    };
  }, [logInButtonMarginTop, logInButtonHeight, logInButtonWidth]);

  // Determine the effective initial color, considering 'unset' or undefined as white
  const effectiveBUTTONColor =
    bUTTONColor === "unset" || bUTTONColor === undefined ? "#fff" : bUTTONColor;
  const effectiveSecondWordColor =
    secondWordColor === "unset" || secondWordColor === undefined
      ? "#fff"
      : secondWordColor;

  const currentBUTTONColor = useMemo(() => {
    // Only change color if it was originally white
    return isHovered && effectiveBUTTONColor === "#fff"
      ? "rgba(36,245,228,0.84)"
      : effectiveBUTTONColor;
  }, [isHovered, effectiveBUTTONColor]);

  const currentSecondWordColor = useMemo(() => {
    // If secondWordColor is explicitly provided (even if it's #fff), it's a multi-word button
    // and the second word's color should not change on hover.
    if (secondWordColor !== undefined && secondWordColor !== "unset") {
      return effectiveSecondWordColor; // Keep its original color (e.g., #fff)
    }
    // For single-word buttons, apply hover effect if initially white
    return isHovered && effectiveSecondWordColor === "#fff"
      ? "rgba(36,245,228,0.84)"
      : effectiveSecondWordColor;
  }, [isHovered, effectiveSecondWordColor, secondWordColor]);

  const bUTTONTextStyle: CSSProperties = useMemo(() => {
    const baseStyle: CSSProperties = {
      color: currentBUTTONColor,
    };
    if (isHovered) {
      baseStyle.textShadow = `0px 0px 8px ${currentBUTTONColor}`;
    }
    return baseStyle;
  }, [currentBUTTONColor, isHovered]);

  const buttonBoxShadow: CSSProperties = useMemo(() => {
    if (isHovered) {
      return { boxShadow: `0px 0px 8px rgba(36,245,228,0.84)` };
    }
    return {};
  }, [isHovered]);

  const renderColoredText = (text: string) => {
    if (!text) return null;

    const words = text.split(" ");
    if (
      words.length === 1 ||
      secondWordColor === undefined ||
      secondWordColor === "unset"
    ) {
      return (
        <div className="relative" style={bUTTONTextStyle}>
          {text}
        </div>
      );
    }

    const firstWordTextStyle: CSSProperties = { color: currentBUTTONColor };
    if (isHovered) {
      firstWordTextStyle.textShadow = `0px 0px 8px ${currentBUTTONColor}`;
    }

    const secondWordTextStyle: CSSProperties = {
      color: currentSecondWordColor,
    };
    if (isHovered) {
      secondWordTextStyle.textShadow = `0px 0px 8px ${currentSecondWordColor}`;
    }

    return (
      <div className="relative">
        <span style={firstWordTextStyle}>{words[0]}</span>{" "}
        <span style={secondWordTextStyle}>{words.slice(1).join(" ")}</span>
      </div>
    );
  };

  return (
    <div
      className={`!mt-[-0.313rem] h-[2.125rem] rounded-lg border-solid border-[1.5px] box-border flex flex-row items-center justify-center !pt-[0.5rem] !pb-[0.5rem] shrink-0 cursor-pointer z-[6] text-left text-[0.938rem] text-White font-['Russo_One'] transition-all duration-200 ${className}`}
      style={{
        ...logInButtonStyle,
        background: isHovered 
          ? 'linear-gradient(135deg, rgba(15,20,25,0.95) 0%, rgba(5,10,15,0.95) 100%)' 
          : 'linear-gradient(135deg, rgba(10,15,20,0.9) 0%, rgba(5,8,12,0.9) 100%)',
        borderColor: isHovered ? "rgba(36,245,228,0.6)" : "rgba(36,245,228,0.25)",
        boxShadow: isHovered 
          ? '0 0 20px rgba(36,245,228,0.3), 0 4px 15px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)' 
          : '0 2px 10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
        transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
        outline: 'none',
      }}
      onClick={onLogInButtonContainerClick}
      data-property1={property1}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onLogInButtonContainerClick?.();
        }
      }}
    >
      {children ?? renderColoredText(bUTTON || "")}
    </div>
  );
};

export default Buttons;
