import { adminMutation, apiResponse, ApiError } from "@/lib/api-utils";

// Preserve authentication on the retired route; bulk migration runs outside HTTP
// request limits and verifies every copy before switching database references.
export async function POST(request: Request) {
  return apiResponse(async () => {
    await adminMutation(request);
    throw new ApiError(410, "Image storage has moved to R2. Run npm run migrate:r2 -- --apply from the project directory.");
  });
}
