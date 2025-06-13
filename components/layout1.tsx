"use client";
import type { NextPage } from "next";
import { useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Buttons from "./buttons";

export type LayoutType = {
  className?: string;
};

const Layout: NextPage<LayoutType> = ({ className = "" }) => {
  const router = useRouter();

  const onLogInButtonContainerClick = useCallback(() => {
    router.push("/login-page");
  }, [router]);

  const onTopBarContainerClick = useCallback(() => {
    router.push("/register-page");
  }, [router]);

  const onTRANINGTextClick = useCallback(() => {
    router.push("/training-page");
  }, [router]);

  const onHOMETextClick = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <section
      className={`flex flex-row items-start justify-end !pt-[0rem] !pb-[0rem] !pl-[9.812rem] !pr-[9.812rem] box-border max-w-full text-left text-[0.938rem] text-White font-['Russo_One'] mq450:!pl-[2.438rem] mq450:!pr-[2.438rem] mq450:box-border mq1525:!pl-[4.875rem] mq1525:!pr-[4.875rem] mq1525:box-border ${className}`}
    >
      <div className="flex flex-col items-end justify-start gap-[11.062rem] max-w-full mq1225:gap-[1.375rem] mq450:gap-[2.75rem] mq1525:gap-[5.5rem]">
        <div
          className="w-[1.5rem] h-[1.5rem] flex flex-row items-start justify-start !pt-[0rem] !pb-[0rem] !pl-[0rem] !pr-[0rem] box-border relative gap-[1.937rem] cursor-pointer z-[1]"
          onClick={onTopBarContainerClick}
        >
          <Image
            className="h-[1.5rem] w-[1.5rem] relative overflow-hidden shrink-0"
            loading="lazy"
            width={24}
            height={24}
            sizes="100vw"
            alt=""
            src="/user.svg"
          />
          <Image
            className="h-[7.875rem] w-[100rem] absolute !!m-[0 important] top-[-3.5rem] left-[-88.687rem] z-[1]"
            width={1600}
            height={126}
            sizes="100vw"
            alt=""
            src="/topbarrect.svg"
          />
          <div className="absolute !!m-[0 important] top-[calc(50%_-_9px)] left-[-69.75rem] text-[rgba(36,245,228,0.84)] [text-shadow:0px_0px_8px_rgba(0,_0,_0,_0.25)] z-[2]">
            CREATION
          </div>
          <div
            className="absolute !!m-[0 important] top-[calc(50%_-_9px)] left-[-79.25rem] inline-block min-w-[4.75rem] shrink-0 cursor-pointer z-[2]"
            onClick={onTRANINGTextClick}
          >
            TRAINING
          </div>
          <div
            className="absolute !!m-[0 important] top-[calc(50%_-_9px)] left-[-86.312rem] inline-block min-w-[3rem] shrink-0 cursor-pointer z-[2]"
            onClick={onHOMETextClick}
          >
            HOME
          </div>
          <h1 className="!!m-[0 important] h-[5rem] w-[18.625rem] absolute bottom-[-3.375rem] left-[-48.25rem] text-[2rem] font-normal font-[inherit] inline-block shrink-0 z-[2] mq1225:text-[1.188rem] mq450:text-[1.625rem]">
            {`       `}FLASHESS
          </h1>
          <Buttons
            property1="Default"
            logInButtonMarginTop="-0.313rem"
            onLogInButtonContainerClick={onLogInButtonContainerClick}
            logInButtonHeight="2.125rem"
            logInButtonWidth="6.813rem"
            bUTTON="LOG IN"
            bUTTONColor="#fff"
            bUTTONTextShadow="unset"
          />
        </div>
        <div className="w-[63.438rem] flex flex-row items-start justify-start max-w-full text-center">
          <div className="w-[46.563rem] relative inline-block shrink-0 max-w-full z-[1]">
            <p className="!m-0">{`How to Use `}Creation Mode</p>
            <p className="!m-0">&nbsp;</p>
            <p className="!m-0">
              Load games, explore lines, and turn key positions into flashcards.
            </p>
            <p className="!m-0">
              {" "}
              Use the Lichess link or paste a PGN to import your game.
            </p>
            <p className="!m-0">
              {" "}
              Navigate through moves, select positions, and save them as
              flashcards for later training.
            </p>
            <p className="!m-0">
              {" "}
              You can also tag, rename, or group your flashcards into themed
              sets.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Layout;
