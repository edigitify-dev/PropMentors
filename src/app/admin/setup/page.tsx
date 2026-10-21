import { redirect } from "next/navigation";
import { hasAdmin } from "@/lib/admin-auth";
import { AuthForm } from "@/components/admin/auth-form";
export default async function SetupPage() {
  if (await hasAdmin()) redirect("/admin/login");
  return <AuthForm setup />;
}
