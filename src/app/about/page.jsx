// app/about/page.jsx
import AboutClient from "./AboutClient";

export const metadata = {
  title: "About Xpencer | Smart Expense & Budget Management Suite",
  description: "Discover Xpencer, an intelligent expense tracking software featuring budget planning, category sorting, and effortless group bill splitting.",
  keywords: ["Expense Management", "Budget Planner", "Bill Splitter", "Finance Tracker", "Smart Ledger"],
  openGraph: {
    title: "About Xpencer | Master Your Money",
    description: "Track budgets, categorize spending automatically, and split bills effortlessly in one secure dashboard.",
    type: "website",
  },
};

export default function AboutPage() {
  return <AboutClient />;
}