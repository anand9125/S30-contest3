import type { Request, Response } from "express";
import { errorResponse, successResponse } from "../response.js";
import prisma from "../lib/index.js";


interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}


export const getContracts = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { status, role } = req.query;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json(errorResponse("UNAUTHORIZED"));
    }

    const where: any = {
      OR: [
        { clientId: userId },
        { freelancerId: userId },
      ],
    };

    if (status) {
      where.status = String(status);
    }

    if (role === "client") {
      where.clientId = userId;
      delete where.OR;
    }

    if (role === "freelancer") {
      where.freelancerId = userId;
      delete where.OR;
    }

    const contracts = await prisma.contract.findMany({
      where,
      orderBy: {
        startedAt: "desc",
      },
      select: {
        id: true,
        projectId: true,
        totalAmount: true,
        status: true,
        startedAt: true,
        completedAt: true,
        project: {
          select: {
            title: true,
          },
        },
        freelancer: {
          select: {
            id: true,
            name: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        milestones: {
          where: {
            status: {
              not: "approved",
            },
          },
          orderBy: {
            orderIndex: "asc",
          },
          take: 1,
          select: {
            id: true,
            title: true,
            status: true,
            dueDate: true,
          },
        },
      },
    });

    const responseData = contracts.map(contract => ({
      id: contract.id,
      projectId: contract.projectId,
      projectTitle: contract.project.title,
      freelancerId: contract.freelancer.id,
      freelancerName: contract.freelancer.name,
      clientId: contract.client.id,
      clientName: contract.client.name,
      totalAmount: contract.totalAmount,
      status: contract.status,
      startedAt: contract.startedAt.toISOString(),
      completedAt: contract.completedAt
        ? contract.completedAt.toISOString()
        : null,
      currentMilestone: contract.milestones?.length
        ? {
            id: contract.milestones[0]?.id ,
             title: contract.milestones[0]?.title,
            status: contract.milestones[0]?.status,
            dueDate: contract.milestones[0]?.dueDate
              ?.toISOString()
              .split("T")[0],
          }
        : null,
    }));

    return res.status(200).json(successResponse(responseData));
  } catch (error) {
    console.error("Get contracts error:", error);
    return res.status(400).json(errorResponse("INVALID_REQUEST"));
  }
};

