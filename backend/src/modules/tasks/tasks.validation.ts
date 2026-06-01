import { z } from 'zod';

export const createTaskSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Title is required' })
      .min(1, 'Title cannot be empty')
      .max(100, 'Title cannot exceed 100 characters'),
    description: z
      .string()
      .max(500, 'Description cannot exceed 500 characters')
      .optional()
      .nullable(),
    status: z
      .enum(['TODO', 'IN_PROGRESS', 'DONE'], {
        invalid_type_error: 'Status must be TODO, IN_PROGRESS, or DONE',
      })
      .optional(),
    priority: z
      .enum(['LOW', 'MEDIUM', 'HIGH'], {
        invalid_type_error: 'Priority must be LOW, MEDIUM, or HIGH',
      })
      .optional(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, 'Title cannot be empty')
      .max(100, 'Title cannot exceed 100 characters')
      .optional(),
    description: z
      .string()
      .max(500, 'Description cannot exceed 500 characters')
      .optional()
      .nullable(),
    status: z
      .enum(['TODO', 'IN_PROGRESS', 'DONE'], {
        invalid_type_error: 'Status must be TODO, IN_PROGRESS, or DONE',
      })
      .optional(),
    priority: z
      .enum(['LOW', 'MEDIUM', 'HIGH'], {
        invalid_type_error: 'Priority must be LOW, MEDIUM, or HIGH',
      })
      .optional(),
  }),
});
