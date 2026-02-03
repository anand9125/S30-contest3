import type { Request, Response } from "express";
import { errorResponse, generateId, successResponse } from "../response.js";
import { acceptProposalSchema, createProposalSchema } from "../types.js";
import prisma from "../lib/index.js";
import type { Prisma } from "../generated/prisma/client.js";


interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const createProposal = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (req.user?.role !== "freelancer") {
      return res.status(403).json(errorResponse("FORBIDDEN"));
    }

    const validatedData = createProposalSchema.parse(req.body);
    const { projectId } = req.params as { projectId: string };

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, status: true },
    });

    if (!project) {
      return res.status(404).json(errorResponse("PROJECT_NOT_FOUND"));
    }

    if (project.status !== "open") {
      return res.status(400).json(errorResponse("PROJECT_NOT_OPEN"));
    }

    const existingProposal = await prisma.proposal.findUnique({
      where: {
        projectId_freelancerId: {
          projectId,
          freelancerId: req.user.userId,
        },
      },
    });

    if (existingProposal) {
      return res
        .status(400)
        .json(errorResponse("PROPOSAL_ALREADY_EXISTS"));
    }

    const proposalId = generateId("prop");

    const proposal = await prisma.proposal.create({
      data: {
        id: proposalId,
        projectId,
        freelancerId: req.user.userId,
        coverLetter: validatedData.coverLetter,
        proposedPrice: validatedData.proposedPrice,
        estimatedDuration: validatedData.estimatedDuration,
        status: "pending",
      },
    });

    return res.status(201).json(
      successResponse({
        id: proposal.id,
        projectId: proposal.projectId,
        freelancerId: proposal.freelancerId,
        coverLetter: proposal.coverLetter,
        proposedPrice: proposal.proposedPrice,
        estimatedDuration: proposal.estimatedDuration,
        status: proposal.status,
        submittedAt: proposal.submittedAt.toISOString(),
      })
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json(errorResponse("INVALID_REQUEST"));
    }
    console.error("Create proposal error:", error);
    return res.status(400).json(errorResponse("INVALID_REQUEST"));
  }
};

export const getProposals = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { projectId } = req.params as { projectId: string };

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { clientId: true },
    });

    if (!project) {
      return res.status(404).json(errorResponse("PROJECT_NOT_FOUND"));
    }

    if (project.clientId !== req.user?.userId) {
      return res.status(403).json(errorResponse("FORBIDDEN"));
    }

    const proposals = await prisma.proposal.findMany({
      where: { projectId },
      orderBy: { submittedAt: "desc" },
      select: {
        id: true,
        freelancerId: true,
        coverLetter: true,
        proposedPrice: true,
        estimatedDuration: true,
        status: true,
        submittedAt: true,
        freelancer: {
          select: {
            name: true,
            skills: true,
          },
        },
      },
    });

    return res.status(200).json(
      successResponse(
        proposals.map(p => ({
          id: p.id,
          freelancerId: p.freelancerId,
          freelancerName: p.freelancer.name,
          freelancerSkills: p.freelancer.skills,
          coverLetter: p.coverLetter,
          proposedPrice: p.proposedPrice,
          estimatedDuration: p.estimatedDuration,
          status: p.status,
          submittedAt: p.submittedAt.toISOString(),
        }))
      )
    );
  } catch (error) {
    console.error("Get proposals error:", error);
    return res.status(400).json(errorResponse("INVALID_REQUEST"));
  }
};

export const acceptProposal = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const validatedData = acceptProposalSchema.parse(req.body);
    const { proposalId } = req.params as { proposalId: string };

    const result = await prisma.$transaction(async tx => {
      const proposal = await tx.proposal.findUnique({
        where: { id: proposalId },
        include: {
          project: true,
        },
      });

      if (!proposal) {
        throw new Error("PROPOSAL_NOT_FOUND");
      }

      if (proposal.project.clientId !== req.user?.userId) {
        throw new Error("FORBIDDEN");
      }

      if (proposal.status !== "pending") {
        throw new Error("PROPOSAL_ALREADY_PROCESSED");
      }

      const totalMilestoneAmount = validatedData.milestones.reduce(
        (sum, m) => sum + m.amount,
        0
      );

    const proposalPriceDecimal: Prisma.Decimal = proposal.proposedPrice;
    const proposalPrice: number = proposalPriceDecimal.toNumber();

      if (Math.abs(totalMilestoneAmount - proposalPrice) > 0.01) {
        throw new Error("INVALID_MILESTONE_AMOUNTS");
      }

      await tx.proposal.update({
        where: { id: proposalId },
        data: { status: "accepted" },
      });

      await tx.proposal.updateMany({
        where: {
          projectId: proposal.projectId,
          id: { not: proposalId },
        },
        data: { status: "rejected" },
      });

      await tx.project.update({
        where: { id: proposal.projectId },
        data: { status: "in_progress" },
      });

      const contractId = generateId("contract");

      const contract = await tx.contract.create({
        data: {
          id: contractId,
          projectId: proposal.projectId,
          freelancerId: proposal.freelancerId,
          clientId: proposal.project.clientId,
          totalAmount: proposal.proposedPrice,
          status: "active",
        },
      });

      const milestones = await Promise.all(
        validatedData.milestones.map((m, idx) =>
          tx.milestone.create({
            data: {
              id: generateId("mile"),
              contractId,
              title: m.title,
              description: m.description ?? null,
              amount: m.amount,
              dueDate: m.dueDate,
              orderIndex: idx + 1,
              status: "pending",
            },
          })
        )
      );

      return { proposal, contract, milestones };
    });

    return res.status(200).json(
      successResponse({
        proposal: {
          id: result.proposal.id,
          status: "accepted",
        },
        contract: {
          id: result.contract.id,
          projectId: result.contract.projectId,
          freelancerId: result.contract.freelancerId,
          clientId: result.contract.clientId,
          totalAmount: result.contract.totalAmount,
          status: result.contract.status,
          startedAt: result.contract.startedAt.toISOString(),
        },
        milestones: result.milestones.map(m => ({
          id: m.id,
          contractId: m.contractId,
          title: m.title,
          description: m.description,
          amount: m.amount,
          dueDate: m.dueDate.toISOString().split("T")[0],
          orderIndex: m.orderIndex,
          status: m.status,
        })),
      })
    );
  } catch (error: any) {
    if (
      [
        "PROPOSAL_NOT_FOUND",
        "FORBIDDEN",
        "PROPOSAL_ALREADY_PROCESSED",
        "INVALID_MILESTONE_AMOUNTS",
      ].includes(error.message)
    ) {
      return res.status(400).json(errorResponse(error.message));
    }

    if (error.name === "ZodError") {
      return res.status(400).json(errorResponse("INVALID_REQUEST"));
    }

    console.error("Accept proposal error:", error);
    return res.status(400).json(errorResponse("INVALID_REQUEST"));
  }
};
