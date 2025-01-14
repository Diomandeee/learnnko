import { Metadata } from "next";
import { ProfitCalculator } from "@/components/calculator/profit-calculator";
import { PageContainer } from "@/components/layout/page-container";

export const metadata: Metadata = {
  title: "Profit Calculator | BUF BARISTA CRM",
  description: "Optimize profit margins and analyze financial scenarios",
};

export default function CalculatorPage() {
  return (
    <PageContainer>
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profit Calculator</h1>
            <p className="text-muted-foreground">
              Analyze and optimize profit margins for your partnerships
            </p>
          </div>
        </div>
        <ProfitCalculator />
      </div>
    </PageContainer>
  );
}
