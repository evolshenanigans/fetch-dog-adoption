import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fetch Dog Adoption",
  description: "Find your perfect dog companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}