import { z } from 'zod';

const optionalOrMin = z
  .union([z.string().length(0), z.string().min(2).max(2048)])
  .optional()
  .transform((e) => (e === '' ? undefined : e));

const TicketCategorySchemaOptional = {
  afterCreateDescription: optionalOrMin,
  createConfirmation: optionalOrMin,
  bannedRoleId: optionalOrMin,
  image: optionalOrMin,
  limit: z.optional(z.coerce.number().min(1).max(254)),
  autoClose: z.optional(z.coerce.number().min(5).max(1440)),
  parentChannelId: optionalOrMin,
  closeCommand: optionalOrMin,
  mentionSupport: z.optional(z.boolean()),
  format: optionalOrMin,
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

export const UpdateDelaySchema = z.object({
  serverStatusUpdateDelay: z.optional(z.number().min(3)),
  serverControlUpdateDelay: z.optional(z.number().min(3)),
  countdownUpdateDelay: z.optional(z.number().min(3)),
  autoCleanTicketFilesDays: z.optional(z.number().min(1)),
});
export type TUpdateDelaySchema = z.infer<typeof UpdateDelaySchema>;

export const StaffMemberSchema = z.object({
  username: z.string().min(1),
  avatarUrl: z.string().min(1),
  role: z.string().min(1),
  joinedAt: z.date(),
});

export type TStaffMemberSchema = z.infer<typeof StaffMemberSchema>;
