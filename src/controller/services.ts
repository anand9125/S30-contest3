import type { Request, Response } from "express";
import { errorResponse, generateId, successResponse } from "../response.js";
import { createServiceSchema } from "../types.js";
import prisma from "../lib/index.js";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const createService = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (req.user?.role !== "freelancer") {
      return res.status(403).json(errorResponse("FORBIDDEN"));
    }

    const validatedData = createServiceSchema.parse(req.body);

    const serviceId = generateId("srv");

    const service = await prisma.service.create({
      data: {
        id: serviceId,
        freelancerId: req.user.userId,
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        pricingType: validatedData.pricingType,
        price: validatedData.price,
        deliveryDays: validatedData.deliveryDays,
        rating: 0.0,
        totalReviews: 0,
      },
      select: {
        id: true,
        freelancerId: true,
        title: true,
        description: true,
        category: true,
        pricingType: true,
        price: true,
        deliveryDays: true,
        rating: true,
        totalReviews: true,
      },
    });

    const responseData = {
      id: service.id,
      freelancerId: service.freelancerId,
      title: service.title,
      description: service.description,
      category: service.category,
      pricingType: service.pricingType,
      price: service.price,
      deliveryDays: service.deliveryDays,
      rating: service.rating,
      totalReviews: service.totalReviews,
    };

    return res.status(201).json(successResponse(responseData));
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json(errorResponse("INVALID_REQUEST"));
    }

    console.error("Create service error:", error);
    return res.status(400).json(errorResponse("INVALID_REQUEST"));
  }
};

