type EnquiryInput = { name: string; email: string; phone: string; subject: string; message: string; source: string; projectId?: string; website?: string };
export async function submitEnquiry(enquiry: EnquiryInput) {
  const response = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(enquiry) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "We couldn’t send your enquiry. Please try again.");
}
