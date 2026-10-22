// app/dashboard/page.jsx
import DashboardClient from "./DashboardClient";
import AuthGuard from "@/components/AuthGuard";

export const metadata = {
  title: "Xpencer | Financial Overview Dashboard",
  description: "Monitor your total spending, active category budgets, and recent financial transactions in one centralized dashboard.",
  keywords: ["Financial Dashboard", "Expense Overview", "Budget Tracker", "Xpencer"],
  openGraph: {
    title: "Xpencer | Dashboard",
    description: "Get a comprehensive snapshot of your financial health, budgets, and recent expenses.",
    type: "website",
  },
};

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardClient />
    </AuthGuard>
  );
}