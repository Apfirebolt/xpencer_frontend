import ExpenseClient from "./ExpenseClient";

export const metadata = {
  title: "Xpencer | Expense Ledger & Transaction Tracker",
  description: "Log, categorize, and monitor your day-to-day financial expenses securely in real-time.",
  keywords: ["Expense Tracker", "Transactions", "Smart Ledger", "Spending Monitor", "Xpencer"],
  openGraph: {
    title: "Xpencer | Expense Ledger",
    description: "Keep track of all your personal and shared expenses with instant categorization and totals.",
    type: "website",
  },
};

export default function ExpensesPage() {
  return <ExpenseClient />;
}