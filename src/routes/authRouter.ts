import  type { Request,Response } from "express";
import { Router } from "express";
import prisma from "../lib/index.js";
import { errorResponse, generateId, successResponse } from "../response.js";
import { JWT_SECRET, loginSchema, signupSchema } from "../types.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


const router = Router();

router.post('/signup', async (req: Request, res: Response) => {

  try {
    const validatedData = signupSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: {
        email: validatedData.email,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      return res.status(400).json(errorResponse("EMAIL_ALREADY_EXISTS"));
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const userId = generateId("usr");

    const user = await prisma.user.create({
      data: {
        id: userId,
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
        bio: validatedData.bio ?? null,
        skills: validatedData.skills,
        hourlyRate: validatedData.hourlyRate ?? null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        skills: true,
        hourlyRate: true,
      },
    });

    const responseData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      skills: user.skills,
      hourlyRate: user.hourlyRate,
    };

    return res.status(201).json(successResponse(responseData));
  } catch (error:any) {
    if (error.name === "ZodError") {
      return res.status(400).json(errorResponse("INVALID_REQUEST"));
    }

    console.error("Signup error:", error);
    return res.status(400).json(errorResponse("INVALID_REQUEST"));
  }
}); 

router.post('/login', async (req: Request, res: Response) => {  
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: {
        email: validatedData.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json(errorResponse("INVALID_CREDENTIALS"));
    }
    const isValidPassword = await bcrypt.compare(
      validatedData.password,
      user.password
    );

    if (!isValidPassword) {
      return res.status(401).json(errorResponse("INVALID_CREDENTIALS"));
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const responseData = {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };

    return res.status(200).json(successResponse(responseData));
  } catch (error:any) {
    if (error.name === "ZodError") {
      return res.status(400).json(errorResponse("INVALID_REQUEST"));
    }

    console.error("Login error:", error);
    return res.status(400).json(errorResponse("INVALID_REQUEST"));
  }
});


export const authRoutes = router;









