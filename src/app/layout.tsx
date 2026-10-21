import type { Metadata } from "next";
import "./globals.css";
import { ContactProvider } from "@/components/contact-provider";
import { getContactDetails } from "@/lib/project-repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "PropMentors | Find the right space",
  description: "Find commercial spaces that fit your business, your team and the way you work — with PropMentors by your side.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body><ContactProvider details={await getContactDetails()}>{children}</ContactProvider></body>
    </html>
  );
}
