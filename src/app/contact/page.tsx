import type { Metadata } from "next";
import { ContactPage } from "@/components/contact-page";

export const metadata: Metadata = {
  title: "Contact PropMentors | Ready? Let’s Talk",
  description: "Talk to PropMentors about your next commercial space. From first conversations to final decisions, we make every step clearer, simpler and more thoughtful.",
};

export default function Contact() {
  return <ContactPage />;
}
