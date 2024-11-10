"use client"

import { useState, useEffect } from 'react'
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAccountData, TimePeriod } from '../hooks/useAccountData'
import { AccountBalanceChart } from './AccountBalanceChart'
import { StatisticsCards } from './StatisticsCards'
import { AccountData } from '../types/accountData'
import DashboardLayout from './DashboardLayout'

export default function TradingSystemDashboard() {
	const { accountData, isLoading, error, fetchData } = useAccountData();
	const [hoveredData, setHoveredData] = useState<AccountData | null>(null);
	const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('all');

	useEffect(() => {
		fetchData(selectedPeriod);
	}, [selectedPeriod, fetchData]);

	const getBalanceInfo = (balance: number) => {
		const initialBalance = accountData.length > 0 ? accountData[0].total_assets : 0;
		const profitLoss = balance - initialBalance;
		const profitLossPercentage = ((profitLoss / initialBalance) * 100).toFixed(2);
		return { balance, profitLoss, profitLossPercentage };
	}

	const latestBalance = accountData.length > 0 ? accountData[accountData.length - 1].total_assets : 0;
	const { balance, profitLoss, profitLossPercentage } = hoveredData
		? getBalanceInfo(hoveredData.total_assets)
		: getBalanceInfo(latestBalance);

	return (
		<DashboardLayout>
			<CardHeader className="pb-2">
				<CardTitle className="text-3xl">Trading System Balance</CardTitle>
				<div className="flex space-x-2">
					{(['7d', '30d', '90d', '180d', 'all'] as TimePeriod[]).map((period) => (
						<Button
							key={period}
							variant={selectedPeriod === period ? "default" : "outline"}
							onClick={() => setSelectedPeriod(period)}
						>
							{period}
						</Button>
					))}
				</div>
			</CardHeader>
			<CardContent className="h-[calc(100%-5rem)]">
				<StatisticsCards
					balance={balance}
					profitLoss={profitLoss}
					profitLossPercentage={profitLossPercentage}
				/>
				<div className="h-[calc(100%-10rem)]">
					{isLoading && <p>Loading...</p>}
					{error && <p>Error: {error}</p>}
					{!isLoading && !error && accountData.length > 0 && (
						<AccountBalanceChart
							data={accountData}
							onHover={setHoveredData}
						/>
					)}
				</div>
			</CardContent>
		</DashboardLayout>
	);
}
