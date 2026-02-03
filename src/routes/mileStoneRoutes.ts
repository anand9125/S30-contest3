import { Router } from "express";
import authMiddleware from "../middleware/index.js";
import { getContracts } from "../controller/contract.js";
import { approveMilestone, submitMilestone } from "../controller/mileStone.js";

const router = Router();

router.put("/:milestoneId/submit ",authMiddleware,submitMilestone);

router.put("/:milestoneId/approve",authMiddleware,approveMilestone)


export const mileStoneRoutes = router;