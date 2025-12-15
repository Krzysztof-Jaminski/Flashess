"use client";
import type { NextPage } from "next";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import AnimatedBackground from "../components/AnimatedBackground";
import Buttons from "../components/buttons";
import TopBar from "../components/topbar";

const HomePage: NextPage = () => {
  const router = useRouter();

  const onTRANINGTextClick = useCallback(() => {
    router.push("/training-page");
  }, [router]);

  const onButtonsContainerClick = useCallback(() => {
    router.push("/creation-page");
  }, [router]);

  return (
    <div className="page-container w-full relative overflow-hidden flex flex-col !pb-[0rem] !pl-[0rem] !pr-[0rem] box-border leading-[normal] tracking-[normal] min-h-screen">
      {/* Nowoczesne animowane tło inspirowane Prisma.io */}
      <AnimatedBackground variant="home" />

      <main className="content-layer w-full flex flex-col items-center !pt-[0rem] !pb-[6rem] !pl-[0rem] !pr-[0rem] box-border gap-[2.625rem] max-w-full mq1225:!pb-[4rem] mq1225:box-border mq450:gap-[1.5rem] mq450:!pb-[3rem] mq450:box-border">
        <div className="w-full">
          <TopBar />
        </div>

        <main className="w-full flex flex-col items-center justify-center px-4 text-left text-[0.938rem] text-White font-['Russo_One']">
          <section className="w-full flex items-center justify-center mt-8 md:mt-10">
            <div className="w-full max-w-[52rem] glass-panel rounded-3xl py-10 md:py-12 px-6 md:px-10 flex flex-col items-center justify-center text-center gap-[3.5rem] mq850:gap-[2.5rem] mq450:gap-[1.75rem]">
              <div className="self-stretch flex flex-col items-center justify-start gap-[5rem] max-w-full mq850:gap-[2.5rem] mq450:gap-[1.5rem]">
                <div className="relative z-[1]">
                  <h1 className="mt-0 md:mt-1 mb-5 md:mb-6 text-xl md:text-2xl tracking-wide">
                    <span className="gradient-text">Flash</span> + Chess
                  </h1>
                  <p className="!m-0 text-lg">
                    <span className="text-[rgba(36,245,228,0.84)] gradient-text">
                      Flashess
                    </span>{" "}
                    is a chess training platform for opening preparation and
                    tactical sharpness
                  </p>
                  <p className="!m-0">&nbsp;</p>
                  <p className="!m-0 text-lg">
                    {`In `}
                    <span className="text-[#FF0000]">Training</span>
                    {` `}Mode you practice curated exercise sets with
                    real-time move validation, random mode, vision & hint
                    tools, auto-start opening moves and a mistake review
                    panel
                  </p>
                  <p className="!m-0">&nbsp;</p>
                  <p className="!m-0 text-lg">
                    {`In `}
                    <span className="text-[#00FFA3]">Creation</span>
                    {` `}Mode you import PGNs (e.g. from Lichess), use the
                    opening tree and vision tools to analyze positions and
                    turn them into custom exercises stored locally and
                    optionally synced to the cloud
                  </p>
                </div>

                <div className="self-stretch flex flex-row items-center justify-center !pt-[0.75rem] !pb-[0rem] !pl-[0rem] !pr-[0rem] box-border max-w-full">
                  <div className="flex flex-col items-center justify-start gap-[1.25rem] max-w-full mq450:gap-[0.75rem]">
                    <Buttons
                      property1="Default"
                      logInButtonMarginTop="unset"
                      logInButtonHeight="4rem"
                      logInButtonWidth="28rem"
                      bUTTON="Training Mode"
                      bUTTONColor="#FF0000"
                      secondWordColor="#fff"
                      onLogInButtonContainerClick={onTRANINGTextClick}
                    />
                    <Buttons
                      property1="Default"
                      logInButtonMarginTop="unset"
                      onLogInButtonContainerClick={onButtonsContainerClick}
                      logInButtonHeight="4rem"
                      logInButtonWidth="28rem"
                      bUTTON="Creation Mode"
                      bUTTONColor="#00FFA3"
                      secondWordColor="#fff"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </main>
    </div>
  );
};

export default HomePage;
