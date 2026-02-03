import { Router } from "express";
import authMiddleware from "../middleware/index.js";
import { acceptProposal } from "../controller/proposal.js";

const router = Router();

router.put("/:proposalId/accept",authMiddleware,acceptProposal);


export const proposalsRoutes = router;