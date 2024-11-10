"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatisticsCardsProps {
  balance: number;
  profitLoss: number;
  profitLossPercentage: string;
}

export function StatisticsCards({ balance, profitLoss, profitLossPercentage }: StatisticsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-lg">Current Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            ${balance.toFixed(2)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-lg">Profit/Loss</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-3xl font-bold ${profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ${profitLoss.toFixed(2)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-lg">P/L Percentage</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-3xl font-bold ${profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {profitLossPercentage}%
          </p>
        </CardContent>
      </Card>
    </div>
  );
}