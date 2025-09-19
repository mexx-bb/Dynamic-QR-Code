'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';

type ScanAnalyticsChartProps = {
  data: { date: string; scans: number }[];
};

export function ScanAnalyticsChart({ data }: ScanAnalyticsChartProps) {
  return (
    <ChartContainer config={{}} className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
            <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
            />
            <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
                allowDecimals={false}
            />
            <Tooltip
                cursor={false}
                content={<ChartTooltipContent 
                    labelClassName="font-bold"
                    indicator="dot"
                    formatter={(value, name) => [`${value} Scans`, name]}
                />}
            />
            <Bar dataKey="scans" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
