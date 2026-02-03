import { Router } from "express";
import { createService } from "../controller/services.js";
import authMiddleware from "../middleware/index.js";
import { createProject, getProjects } from "../controller/project.js";
import { createProposal, getProposals } from "../controller/proposal.js";

const router = Router();

router.post("/",authMiddleware,createProject);

router.get("/",authMiddleware,getProjects);

router.post("/:projectId/proposals",authMiddleware,createProposal);

router.get("/:projectId/proposals",authMiddleware,getProposals);

export const projectRoutes = router;