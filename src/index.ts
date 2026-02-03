import express from "express"
import { authRoutes } from "./routes/authRouter.js";
import authMiddleware from "./middleware/index.js";
import { servicesRoutes } from "./routes/servicesRoutes.js";
import { projectRoutes } from "./routes/projectRoutes.js";
import { proposalsRoutes } from "./routes/proposalsRoutes.js";
import { contractRoutes } from "./routes/contractRoutes.js";
import { mileStoneRoutes } from "./routes/mileStoneRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use("/api/auth",authRoutes);

app.use("/api/services",servicesRoutes);

app.use("/api/projects",projectRoutes);

app.use("/api/proposals",proposalsRoutes);

app.use("/api/contract",contractRoutes)

app.use("/api/milestones",mileStoneRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
