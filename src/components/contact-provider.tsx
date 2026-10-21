"use client";
import { createContext, useContext } from "react";
import { defaultContactDetails, type ContactDetails } from "@/lib/admin-types";
const ContactContext = createContext<ContactDetails>(defaultContactDetails);
export function ContactProvider({ details, children }: { details: ContactDetails; children: React.ReactNode }) {
  return <ContactContext.Provider value={details}>{children}</ContactContext.Provider>;
}
export const useContactDetails = () => useContext(ContactContext);
