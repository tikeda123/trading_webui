import AccountPerformanceChart from '@/components/AccountPerformanceChart';

export default function Dashboard() {
  return (
    <div className="container mx-auto px-6 py-8">
      <h3 className="text-foreground text-3xl font-medium">Dashboard</h3>
      <div className="mt-8">
        <AccountPerformanceChart />
      </div>
      {/* その他のダッシュボード要素 */}
    </div>
  );
}