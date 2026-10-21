import { database } from "@/lib/db";
import { adminMutation, apiResponse, readJson } from "@/lib/api-utils";
import { contactSchema } from "@/lib/admin-validation";
import { revalidatePath } from "next/cache";

export async function PUT(request: Request) {
  return apiResponse(async () => {
    await adminMutation(request);
    const details = await readJson(request, contactSchema);
    await database().query("INSERT INTO contact_settings (id, payload) VALUES (1,$1) ON CONFLICT (id) DO UPDATE SET payload=$1, updated_at=now()", [JSON.stringify(details)]);
    revalidatePath("/", "layout");
    return Response.json({ ok: true });
  });
}
