"use client"

// Import necessary components from recharts library for creating the line chart
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { AccountData } from '../types/accountData';

// Custom tooltip component for displaying detailed information on hover
const CustomTooltip = ({ active, payload, label }: any) => {
        // Only render the tooltip if it's active and has data
        if (active && payload && payload.length) {
                return (
                        <div className="custom-tooltip">
                                {/* Display formatted date */}
                                <p>{`Date: ${format(new Date(label), 'yyyy/MM/dd')}`}</p>
                                {/* Display total assets with 2 decimal places */}
                                <p>{`Total Assets: ${payload[0].value.toFixed(2)}`}</p>
                        </div>
                );
        }
        return null;
};

// Define props interface for AccountBalanceChart component
interface AccountBalanceChartProps {
        data: AccountData[];
        onHover: (data: AccountData | null) => void;
}

// Main AccountBalanceChart component
export function AccountBalanceChart({ data, onHover }: AccountBalanceChartProps) {
        const formattedData = data.map(item => ({
                ...item,
                date: new Date(item.date),
                total_assets: Number(item.total_assets.toFixed(2))
        }));

        return (
                // Responsive container to make the chart responsive
                <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                                data={formattedData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                // Handle mouse move event to update hovered data
                                onMouseMove={(e) => {
                                        if (e.activePayload) {
                                                onHover(e.activePayload[0].payload);
                                        }
                                }}
                                // Reset hovered data when mouse leaves the chart
                                onMouseLeave={() => onHover(null)}
                        >
                                {/* Add grid lines to the chart */}
                                <CartesianGrid strokeDasharray="3 3" />
                                {/* Configure X-axis */}
                                <XAxis
                                        dataKey="date"
                                        tickFormatter={(tick) => format(new Date(tick), 'MM/dd')}
                                        tick={{ fontSize: 14 }}
                                />
                                {/* Configure Y-axis */}
                                <Tooltip content={<CustomTooltip />} />
                                {/* Configure the line for total assets */}
                                <Line
                                        type="monotone"
                                        dataKey="total_assets"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={3}
                                        dot={false}
                                />
                        </LineChart>
                </ResponsiveContainer>
        );
}