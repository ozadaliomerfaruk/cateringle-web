// src/lib/validations/message.ts
import { z } from "zod";

/**
 * Send message schema
 */
export const sendMessageSchema = z.object({
  vendorLeadId: z.string().uuid("Geçersiz görüşme ID"),
  content: z
    .string()
    .min(1, "Mesaj boş olamaz")
    .max(2000, "Mesaj çok uzun (max 2000 karakter)")
    .transform((val) => val.trim()),
});

/**
 * Get messages query params schema
 */
export const getMessagesSchema = z.object({
  vendorLeadId: z.string().uuid("Geçersiz görüşme ID"),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0),
});

/**
 * Mark messages read schema
 */
export const markReadSchema = z.object({
  vendorLeadId: z.string().uuid("Geçersiz görüşme ID"),
});

/**
 * Get conversations query params schema
 */
export const getConversationsSchema = z.object({
  limit: z.coerce.number().min(1).max(50).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
});

// Type exports
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type GetMessagesInput = z.infer<typeof getMessagesSchema>;
export type MarkReadInput = z.infer<typeof markReadSchema>;
export type GetConversationsInput = z.infer<typeof getConversationsSchema>;
