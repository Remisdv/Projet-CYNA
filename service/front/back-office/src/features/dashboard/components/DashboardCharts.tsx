import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatEur } from '../lib/dashboardLabels';

interface SeriesPoint { date: string; revenue?: number; orders?: number }

const tooltipStyle = {
  backgroundColor: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
};

export function RevenueChart({ data }: { data: SeriesPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendance des revenus</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getDate()}/${date.getMonth() + 1}`;
              }}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => formatEur(value)}
            />
            <Tooltip
              formatter={(value: number) => [formatEur(value), 'Revenus']}
              labelFormatter={(label) => new Date(label).toLocaleDateString('fr-FR')}
              contentStyle={tooltipStyle}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ fill: '#2563eb', r: 3 }}
              activeDot={{ r: 6, fill: '#2563eb' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function OrdersChart({ data }: { data: SeriesPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribution des Commandes</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getDate()}/${date.getMonth() + 1}`;
              }}
            />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip
              formatter={(value: number) => [value, 'Commandes']}
              labelFormatter={(label) => new Date(label).toLocaleDateString('fr-FR')}
              contentStyle={tooltipStyle}
            />
            <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface TopItem { name: string; sales: number }

interface TopChartProps {
  title: string;
  data: TopItem[];
  color: string;
  yAxisWidth?: number;
}

export function TopChart({ title, data, color, yAxisWidth = 150 }: TopChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" stroke="#6b7280" fontSize={12} />
            <YAxis
              dataKey="name"
              type="category"
              stroke="#6b7280"
              fontSize={12}
              width={yAxisWidth}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: number) => [value, 'Ventes']}
              contentStyle={tooltipStyle}
            />
            <Bar dataKey="sales" fill={color} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
