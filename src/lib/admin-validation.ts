import { z } from "zod";

const text = (max = 200) => z.string().trim().max(max);
const required = (max = 200) => text(max).min(1, "This field is required.");
export const imageSource = z.string().max(2048).refine((value) => {
  if (/^\/(?!\/)[^\s\\]*$/.test(value)) return true;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
}, "Use an HTTPS image URL or a local image path.");
const image = z.object({
  id: required(), src: imageSource, alt: text(500), width: z.number().int().positive().max(20000), height: z.number().int().positive().max(20000),
  cropWidth: z.number().positive().max(20000), cropHeight: z.number().positive().max(20000), cropTop: z.number().min(0).max(20000),
});
const facts = z.array(z.tuple([required(), required(2000)])).max(60);
export const projectSchema = z.object({
  id: required(), slug: required(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens for the URL."),
  aliases: z.array(required(160)).max(30).optional(), name: required(), location: required(80), locationLabel: required(),
  type: required(80), category: required(80), badge: required(80), price: z.number().min(0).max(999999999999).nullable(),
  features: z.array(required()).max(30), cover: image, spaceType: text(80).optional(),
  finishedTypes: z.array(z.enum(["Bare shell", "Semi-Furnished", "Ready-to-move"])).max(3).optional(), amenities: z.array(required()).max(60).optional(),
  detail: z.object({
    description: required(15000), overview: facts, building: facts, amenities: z.array(required()).max(60), gallery: z.array(image).max(40),
    spaces: z.array(z.object({ id: required(), title: required(), location: text(), description: text(3000), badge: text(80), image })).max(20),
    location: z.object({
      address: required(1000), caption: text(1000), directionsQuery: required(1000), map: image, nearby: facts,
      coordinates: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }).optional(),
    }),
    views: z.object({ floorPlan: image.optional(), interior: image, exterior: image }), photoViewsOnly: z.boolean().optional(),
    startingPrice: required(), startingPriceUnit: text(), highlights: z.array(required(1000)).max(20),
    benefits: z.array(z.object({ title: required(), description: required(2000) })).max(12), similarProjectIds: z.array(required()).max(12),
  }),
});
export const projectInputSchema = z.object({ project: projectSchema, status: z.enum(["draft", "published", "archived"]), updatedAt: z.iso.datetime().optional() });
export const contactSchema = z.object({
  phone: required(40).regex(/^[+\d\s().-]{5,40}$/, "Enter a valid phone number."), email: z.email().max(254),
  address: required(1000), heading: required(160), introduction: required(2000),
});
export const enquirySchema = z.object({
  name: required(120), email: z.email().max(254), phone: required(40), subject: required(180), message: required(5000),
  source: z.enum(["contact", "project", "requirement", "footer", "home", "about", "listing"]).default("contact"),
  projectId: text().optional(), website: text(200).optional(),
});
export const loginSchema = z.object({ email: z.email().max(254).transform((s) => s.toLowerCase()), password: z.string().min(1).max(256) });
export const setupSchema = loginSchema.extend({ name: required(120), password: z.string().min(12, "Choose a password with at least 12 characters.").max(256), setupKey: required(256) });
