import type { Metadata } from "next";
import { AboutPage } from "@/components/about-page";
import { getPublishedProjects } from "@/lib/project-repository";

export const metadata: Metadata = {
  title: "About PropMentors | Space Is The Product",
  description: "Managed real estate guidance built around better decisions. Meet PropMentors and explore how we help businesses find the right space.",
};

export default async function About() {
  return <AboutPage projects={await getPublishedProjects()} />;
}
