import type { Request, Response } from "express";
import { errorResponse, generateId, successResponse } from "../response.js";
import { createProjectSchema } from "../types.js";
import prisma from "../lib/index.js";


interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}


export const createProject = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (req.user?.role !== "client") {
      return res.status(403).json(errorResponse("FORBIDDEN"));
    }

    const validatedData = createProjectSchema.parse(req.body);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(validatedData.deadline);

    if (deadline <= today) {
      return res.status(400).json(errorResponse("INVALID_REQUEST"));
    }

    const projectId = generateId("proj");

    const project = await prisma.project.create({
      data: {
        id: projectId,
        clientId: req.user.userId,
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        budgetMin: validatedData.budgetMin,
        budgetMax: validatedData.budgetMax,
        deadline,
        status: "open",
        requiredSkills: validatedData.requiredSkills,
      },
      select: {
        id: true,
        clientId: true,
        title: true,
        description: true,
        category: true,
        budgetMin: true,
        budgetMax: true,
        deadline: true,
        status: true,
        requiredSkills: true,
        createdAt: true,
      },
    });

    const responseData = {
      id: project.id,
      clientId: project.clientId,
      title: project.title,
      description: project.description,
      category: project.category,
      budgetMin: project.budgetMin,
      budgetMax: project.budgetMax,
      deadline: project.deadline.toISOString().split("T")[0],
      status: project.status,
      requiredSkills: project.requiredSkills,
      createdAt: project.createdAt.toISOString(),
    };

    return res.status(201).json(successResponse(responseData));
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json(errorResponse("INVALID_REQUEST"));
    }

    console.error("Create project error:", error);
    return res.status(400).json(errorResponse("INVALID_REQUEST"));
  }
};

export const getProjects = async (req: Request, res: Response) => {
  try {
    const { category, minBudget, maxBudget, status, skills } = req.query;

    const where: any = {
      status: status ?? "open",
    };

    if (category) {
      where.category = {
        equals: String(category),
        mode: "insensitive",
      };
    }

    if (minBudget) {
      where.budgetMax = { gte: Number(minBudget) };
    }

    if (maxBudget) {
      where.budgetMin = { lte: Number(maxBudget) };
    }

    if (skills) {
      const skillsArray = String(skills)
        .split(",")
        .map(s => s.trim());

      where.OR = skillsArray.map(skill => ({
        requiredSkills: {
          array_contains: skill,
        },
      }));
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        clientId: true,
        title: true,
        description: true,
        category: true,
        budgetMin: true,
        budgetMax: true,
        deadline: true,
        status: true,
        requiredSkills: true,
        createdAt: true,
        client: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            proposals: true,
          },
        },
      },
    });

    const responseData = projects.map(project => ({
      id: project.id,
      clientId: project.clientId,
      clientName: project.client.name,
      title: project.title,
      description: project.description,
      category: project.category,
      budgetMin: project.budgetMin,
      budgetMax: project.budgetMax,
      deadline: project.deadline.toISOString().split("T")[0],
      status: project.status,
      requiredSkills: project.requiredSkills,
      createdAt: project.createdAt.toISOString(),
      proposalCount: project._count.proposals,
    }));

    return res.status(200).json(successResponse(responseData));
  } catch (error) {
    console.error("Get projects error:", error);
    return res.status(400).json(errorResponse("INVALID_REQUEST"));
  }
};


