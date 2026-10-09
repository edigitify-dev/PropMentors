import type { Metadata } from "next";
import { ListYourSpacePage } from "@/components/list-your-space-page";

export const metadata: Metadata = {
  title: "List Your Space | PropMentors",
  description:
    "List your commercial space on PropMentors and connect with businesses actively looking for their next workspace. Your space deserves the right tenant.",
};

export default function ListYourSpace() {
  return <ListYourSpacePage />;
}
