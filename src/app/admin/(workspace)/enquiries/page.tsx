import { requireAdmin } from "@/lib/admin-auth";
import { getEnquiries } from "@/lib/project-repository";
import { EnquiryInbox } from "@/components/admin/enquiry-inbox";
export const metadata = { title: "Enquiries" };
export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<{ selected?: string }> }) {
  await requireAdmin();
  return <EnquiryInbox enquiries={await getEnquiries()} selectedId={(await searchParams).selected} />;
}
