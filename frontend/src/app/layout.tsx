import type { Metadata } from "next";
import { Nunito, Poppins, Gochi_Hand, Patrick_Hand } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/lib/context/AuthContext";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const gochiHand = Gochi_Hand({
  subsets: ["latin"],
  variable: "--font-gochi-hand",
  weight: ["400"],
});

const patrickHand = Patrick_Hand({
  subsets: ["latin"],
  variable: "--font-patrick-hand",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Youth Sakti Social Foundation | Youth Energy for Social Impact",
  description: "YSSF is a youth-driven ecosystem connecting volunteers, donors, and communities for environmental restoration, health drives, education campaigns, and social transparency.",
};

export default function RootLayout({
  children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${poppins.variable} ${gochiHand.variable} ${patrickHand.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-white text-foreground selection:bg-primary-200 selection:text-primary-900">
        <AuthProvider>
        {/* Navigation Header */}
        <Navigation />

        {/* Page Content */}
        <main className="flex-grow">{children}</main>

        {/* Footer */}
        <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
