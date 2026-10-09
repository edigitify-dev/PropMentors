import type { Metadata } from "next";
import { AboutPage } from "@/components/about-page";

export const metadata: Metadata = {
  title: "About PropMentors | Space Is The Product",
  description: "Commercial real estate guidance built around better decisions. Meet PropMentors and explore how we help businesses find the right space.",
};

export default function About() {
  return <AboutPage />;
}
