import type { Metadata } from "next";
import { Inter, Russo_One } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import { AuthProvider } from "@/context/AuthContext";
import { SOSProvider } from "@/context/SOSContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const russo = Russo_One({ weight: "400", subsets: ["latin"], variable: "--font-russo" });

export const metadata: Metadata = {
  title: "Smart-Society OS | Future of Neighborhoods",
  description: "Experience the next generation of community living with Smart-Society OS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${russo.variable} font-sans antialiased text-gray-950`}>
        <AuthProvider>
          <SOSProvider>
            <SmoothScroll>
              {children}
            </SmoothScroll>
          </SOSProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
