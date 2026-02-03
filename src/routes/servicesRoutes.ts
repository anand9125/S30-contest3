import { Router } from "express";
import { createService } from "../controller/services.js";
import authMiddleware from "../middleware/index.js";

const router = Router();

router.post("/",authMiddleware,createService);


export const servicesRoutes = router;