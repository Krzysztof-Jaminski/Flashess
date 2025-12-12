"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Orb {
  id: number;
  size: number;
  x: number;
  y: number;
  opacity: number;
  blur: number;
  color: string;
}

interface AnimatedBackgroundProps {
  variant?: 'home' | 'training' | 'creation' | 'login' | 'register';
}

// Konfiguracje orbów ułożonych w słowo FLASHESS - dłuższe i wyższe, mieszczące się na szerokość ekranu
const createFlashessOrbs = (): Orb[] => {
  const orbs: Orb[] = [];
  const baseY = 63; // Przesunięte w dół o ~5%
  const letterSpacing = 12; // Odstęp między literami
  const startX = 7; // Przesunięte trochę w lewo
  const orbSize = 100; // Większe elipsy
  const orbOpacity = 0.16; // Intensywność
  const orbBlur = 50; // Rozmycie
  const letterHeight = 38; // Wyższe litery
  const letterWidth = 15; // Szersze litery
  const leftOffset = -3; // Offset do góry dla lewej części (F i początek L)
  const greenColor = "0,255,163"; // Zielonkawy kolor dla ESS
  
  // Litera F - wyższa i szersza, podciągnięta do góry
  // Górna belka
  orbs.push({ id: 1, size: orbSize, x: startX, y: baseY - letterHeight + leftOffset, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 2, size: orbSize, x: startX + letterWidth * 0.3, y: baseY - letterHeight + leftOffset, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 3, size: orbSize, x: startX + letterWidth * 0.6, y: baseY - letterHeight + leftOffset, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 4, size: orbSize, x: startX + letterWidth, y: baseY - letterHeight + leftOffset, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  // Pionowa belka
  orbs.push({ id: 5, size: orbSize, x: startX, y: baseY - letterHeight + leftOffset, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 6, size: orbSize, x: startX, y: baseY - letterHeight * 0.5 + leftOffset, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 7, size: orbSize, x: startX, y: baseY + leftOffset, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 8, size: orbSize, x: startX, y: baseY + letterHeight * 0.5 + leftOffset, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 9, size: orbSize, x: startX, y: baseY + letterHeight + leftOffset, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  // Środkowa belka
  orbs.push({ id: 10, size: orbSize, x: startX, y: baseY - letterHeight * 0.5 + leftOffset, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 11, size: orbSize, x: startX + letterWidth * 0.3, y: baseY - letterHeight * 0.5 + leftOffset, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 12, size: orbSize, x: startX + letterWidth * 0.6, y: baseY - letterHeight * 0.5 + leftOffset, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  
  // Litera L - lewa część podciągnięta do góry
  const lStartX = startX + letterSpacing;
  const lLeftOffset = -2; // Mniejszy offset dla L
  // Pionowa belka
  orbs.push({ id: 13, size: orbSize, x: lStartX, y: baseY - letterHeight + lLeftOffset, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 14, size: orbSize, x: lStartX, y: baseY - letterHeight * 0.5 + lLeftOffset, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 15, size: orbSize, x: lStartX, y: baseY + lLeftOffset, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 16, size: orbSize, x: lStartX, y: baseY + letterHeight * 0.5 + lLeftOffset, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 17, size: orbSize, x: lStartX, y: baseY + letterHeight + lLeftOffset, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  // Pozioma belka
  orbs.push({ id: 18, size: orbSize, x: lStartX, y: baseY + letterHeight, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 19, size: orbSize, x: lStartX + letterWidth * 0.3, y: baseY + letterHeight, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 20, size: orbSize, x: lStartX + letterWidth * 0.6, y: baseY + letterHeight, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 21, size: orbSize, x: lStartX + letterWidth, y: baseY + letterHeight, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  
  // Litera A
  const aStartX = lStartX + letterSpacing;
  // Lewa belka
  orbs.push({ id: 22, size: orbSize, x: aStartX, y: baseY + letterHeight, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 23, size: orbSize, x: aStartX + letterWidth * 0.15, y: baseY + letterHeight * 0.5, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 24, size: orbSize, x: aStartX + letterWidth * 0.3, y: baseY, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 25, size: orbSize, x: aStartX + letterWidth * 0.45, y: baseY - letterHeight * 0.5, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 26, size: orbSize, x: aStartX + letterWidth * 0.6, y: baseY - letterHeight, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  // Prawa belka
  orbs.push({ id: 27, size: orbSize, x: aStartX + letterWidth, y: baseY + letterHeight, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 28, size: orbSize, x: aStartX + letterWidth * 0.85, y: baseY + letterHeight * 0.5, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 29, size: orbSize, x: aStartX + letterWidth * 0.7, y: baseY, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 30, size: orbSize, x: aStartX + letterWidth * 0.55, y: baseY - letterHeight * 0.5, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 31, size: orbSize, x: aStartX + letterWidth * 0.4, y: baseY - letterHeight, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  // Pozioma belka
  orbs.push({ id: 32, size: orbSize, x: aStartX + letterWidth * 0.15, y: baseY, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 33, size: orbSize, x: aStartX + letterWidth * 0.3, y: baseY, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 34, size: orbSize, x: aStartX + letterWidth * 0.45, y: baseY, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 35, size: orbSize, x: aStartX + letterWidth * 0.6, y: baseY, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 36, size: orbSize, x: aStartX + letterWidth * 0.75, y: baseY, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  
  // Litera S
  const sStartX = aStartX + letterSpacing;
  // Górna część
  orbs.push({ id: 37, size: orbSize, x: sStartX, y: baseY - letterHeight, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 38, size: orbSize, x: sStartX + letterWidth * 0.3, y: baseY - letterHeight, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 39, size: orbSize, x: sStartX + letterWidth * 0.6, y: baseY - letterHeight, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 40, size: orbSize, x: sStartX + letterWidth, y: baseY - letterHeight, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 41, size: orbSize, x: sStartX, y: baseY - letterHeight * 0.5, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  // Środkowa część
  orbs.push({ id: 42, size: orbSize, x: sStartX, y: baseY, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 43, size: orbSize, x: sStartX + letterWidth * 0.3, y: baseY, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 44, size: orbSize, x: sStartX + letterWidth * 0.6, y: baseY, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 45, size: orbSize, x: sStartX + letterWidth, y: baseY, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 46, size: orbSize, x: sStartX + letterWidth, y: baseY + letterHeight * 0.5, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  // Dolna część
  orbs.push({ id: 47, size: orbSize, x: sStartX, y: baseY + letterHeight * 0.5, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 48, size: orbSize, x: sStartX + letterWidth * 0.3, y: baseY + letterHeight * 0.75, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 49, size: orbSize, x: sStartX + letterWidth * 0.6, y: baseY + letterHeight, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 50, size: orbSize, x: sStartX + letterWidth, y: baseY + letterHeight, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  
  // Litera H
  const hStartX = sStartX + letterSpacing;
  // Lewa pionowa belka
  orbs.push({ id: 51, size: orbSize, x: hStartX, y: baseY - letterHeight, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 52, size: orbSize, x: hStartX, y: baseY - letterHeight * 0.5, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 53, size: orbSize, x: hStartX, y: baseY, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 54, size: orbSize, x: hStartX, y: baseY + letterHeight * 0.5, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 55, size: orbSize, x: hStartX, y: baseY + letterHeight, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  // Pozioma belka
  orbs.push({ id: 56, size: orbSize, x: hStartX, y: baseY, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 57, size: orbSize, x: hStartX + letterWidth * 0.3, y: baseY, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 58, size: orbSize, x: hStartX + letterWidth * 0.6, y: baseY, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 59, size: orbSize, x: hStartX + letterWidth, y: baseY, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  // Prawa pionowa belka
  orbs.push({ id: 60, size: orbSize, x: hStartX + letterWidth, y: baseY - letterHeight, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 61, size: orbSize, x: hStartX + letterWidth, y: baseY - letterHeight * 0.5, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 62, size: orbSize, x: hStartX + letterWidth, y: baseY, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 63, size: orbSize, x: hStartX + letterWidth, y: baseY + letterHeight * 0.5, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  orbs.push({ id: 64, size: orbSize, x: hStartX + letterWidth, y: baseY + letterHeight, opacity: orbOpacity, blur: orbBlur, color: "36,245,228" });
  
  // Litera E (pierwsza) - zielonkawa
  const e1StartX = hStartX + letterSpacing;
  // Górna belka
  orbs.push({ id: 65, size: orbSize, x: e1StartX, y: baseY - letterHeight, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  orbs.push({ id: 66, size: orbSize, x: e1StartX + letterWidth * 0.3, y: baseY - letterHeight, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  orbs.push({ id: 67, size: orbSize, x: e1StartX + letterWidth * 0.6, y: baseY - letterHeight, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  orbs.push({ id: 68, size: orbSize, x: e1StartX + letterWidth, y: baseY - letterHeight, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  // Pionowa belka
  orbs.push({ id: 69, size: orbSize, x: e1StartX, y: baseY - letterHeight, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  orbs.push({ id: 70, size: orbSize, x: e1StartX, y: baseY - letterHeight * 0.5, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  orbs.push({ id: 71, size: orbSize, x: e1StartX, y: baseY, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  orbs.push({ id: 72, size: orbSize, x: e1StartX, y: baseY + letterHeight * 0.5, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  orbs.push({ id: 73, size: orbSize, x: e1StartX, y: baseY + letterHeight, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  // Środkowa belka
  orbs.push({ id: 74, size: orbSize, x: e1StartX, y: baseY - letterHeight * 0.5, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  orbs.push({ id: 75, size: orbSize, x: e1StartX + letterWidth * 0.3, y: baseY - letterHeight * 0.5, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  orbs.push({ id: 76, size: orbSize, x: e1StartX + letterWidth * 0.6, y: baseY - letterHeight * 0.5, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  // Dolna belka
  orbs.push({ id: 77, size: orbSize, x: e1StartX, y: baseY + letterHeight, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  orbs.push({ id: 78, size: orbSize, x: e1StartX + letterWidth * 0.3, y: baseY + letterHeight, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  orbs.push({ id: 79, size: orbSize, x: e1StartX + letterWidth * 0.6, y: baseY + letterHeight, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  orbs.push({ id: 80, size: orbSize, x: e1StartX + letterWidth, y: baseY + letterHeight, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  
  // Litera S (druga) - zielonkawa
  const s2StartX = e1StartX + letterSpacing;
  // Górna część
  orbs.push({ id: 81, size: orbSize, x: s2StartX, y: baseY - letterHeight, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  orbs.push({ id: 82, size: orbSize, x: s2StartX + letterWidth * 0.3, y: baseY - letterHeight, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  orbs.push({ id: 83, size: orbSize, x: s2StartX + letterWidth * 0.6, y: baseY - letterHeight, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  orbs.push({ id: 84, size: orbSize, x: s2StartX + letterWidth, y: baseY - letterHeight, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  orbs.push({ id: 85, size: orbSize, x: s2StartX, y: baseY - letterHeight * 0.5, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  // Środkowa część
  orbs.push({ id: 86, size: orbSize, x: s2StartX, y: baseY, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  orbs.push({ id: 87, size: orbSize, x: s2StartX + letterWidth * 0.3, y: baseY, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  orbs.push({ id: 88, size: orbSize, x: s2StartX + letterWidth * 0.6, y: baseY, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  orbs.push({ id: 89, size: orbSize, x: s2StartX + letterWidth, y: baseY, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  orbs.push({ id: 90, size: orbSize, x: s2StartX + letterWidth, y: baseY + letterHeight * 0.5, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  // Dolna część
  orbs.push({ id: 91, size: orbSize, x: s2StartX, y: baseY + letterHeight * 0.5, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  orbs.push({ id: 92, size: orbSize, x: s2StartX + letterWidth * 0.3, y: baseY + letterHeight * 0.75, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  orbs.push({ id: 93, size: orbSize, x: s2StartX + letterWidth * 0.6, y: baseY + letterHeight, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  orbs.push({ id: 94, size: orbSize, x: s2StartX + letterWidth, y: baseY + letterHeight, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  
  // Litera S (trzecia) - zielonkawa
  const s3StartX = s2StartX + letterSpacing;
  // Górna część
  orbs.push({ id: 95, size: orbSize, x: s3StartX, y: baseY - letterHeight, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  orbs.push({ id: 96, size: orbSize, x: s3StartX + letterWidth * 0.3, y: baseY - letterHeight, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  orbs.push({ id: 97, size: orbSize, x: s3StartX + letterWidth * 0.6, y: baseY - letterHeight, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  orbs.push({ id: 98, size: orbSize, x: s3StartX + letterWidth, y: baseY - letterHeight, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  orbs.push({ id: 99, size: orbSize, x: s3StartX, y: baseY - letterHeight * 0.5, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  // Środkowa część
  orbs.push({ id: 100, size: orbSize, x: s3StartX, y: baseY, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  orbs.push({ id: 101, size: orbSize, x: s3StartX + letterWidth * 0.3, y: baseY, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  orbs.push({ id: 102, size: orbSize, x: s3StartX + letterWidth * 0.6, y: baseY, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  orbs.push({ id: 103, size: orbSize, x: s3StartX + letterWidth, y: baseY, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  orbs.push({ id: 104, size: orbSize, x: s3StartX + letterWidth, y: baseY + letterHeight * 0.5, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  // Dolna część
  orbs.push({ id: 105, size: orbSize, x: s3StartX, y: baseY + letterHeight * 0.5, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  orbs.push({ id: 106, size: orbSize, x: s3StartX + letterWidth * 0.3, y: baseY + letterHeight * 0.75, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  orbs.push({ id: 107, size: orbSize, x: s3StartX + letterWidth * 0.6, y: baseY + letterHeight, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  orbs.push({ id: 108, size: orbSize, x: s3StartX + letterWidth, y: baseY + letterHeight, opacity: orbOpacity, blur: orbBlur, color: greenColor });
  
  return orbs;
};

// Home używa FLASHESS, pozostałe strony mają pustą listę (używają statycznych elips)
const orbConfigs: Record<string, Orb[]> = {
  home: createFlashessOrbs(),
  training: [],
  creation: [],
  login: [],
  register: [],
};

export default function AnimatedBackground({ variant = 'home' }: AnimatedBackgroundProps) {
  const [mounted, setMounted] = useState(false);
  const orbs = orbConfigs[variant] || orbConfigs.home;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Bazowy gradient tła */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 100% 80% at 50% -25%, rgba(36,245,228,0.15) 0%, transparent 50%),
            radial-gradient(ellipse 85% 65% at 110% 50%, rgba(36,245,228,0.12) 0%, transparent 45%),
            radial-gradient(ellipse 85% 65% at -10% 75%, rgba(36,245,228,0.13) 0%, transparent 45%),
            radial-gradient(ellipse 70% 50% at 50% 100%, rgba(0,255,163,0.1) 0%, transparent 50%),
            linear-gradient(180deg, #010706 0%, #020a08 30%, #010706 70%, #000504 100%)
          `,
        }}
      />

      {/* Animowana siatka */}
      <motion.div 
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{
          backgroundImage: `
            linear-gradient(rgba(36,245,228,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(36,245,228,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '90px 90px',
          maskImage: 'radial-gradient(ellipse 90% 70% at 50% 50%, black 5%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 50%, black 5%, transparent 75%)',
        }}
      />

      {/* Elipsy ułożone w słowo FLASHESS - pod kątem, bez animacji, mieszczące się na szerokość ekranu */}
      {mounted && orbs.length > 0 && (
        <div
          className="absolute inset-0"
          style={{
            transform: 'rotate(-3deg)', // Pod kątem -3 stopni (prawie wyprostowane)
          }}
        >
          {orbs.map((orb) => (
            <div
              key={`${variant}-${orb.id}`}
              className="absolute rounded-full"
              style={{
                width: `${orb.size}px`,
                height: `${orb.size}px`,
                left: `${orb.x}%`,
                top: `${orb.y}%`,
                background: `
                  radial-gradient(circle at 30% 30%, 
                    rgba(${orb.color},${orb.opacity * 1.5}) 0%, 
                    rgba(${orb.color},${orb.opacity * 1.2}) 25%, 
                    rgba(${orb.color},${orb.opacity * 0.6}) 50%,
                    rgba(${orb.color},${orb.opacity * 0.2}) 70%,
                    transparent 85%
                  )
                `,
                filter: `blur(${orb.blur}px)`,
                transform: 'translate(-50%, -50%)',
                boxShadow: `
                  inset 0 0 ${orb.size * 0.4}px rgba(${orb.color},${orb.opacity * 0.4}),
                  0 0 ${orb.size * 0.6}px rgba(${orb.color},${orb.opacity * 0.25})
                `,
              }}
            />
          ))}
        </div>
      )}

      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.01]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Głęboki gradient overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg, rgba(1,7,6,0.5) 0%, transparent 12%, transparent 88%, rgba(1,7,6,0.7) 100%),
            linear-gradient(90deg, rgba(1,7,6,0.4) 0%, transparent 12%, transparent 88%, rgba(1,7,6,0.4) 100%)
          `,
        }}
      />

      {/* Vignette effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 25%, rgba(1,7,6,0.6) 100%)',
        }}
      />
    </div>
  );
}
