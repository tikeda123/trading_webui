import { useState, useCallback } from 'react';
import { AccountData } from '../types/accountData';

export type TimePeriod = '7d' | '30d' | '90d' | '180d' | 'all';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function useAccountData() {
	const [accountData, setAccountData] = useState<AccountData[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchData = useCallback(async (period: TimePeriod) => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await fetch(`${API_URL}/api/v1/account_data/latest/period/${period}`);
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			const data = await response.json();
			setAccountData(data);
		} catch (error) {
			console.error('Error fetching data:', error);
			setError('Failed to fetch account data');
		} finally {
			setIsLoading(false);
		}
	}, []);

	return { accountData, isLoading, error, fetchData };
}
