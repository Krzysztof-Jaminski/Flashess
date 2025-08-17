import "./global.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Flashess",
  description: "Flashcard-style chess training platform built for opening preparation and tactical sharpness",
  icons: {
    icon: [
      { url: "/FlashessLogo.ico", sizes: "any" },
      { url: "/FlashessLogo.png", sizes: "32x32", type: "image/png" }
    ],
    shortcut: "/FlashessLogo.ico",
    apple: "/FlashessLogo.png"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
