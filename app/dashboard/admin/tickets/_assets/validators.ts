import { z } from 'zod';

const TicketCategorySchemaOptional = {
  limit: z.optional(z.coerce.number().min(1).max(254)),
  autoClose: z.optional(z.coerce.number().min(5).max(1440)),
  parentChannelId: z.optional(z.string()),
  bannedRoleId: z.optional(z.string()),
  afterCreateDescription: z.optional(z.string()),
  createConfirmation: z.optional(z.string().max(960)),
  closeCommand: z.optional(z.string().max(16)),
  image: z.optional(z.string().max(2048)),
  mentionSupport: z.optional(z.boolean()),
  supportRoles: z.optional(
    z.array(
      z.object({
        roleId: z.string().min(1),
        roleName: z.string().min(1),
      }),
    ),
  ),
};

export const TicketCategoryCreateSchema = z.object({
  name: z.string().min(1).max(32),
  description: z.string().max(960),
  steamRequired: z.boolean(),
  mapSelection: z.boolean(),
  coordinateInput: z.boolean(),
  ...TicketCategorySchemaOptional,
});
export type TTicketCategoryCreateSchema = z.infer<typeof TicketCategoryCreateSchema>;

export const TicketCategoryEditSchema = z.object({
  name: z.optional(z.string().min(1).max(32)),
  description: z.optional(z.string().max(960)),
  steamRequired: z.optional(z.boolean()),
  mapSelection: z.optional(z.boolean()),
  coordinateInput: z.optional(z.boolean()),
  ...TicketCategorySchemaOptional,
});
export type TTicketCategoryEditSchema = z.infer<typeof TicketCategoryEditSchema>;
