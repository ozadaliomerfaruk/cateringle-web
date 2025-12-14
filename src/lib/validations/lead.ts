import { z } from "zod";

export const createLeadSchema = z.object({
  // Zorunlu alanlar
  vendorId: z.string().uuid("Geçersiz vendor ID"),
  customerName: z
    .string()
    .min(2, "İsim en az 2 karakter olmalı")
    .max(100, "İsim en fazla 100 karakter olabilir")
    .trim(),
  customerEmail: z
    .string()
    .email("Geçerli bir e-posta adresi girin")
    .max(255)
    .toLowerCase()
    .trim(),

  // Opsiyonel alanlar
  customerPhone: z
    .string()
    .regex(/^[0-9+\-\s()]{10,20}$/, "Geçerli bir telefon numarası girin")
    .optional()
    .nullable(),
  segmentId: z.coerce.number().int().positive().optional().nullable(),
  eventType: z.string().max(50).optional().nullable(),
  eventDate: z.string().date("Geçerli bir tarih girin").optional().nullable(),
  guestCount: z.coerce
    .number()
    .int()
    .min(1, "Kişi sayısı en az 1 olmalı")
    .max(10000, "Kişi sayısı en fazla 10000 olabilir")
    .optional()
    .nullable(),
  budgetMin: z.coerce.number().min(0).optional().nullable(),
  budgetMax: z.coerce.number().min(0).optional().nullable(),
  serviceStyle: z
    .enum(["buffet", "seated", "cocktail", "boxed", "drop_off"])
    .optional()
    .nullable(),
  needsServiceStaff: z.boolean().optional().default(false),
  needsCleanup: z.boolean().optional().default(false),
  needsTablesChairs: z.boolean().optional().default(false),
  wantsRealTableware: z.boolean().optional().default(false),
  wantsDisposableTableware: z.boolean().optional().default(false),
  cuisinePreference: z.string().max(500).optional().nullable(),
  deliveryModel: z.string().max(50).optional().nullable(),
  dietaryRequirements: z.array(z.string()).optional().nullable(),
  notes: z
    .string()
    .max(2000, "Notlar en fazla 2000 karakter olabilir")
    .optional()
    .nullable(),

  // Idempotency key - çift submit koruması
  idempotencyKey: z.string().uuid("Geçersiz idempotency key").optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;

// Sanitize HTML/script injection
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}
