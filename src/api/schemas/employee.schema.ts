import { z } from 'zod';

export const EmployeeSchema = z.object({
  empNumber: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  employeeId: z.string().nullable(),
});

export const EmployeeListSchema = z.object({
  data: z.array(EmployeeSchema),
  meta: z.object({ total: z.number() }),
});

export const EmployeeCreateSchema = z.object({
  data: EmployeeSchema,
});

export type Employee = z.infer<typeof EmployeeSchema>;
