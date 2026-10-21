import { randomUUID } from "node:crypto";
import { database } from "@/lib/db";
import { ApiError, apiResponse, checkOrigin, rateLimit, readJson, requestClient } from "@/lib/api-utils";
import { enquirySchema } from "@/lib/admin-validation";

export async function POST(request: Request) {
  return apiResponse(async () => {
    checkOrigin(request);
    const enquiry = await readJson(request, enquirySchema);
    if (enquiry.website) return Response.json({ ok: true }, { status: 201 });
    await rateLimit(`enquiry:${enquiry.email.toLowerCase()}`, 5, 10);
    await rateLimit(`enquiry-client:${requestClient(request)}`, 100, 10);
    if (enquiry.projectId) {
      const project = await database().query("SELECT id FROM projects WHERE id=$1 AND status='published'", [enquiry.projectId]);
      if (!project.rowCount) throw new ApiError(400, "This project is no longer available. Contact our team directly.");
    }
    await database().query(
      "INSERT INTO enquiries (id,name,email,phone,subject,message,source,project_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
      [randomUUID(), enquiry.name, enquiry.email.toLowerCase(), enquiry.phone, enquiry.subject, enquiry.message, enquiry.source, enquiry.projectId || null],
    );
    return Response.json({ ok: true }, { status: 201 });
  });
}
