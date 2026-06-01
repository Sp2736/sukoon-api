import { z } from "zod";

// ── Property ─────────────────────────────────────────────────

export const propertySchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title too long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description too long"),
  price: z
    .string()
    .min(1, "Price is required")
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: "Price must be a positive number",
    }),
  location: z.string().min(2, "Location is required").max(255),
  city: z.string().min(1, "City is required").max(100),
  village: z.string().max(100).optional().or(z.literal("")),
  area_unit: z.enum(["sq. mtr", "sq. ft", "Acre"]),
  area_value: z
    .string()
    .min(1, "Area is required")
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: "Area must be a positive number",
    }),
  survey_number: z.string().max(100).optional().or(z.literal("")),
  category: z.enum(
    [
      "Residential",
      "Industrial",
      "Commercial",
      "Agricultural Land",
      "Non-agricultural Land",
    ],
    {
      message: "Select a valid category",
    },
  ),
  amenities: z.array(z.string()).default([]),
  configuration: z.string().max(100).optional().or(z.literal("")),
  floor_number: z.string().max(50).optional().or(z.literal("")),
  room_size: z.string().max(100).optional().or(z.literal("")),
  plot_size: z.string().max(100).optional().or(z.literal("")),
  zone_type: z.string().max(100).optional().or(z.literal("")),
  fencing: z.string().max(50).optional().or(z.literal("")),
  related_properties: z
    .preprocess(
      (val) => {
        if (!val) return [];
        if (typeof val === "string") return [val];
        return val;
      },
      z
        .array(z.string())
        .max(3, "You can select a maximum of 3 related properties"),
    )
    .optional(),
  is_published: z.boolean().default(false),
});

export type PropertyFormValues = z.infer<typeof propertySchema>;

// ── Inquiry / Contact ────────────────────────────────────────

export const inquirySchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  phone: z
    .string()
    .min(7, "Enter a valid phone number")
    .max(20)
    .regex(/^[+\d\s\-()]+$/, "Invalid phone number format"),
  email: z.string().email("Enter a valid email address"),
  message: z.string().max(1000).optional().or(z.literal("")),
  property_id: z.string().uuid(),
});

export type InquiryFormValues = z.infer<typeof inquirySchema>;

// ── Login ────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ── Transactions ─────────────────────────────────────────────

export const transactionSchema = z.object({
  type: z.enum(["credit", "debit"]),
  title: z.string().min(3, "Title must be at least 3 characters"),
  source: z
    .string()
    .min(2, "Source/Individual must be at least 2 characters")
    .max(100),
  linked_credit_id: z.string().optional().nullable().or(z.literal("")),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  date: z.string().min(1, "Date is required"),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

// ── Reviews / Testimonials ───────────────────────────────────

export const reviewSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  role: z.string().min(2, "Role must be at least 2 characters").max(100),
  quote: z.string().min(10, "Quote must be at least 10 characters").max(2000),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;

export const workSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  location: z.string().min(1, 'Location is required'),
  status: z.string().min(1, 'Status is required'),
});

export type WorkFormValues = z.infer<typeof workSchema>;