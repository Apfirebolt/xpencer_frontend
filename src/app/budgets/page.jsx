// app/budgets/page.jsx
import BudgetClient from "./BudgetClient";
import AuthGuard from "@/components/AuthGuard";

export const metadata = {
  title: "Xpencer | Monthly Category Budgets & Spending Limits",
  description: "Set category-based monthly spending limits, monitor actual expenses in real-time, and keep your finances balanced.",
  keywords: ["Budget Planner", "Category Budgets", "Spending Limits", "Finance Tracker", "Xpencer"],
  openGraph: {
    title: "Xpencer | Budget Planner",
    description: "Manage monthly spending limits across categories with automated progress tracking.",
    type: "website",
  },
};

export default function BudgetsPage() {
  return (
    <AuthGuard>
      <BudgetClient />
    </AuthGuard>
  );
}