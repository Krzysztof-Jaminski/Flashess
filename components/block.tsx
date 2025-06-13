"use client";
import type { NextPage } from "next";
import { useMemo, type CSSProperties } from "react";
import Image from "next/image";

export type BlockType = {
  className?: string;
  delimiter: string;

  /** Variant props */
  color?: "light" | "dark";
  state?: string;
  theme?: string;

  /** Style props */
  blockPosition?: CSSProperties["position"];
  blockHeight?: CSSProperties["height"];
  blockWidth?: CSSProperties["width"];
  blockTop?: CSSProperties["top"];
  blockRight?: CSSProperties["right"];
  blockBottom?: CSSProperties["bottom"];
  blockLeft?: CSSProperties["left"];
  blockAlignSelf?: CSSProperties["alignSelf"];
  blockFlex?: CSSProperties["flex"];
  blockMarginTop?: CSSProperties["marginTop"];
  blockMarginLeft?: CSSProperties["marginLeft"];
};

const Block: NextPage<BlockType> = ({
  className = "",
  color = "dark",
  state = "Default",
  theme = "classic",
  blockPosition,
  blockHeight,
  blockWidth,
  blockTop,
  blockRight,
  blockBottom,
  blockLeft,
  blockAlignSelf,
  blockFlex,
  blockMarginTop,
  blockMarginLeft,
  delimiter,
}) => {
  const blockStyle: CSSProperties = useMemo(() => {
    return {
      position: blockPosition,
      height: blockHeight,
      width: blockWidth,
      top: blockTop,
      right: blockRight,
      bottom: blockBottom,
      left: blockLeft,
      alignSelf: blockAlignSelf,
      flex: blockFlex,
      marginTop: blockMarginTop,
      marginLeft: blockMarginLeft,
    };
  }, [
    blockPosition,
    blockHeight,
    blockWidth,
    blockTop,
    blockRight,
    blockBottom,
    blockLeft,
    blockAlignSelf,
    blockFlex,
    blockMarginTop,
    blockMarginLeft,
  ]);

  return (
    <div
      className={`absolute h-[12.51%] w-[12.51%] top-[12.51%] right-[62.49%] bottom-[74.98%] left-[25%] shadow-[-4px_-4px_4px_rgba(0,_0,_0,_0.25)_inset,_4px_4px_5px_rgba(255,_255,_255,_0.48)_inset] bg-[#677081] overflow-hidden z-[1] data-[state='Default']:data-[theme='wood']:data-[color='dark']:shadow-[-4px_-4px_4px_rgba(255,_255,_255,_0.06)_inset,_4px_4px_5px_rgba(0,_0,_0,_0.48)_inset] data-[state='Default']:data-[theme='wood']:data-[color='dark']:bg-[#282f3b] data-[state='Default']:data-[theme='wood']:data-[color='dark']:z-[unset] data-[state='Default']:data-[theme='wood']:data-[color='dark']:shrink-0 ${className}`}
      data-color={color}
      data-state={state}
      data-theme={theme}
      style={blockStyle}
    >
      <Image
        className="absolute h-full w-full top-[0%] right-[0%] bottom-[0%] left-[0%] max-w-full overflow-hidden max-h-full object-cover"
        width={81.3}
        height={81.3}
        sizes="100vw"
        alt=""
        src={delimiter}
      />
    </div>
  );
};

export default Block;
