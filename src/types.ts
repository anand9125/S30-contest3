import z from "zod"
export const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['client', 'freelancer']).optional().default('client'),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional().default([]),
  hourlyRate: z.number().positive().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createServiceSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  pricingType: z.enum(['fixed', 'hourly']),
  price: z.number().positive(),
  deliveryDays: z.number().int().positive(),
});

export const createProjectSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  budgetMin: z.number().positive(),
  budgetMax: z.number().positive(),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  requiredSkills: z.array(z.string()).optional().default([]),
}).refine(data => data.budgetMax >= data.budgetMin, {
  message: "budgetMax must be greater than or equal to budgetMin",
});

export const createProposalSchema = z.object({
  coverLetter: z.string().min(1),
  proposedPrice: z.number().positive(),
  estimatedDuration: z.number().int().positive(),
});

export const acceptProposalSchema = z.object({
  milestones: z.array(z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    amount: z.number().positive(),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })).min(1),
});

export const createReviewSchema = z.object({
  contractId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});



export const JWT_SECRET= "your_jwt_secret_key_here";