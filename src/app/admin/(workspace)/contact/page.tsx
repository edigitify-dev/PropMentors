import { requireAdmin } from "@/lib/admin-auth";
import { getContactDetails } from "@/lib/project-repository";
import { ContactEditor } from "@/components/admin/contact-editor";
export const metadata = { title: "Contact settings" };
export default async function ContactSettingsPage() { await requireAdmin(); return <ContactEditor details={await getContactDetails()} />; }
