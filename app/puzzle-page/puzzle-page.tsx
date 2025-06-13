"use client";
import type { NextPage } from "next";
import { useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import TopBar from "../../components/topbar";

const PuzzlePage: NextPage = () => {
  const router = useRouter();

  const onGroupContainerClick = useCallback(() => {
    router.push("/puzzle-page");
  }, [router]);

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

      <main className="w-full flex flex-col !pt-[0rem] !pb-[26.625rem] !pl-[0rem] !pr-[0rem] box-border gap-[2.625rem] max-w-full mq1225:!pb-[7.313rem] mq1225:box-border mq450:gap-[1.313rem] mq450:!pb-[4.75rem] mq450:box-border mq1525:h-auto">
        <main className="w-full flex flex-col gap-[5.062rem] max-w-full text-left text-[0.938rem] text-White font-['Russo_One'] mq850:gap-[2.5rem] mq450:gap-[1.25rem]">
          <div className="w-full">
            <TopBar />
          </div>
          
          {/* Puzzle Page Specific Content */}
        <section className="flex flex-row items-start justify-end !pt-[0rem] !pb-[0rem] !pl-[3.625rem] !pr-[3.625rem] box-border max-w-full text-center text-[1.25rem] text-White font-['Russo_One'] mq1225:!pl-[1.813rem] mq1225:!pr-[1.813rem] mq1225:box-border">
          <div className="w-[54.75rem] flex flex-row items-start justify-start relative max-w-full">
            <div className="flex-1 bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.3)] border-solid border-[1px] box-border flex flex-row items-start justify-between !pt-[0.875rem] !pb-[0.875rem] !pl-[2.437rem] !pr-[0.125rem] gap-[1.25rem] shrink-0 max-w-full mq1225:flex-wrap">
              <div className="h-[31.25rem] w-[31.25rem] flex flex-col items-start justify-start z-[3] mq1225:flex-1 mq1225:min-w-full">
                  {/* Puzzle Grid */}
                <div className="w-[31.25rem] h-[3.906rem] flex flex-row items-start justify-start">
                  <div className="w-[3.906rem] relative shadow-[-4px_-4px_4px_rgba(255,_255,_255,_0.06)_inset,_4px_4px_5px_rgba(0,_0,_0,_0.48)_inset] bg-[#282f3b] h-[3.906rem] overflow-hidden shrink-0" />
                  <div className="w-[3.906rem] relative shadow-[-4px_-4px_4px_rgba(0,_0,_0,_0.25)_inset,_4px_4px_5px_rgba(255,_255,_255,_0.48)_inset] bg-[#677081] h-[3.906rem] overflow-hidden shrink-0" />
                  <div className="w-[3.906rem] relative shadow-[-4px_-4px_4px_rgba(255,_255,_255,_0.06)_inset,_4px_4px_5px_rgba(0,_0,_0,_0.48)_inset] bg-[#282f3b] h-[3.906rem] overflow-hidden shrink-0" />
                  <div className="w-[3.906rem] relative shadow-[-4px_-4px_4px_rgba(0,_0,_0,_0.25)_inset,_4px_4px_5px_rgba(255,_255,_255,_0.48)_inset] bg-[#677081] h-[3.906rem] overflow-hidden shrink-0" />
                  <div className="w-[3.906rem] relative shadow-[-4px_-4px_4px_rgba(255,_255,_255,_0.06)_inset,_4px_4px_5px_rgba(0,_0,_0,_0.48)_inset] bg-[#282f3b] h-[3.906rem] overflow-hidden shrink-0" />
                  <div className="w-[3.906rem] relative shadow-[-4px_-4px_4px_rgba(0,_0,_0,_0.25)_inset,_4px_4px_5px_rgba(255,_255,_255,_0.48)_inset] bg-[#677081] h-[3.906rem] overflow-hidden shrink-0" />
                  <div className="w-[3.906rem] relative shadow-[-4px_-4px_4px_rgba(255,_255,_255,_0.06)_inset,_4px_4px_5px_rgba(0,_0,_0,_0.48)_inset] bg-[#282f3b] h-[3.906rem] overflow-hidden shrink-0" />
                  <div className="w-[3.906rem] relative shadow-[-4px_-4px_4px_rgba(0,_0,_0,_0.25)_inset,_4px_4px_5px_rgba(255,_255,_255,_0.48)_inset] bg-[#677081] h-[3.906rem] overflow-hidden shrink-0" />
                </div>
                  {/* Repeat the grid pattern 7 more times */}
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="w-[31.25rem] h-[3.906rem] flex flex-row items-start justify-start">
                  <div className="w-[3.906rem] relative shadow-[-4px_-4px_4px_rgba(255,_255,_255,_0.06)_inset,_4px_4px_5px_rgba(0,_0,_0,_0.48)_inset] bg-[#282f3b] h-[3.906rem] overflow-hidden shrink-0" />
                  <div className="w-[3.906rem] relative shadow-[-4px_-4px_4px_rgba(0,_0,_0,_0.25)_inset,_4px_4px_5px_rgba(255,_255,_255,_0.48)_inset] bg-[#677081] h-[3.906rem] overflow-hidden shrink-0" />
                  <div className="w-[3.906rem] relative shadow-[-4px_-4px_4px_rgba(255,_255,_255,_0.06)_inset,_4px_4px_5px_rgba(0,_0,_0,_0.48)_inset] bg-[#282f3b] h-[3.906rem] overflow-hidden shrink-0" />
                  <div className="w-[3.906rem] relative shadow-[-4px_-4px_4px_rgba(0,_0,_0,_0.25)_inset,_4px_4px_5px_rgba(255,_255,_255,_0.48)_inset] bg-[#677081] h-[3.906rem] overflow-hidden shrink-0" />
                  <div className="w-[3.906rem] relative shadow-[-4px_-4px_4px_rgba(255,_255,_255,_0.06)_inset,_4px_4px_5px_rgba(0,_0,_0,_0.48)_inset] bg-[#282f3b] h-[3.906rem] overflow-hidden shrink-0" />
                  <div className="w-[3.906rem] relative shadow-[-4px_-4px_4px_rgba(0,_0,_0,_0.25)_inset,_4px_4px_5px_rgba(255,_255,_255,_0.48)_inset] bg-[#677081] h-[3.906rem] overflow-hidden shrink-0" />
                  <div className="w-[3.906rem] relative shadow-[-4px_-4px_4px_rgba(255,_255,_255,_0.06)_inset,_4px_4px_5px_rgba(0,_0,_0,_0.48)_inset] bg-[#282f3b] h-[3.906rem] overflow-hidden shrink-0" />
                  <div className="w-[3.906rem] relative shadow-[-4px_-4px_4px_rgba(0,_0,_0,_0.25)_inset,_4px_4px_5px_rgba(255,_255,_255,_0.48)_inset] bg-[#677081] h-[3.906rem] overflow-hidden shrink-0" />
                </div>
                  ))}
              </div>
              <div className="flex flex-col items-start justify-start !pt-[3.437rem] !pb-[0rem] !pl-[0rem] !pr-[0rem] box-border min-w-[13.75rem] mq1225:flex-1 mq450:!pt-[2.25rem] mq450:box-border">
                <div className="self-stretch flex flex-col items-start justify-start gap-[6.562rem]">
                  <div className="self-stretch relative z-[2] mq450:text-[1rem]">
                    <p className="!m-0">Time:</p>
                    <p className="!m-0">180 sec</p>
                  </div>
                  <div className="self-stretch flex flex-col items-start justify-start gap-[5.75rem]">
                    <div className="self-stretch relative z-[2] mq450:text-[1rem]">
                      <p className="!m-0">Score:</p>
                      <p className="!m-0">10</p>
                    </div>
                    <div className="self-stretch h-[6rem] relative inline-block shrink-0 z-[2] mq450:text-[1rem]">
                      <p className="!m-0">Record:</p>
                      <p className="!m-0">11</p>
                    </div>
                  </div>
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

export default PuzzlePage;
