import { z } from "zod";
import { database } from "@/lib/db";
import { adminMutation, ApiError, apiResponse, readJson } from "@/lib/api-utils";
const schema = z.object({ status: z.enum(["new", "contacted", "closed"]), notes: z.string().trim().max(5000) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return apiResponse(async () => {
    await adminMutation(request);
    const { id } = await params;
    if (!z.uuid().safeParse(id).success) throw new ApiError(404, "Enquiry not found.");
    const { status, notes } = await readJson(request, schema);
    const result = await database().query("UPDATE enquiries SET status=$2, notes=$3, updated_at=now() WHERE id=$1", [id, status, notes]);
    if (!result.rowCount) throw new ApiError(404, "Enquiry not found.");
    return Response.json({ ok: true });
  });
}
