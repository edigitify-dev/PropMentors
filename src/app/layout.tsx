import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PropMentors | Find the right space",
  description: "Find commercial spaces that fit your business, your team and the way you work — with PropMentors by your side.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
