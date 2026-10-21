export async function adminRequest(url: string, method: string, data: unknown) {
  const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Your changes could not be saved.");
  return result;
}
