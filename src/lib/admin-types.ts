import type { Project } from "@/lib/project-types";

export type ProjectStatus = "draft" | "published" | "archived";
export type AdminProject = { project: Project; status: ProjectStatus; createdAt: string; updatedAt: string };
export type AdminIdentity = { id: string; name: string; email: string };
export type EnquiryStatus = "new" | "contacted" | "closed";
export type Enquiry = {
  id: string; name: string; email: string; phone: string; subject: string; message: string;
  source: string; projectId: string | null; projectName: string | null;
  status: EnquiryStatus; notes: string; createdAt: string;
};
export type ContactDetails = { phone: string; email: string; address: string; heading: string; introduction: string };
export const defaultContactDetails: ContactDetails = {
  phone: "+91 8010178010", email: "hello@propmentors.com",
  address: "G.F.C Business Centre, H Block,\nConnaught Place, Delhi - 110001",
  heading: "Ready?\nLet’s Talk",
  introduction: "From first conversations to final decisions - we’re here to make every step clearer, simpler, and more thoughtful.",
};
