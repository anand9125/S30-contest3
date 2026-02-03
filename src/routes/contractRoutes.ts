import { Router } from "express";
import authMiddleware from "../middleware/index.js";
import { getContracts } from "../controller/contract.js";

const router = Router();

router.put("/:proposalId/accept",authMiddleware,getContracts);


export const contractRoutes = router;