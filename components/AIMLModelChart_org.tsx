'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from './DashboardLayout'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface DataPoint {
  start_at: string
  hit_rate_rolling_v1: number
  hit_rate_rolling_v2: number
  hit_rate_rolling_v3: number
  hit_rate_rolling_v4: number
  hit_rate_rolling_v5: number
  hit_rate_rolling_v6: number
  hit_rate_rolling_v7: number
  hit_rate_rolling_v8: number
  hit_rate_rolling_v9: number
  hit_rate_rolling_v10: number
  hit_rate_rolling_v11: number
  hit_rate_rolling_v12: number
  avg_profit_rolling_v1: number
  avg_profit_rolling_v2: number
  avg_profit_rolling_v3: number
  avg_profit_rolling_v4: number
  avg_profit_rolling_v5: number
  avg_profit_rolling_v6: number
  avg_profit_rolling_v7: number
  avg_profit_rolling_v8: number
  avg_profit_rolling_v9: number
  avg_profit_rolling_v10: number
  avg_profit_rolling_v11: number
  avg_profit_rolling_v12: number
  profit: number
}

const timePeriods = ['7d', '30d', '90d', '180d', 'all']
const colors = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE',
  '#00C49F', '#FFBB28', '#FF8042', '#a4de6c', '#d0ed57',
  '#ffc658', '#ff7300'
]

export default function AimlModelChart() {
  const [data, setData] = useState<DataPoint[]>([])
  const [period, setPeriod] = useState('all')
  const [showProfit, setShowProfit] = useState(false)

  useEffect(() => {
    fetchData(period)
  }, [period])

  const fetchData = async (timePeriod: string) => {
    try {
      console.log('Fetching data for period:', timePeriod);
      const response = await fetch(`http://localhost:8000/api/v1/aiml_tracing/latest/period/${timePeriod}?symbol=BTCUSDT&interval=60`)
      const jsonData = await response.json()
      console.log('Fetched data:', jsonData) // データをログ出力

      if (Array.isArray(jsonData) && jsonData.length > 0) {
        setData(jsonData);
        console.log('First data point after setting:', jsonData[0]);
      } else {
        console.error('Received data is not an array or is empty:', jsonData);
      }

      setData(jsonData)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const getDataKey = (index: number) =>
    showProfit ? `avg_profit_rolling_v${index + 1}` : `hit_rate_rolling_v${index + 1}`

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // ペイロードを値の降順にソート
      const sortedPayload = [...payload].sort((a, b) => b.value - a.value);

      return (
        <div className="bg-background/80 backdrop-blur-sm border border-border p-4 rounded-lg shadow-lg">
          <p className="font-bold text-foreground">{`Date: ${new Date(label).toLocaleDateString()}`}</p>
          {sortedPayload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toFixed(4)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  }

  return (
    <DashboardLayout>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">AIML Model Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {timePeriods.map((tp) => (
                <Button
                  key={tp}
                  onClick={() => setPeriod(tp)}
                  variant={period === tp ? 'default' : 'outline'}
                  size="sm"
                >
                  {tp}
                </Button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-profit"
                checked={showProfit}
                onCheckedChange={setShowProfit}
              />
              <Label htmlFor="show-profit">
                {showProfit ? 'Show Avg Profit' : 'Show Hit Rate'}
              </Label>
            </div>
          </div>
          <div className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis
                  dataKey="start_at"
                  stroke="#888"
                  tick={{ fill: '#888' }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis stroke="#888" tick={{ fill: '#888' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {[...Array(12)].map((_, index) => (
                  <Line
                    key={getDataKey(index)}
                    type="monotone"
                    dataKey={getDataKey(index)}
                    stroke={colors[index]}
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}