import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "UniSenate",
    template: "%s · UniSenate",
  },
  description:
    "Manage university senate meetings around published agenda checklists, VC progress tracking, and official records.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${manrope.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-mist text-carbon font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
