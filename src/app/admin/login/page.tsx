import { redirect } from "next/navigation";
import { getAdmin, hasAdmin } from "@/lib/admin-auth";
import { AuthForm } from "@/components/admin/auth-form";
export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  if (!await hasAdmin()) redirect("/admin/setup");
  return <AuthForm />;
}
