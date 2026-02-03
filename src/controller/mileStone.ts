import type { Request, Response } from "express";
import { errorResponse, successResponse } from "../response.js";
import prisma from "../lib/index.js";


interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const submitMilestone = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (req.user?.role !== "freelancer") {
      return res.status(403).json(errorResponse("FORBIDDEN"));
    }

    const { milestoneId } = req.params as { milestoneId: string };

    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        contract: {
          select: {
            freelancerId: true,
          },
        },
      },
    });

    if (!milestone) {
      return res.status(404).json(errorResponse("MILESTONE_NOT_FOUND"));
    }

    if (milestone.contract.freelancerId !== req.user.userId) {
      return res.status(403).json(errorResponse("FORBIDDEN"));
    }

    if (["submitted", "approved"].includes(milestone.status)) {
      return res
        .status(400)
        .json(errorResponse("MILESTONE_ALREADY_SUBMITTED"));
    }

    if (milestone.orderIndex > 1) {
      const previousMilestones = await prisma.milestone.findMany({
        where: {
          contractId: milestone.contractId,
          orderIndex: { lt: milestone.orderIndex },
        },
        select: { status: true },
      });

      const allApproved = previousMilestones.every(
        m => m.status === "approved"
      );

      if (!allApproved) {
        return res
          .status(400)
          .json(errorResponse("PREVIOUS_MILESTONE_INCOMPLETE"));
      }
    }

    const updatedMilestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        status: "submitted",
        submittedAt: new Date(),
      },
    });

    return res.status(200).json(
      successResponse({
        id: updatedMilestone.id,
        contractId: updatedMilestone.contractId,
        title: updatedMilestone.title,
        description: updatedMilestone.description,
        amount: updatedMilestone.amount,
        dueDate: updatedMilestone.dueDate.toISOString().split("T")[0],
        orderIndex: updatedMilestone.orderIndex,
        status: updatedMilestone.status,
        submittedAt: updatedMilestone.submittedAt?.toISOString(),
      })
    );
  } catch (error) {
    console.error("Submit milestone error:", error);
    return res.status(400).json(errorResponse("INVALID_REQUEST"));
  }
};

export const approveMilestone = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { milestoneId } = req.params as { milestoneId: string };

    const result = await prisma.$transaction(async tx => {
      const milestone = await tx.milestone.findUnique({
        where: { id: milestoneId },
        include: {
          contract: {
            select: {
              clientId: true,
              projectId: true,
            },
          },
        },
      });

      if (!milestone) {
        throw new Error("MILESTONE_NOT_FOUND");
      }

      if (milestone.contract.clientId !== req.user?.userId) {
        throw new Error("FORBIDDEN");
      }

      if (milestone.status !== "submitted") {
        throw new Error("MILESTONE_NOT_SUBMITTED");
      }

      const updatedMilestone = await tx.milestone.update({
        where: { id: milestoneId },
        data: {
          status: "approved",
          approvedAt: new Date(),
        },
      });

      const totalMilestones = await tx.milestone.count({
        where: { contractId: milestone.contractId },
      });

      const approvedMilestones = await tx.milestone.count({
        where: {
          contractId: milestone.contractId,
          status: "approved",
        },
      });

      if (totalMilestones === approvedMilestones) {
        await tx.contract.update({
          where: { id: milestone.contractId },
          data: {
            status: "completed",
            completedAt: new Date(),
          },
        });

        await tx.project.update({
          where: { id: milestone.contract.projectId },
          data: { status: "completed" },
        });
      }

      return updatedMilestone;
    });

    return res.status(200).json(
      successResponse({
        id: result.id,
        contractId: result.contractId,
        title: result.title,
        status: result.status,
        approvedAt: result.approvedAt?.toISOString(),
      })
    );
  } catch (error: any) {
    if (
      ["MILESTONE_NOT_FOUND", "FORBIDDEN", "MILESTONE_NOT_SUBMITTED"].includes(
        error.message
      )
    ) {
      return res.status(400).json(errorResponse(error.message));
    }

    console.error("Approve milestone error:", error);
    return res.status(400).json(errorResponse("INVALID_REQUEST"));
  }
};

