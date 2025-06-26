"use client";
import type { NextPage } from "next";
import { useCallback, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Buttons from "../components/buttons";
import TopBar from "../components/topbar";

const HomePage: NextPage = () => {
  const router = useRouter();
  const [pingResult, setPingResult] = useState<string>("");

  const onLogInButtonContainerClick = useCallback(() => {
    router.push("/login-page");
  }, [router]);

  const onButtonsContainerClick = useCallback(() => {
    router.push("/creation-page");
  }, [router]);

  const onTopBarContainerClick = useCallback(() => {
    router.push("/register-page");
  }, [router]);

  const onTRANINGTextClick = useCallback(() => {
    router.push("/training-page");
  }, [router]);

  const handlePing = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/ChessPreparation/ping");
      const text = await res.text();
      setPingResult(text);
    } catch (e) {
      setPingResult("Błąd połączenia");
    }
  };

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

      <main className="w-full h-[182rem] flex flex-col !pt-[0rem] !pb-[26.625rem] !pl-[0rem] !pr-[0rem] box-border gap-[2.625rem] max-w-full mq1225:!pb-[7.313rem] mq1225:box-border mq450:gap-[1.313rem] mq450:!pb-[4.75rem] mq450:box-border mq1525:h-auto">
        <main className="w-full flex flex-col gap-[5.062rem] max-w-full text-left text-[0.938rem] text-White font-['Russo_One'] mq850:gap-[2.5rem] mq450:gap-[1.25rem]">
          <div className="w-full">
            <TopBar />
          </div>
          <section className="w-full flex flex-row items-center justify-center gap-[6.375rem] mq850:gap-[3.188rem] mq450:gap-[1.563rem] mq1525:flex-wrap">
            <div className="flex-1 flex flex-col items-center justify-center gap-[43rem] max-w-full mq850:gap-[21.5rem] mq1225:min-w-full mq450:gap-[10.75rem]">
              <div className="self-stretch flex flex-row items-center justify-center w-full mq1525:flex-wrap">
                <section className="w-[46.563rem] flex flex-col items-center justify-center !pt-[6rem] !pb-[0rem] !pl-[0rem] !pr-[0rem] box-border max-w-full text-center text-[0.938rem] font-['Russo_One'] mq850:!pt-[3.875rem] mq850:box-border mq850:min-w-full mq1525:flex-1">
                  <div className="self-stretch flex flex-col items-center justify-start gap-[7.75rem] max-w-full mq850:gap-[3.875rem] mq450:gap-[1.938rem]">
                    <div className="relative z-[1]">
                      <p className="!m-0">
                        <span className="text-[rgba(36,245,228,0.84)]">
                          Flashess
                        </span>{" "}
                        is a flashcard-style chess training platform built for
                        opening preparation and tactical sharpness
                      </p>
                      <p className="!m-0">&nbsp;</p>
                      <p className="!m-0">
                        {`In `}
                        <span className="text-[#FF0000]">Training</span>
                        {` `}Mode, you can practice using position sets — either
                        your own or shared by others — through classic formats
                        like puzzles, puzzle rush, time attack, or sudden death
                      </p>
                      <p className="!m-0">&nbsp;</p>
                      <p className="!m-0">
                        {`In `}
                        <span className="text-[#00FFA3]">Creation</span>
                        {` `}Mode, you can load games from other platforms like
                        Lichess, explore variations like an opening tree, and
                        turn any position into a flashcard
                      </p>
                    </div>
                    <div className="self-stretch flex flex-row items-center justify-center !pt-[0rem] !pb-[0rem] !pl-[0rem] !pr-[0rem] box-border max-w-full">
                      <div className="flex flex-col items-center justify-start gap-[3.5rem] max-w-full mq450:gap-[1.75rem]">
                        <Buttons
                          property1="Default"
                          logInButtonMarginTop="unset"
                          logInButtonHeight="3.188rem"
                          logInButtonWidth="24.375rem"
                          bUTTON="Training Mode"
                          bUTTONColor="#FF0000"
                          secondWordColor="#fff"
                          onLogInButtonContainerClick={onTRANINGTextClick}
                        />
                        <Buttons
                          property1="Default"
                          logInButtonMarginTop="unset"
                          onLogInButtonContainerClick={onButtonsContainerClick}
                          logInButtonHeight="3.188rem"
                          logInButtonWidth="24.375rem"
                          bUTTON="Creation Mode"
                          bUTTONColor="#00FFA3"
                          secondWordColor="#fff"
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </section>
        </main>
      </main>
    </div>
  );
};

export default HomePage;
