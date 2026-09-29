import express from "express";
import {
  AddFinance,
  getAllFinance,
  getFinanceById,
  getFinanceSummary,
  generateMonthlyFinance,
  getYearlyFinanceBreakdown,
} from "../controllers/financeController.js";
import { protectedRoute, superAdminRoute } from "../middlewares/authorization.js";

const router = express.Router();

router.post("/create", protectedRoute, superAdminRoute, AddFinance);
router.post("/generate-monthly", protectedRoute, superAdminRoute, generateMonthlyFinance);
router.get("/getAll", protectedRoute, superAdminRoute, getAllFinance);
router.get("/get/:financeId", protectedRoute, superAdminRoute, getFinanceById);
router.get("/summary", protectedRoute, superAdminRoute, getFinanceSummary);
router.get("/yearly-breakdown", protectedRoute, superAdminRoute, getYearlyFinanceBreakdown);

export default router;
