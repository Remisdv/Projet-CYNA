import { Card } from '@/shared/components/ui/Card';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { formatCurrencyEur, formatShortDate } from '@/features/commercial/lib/commercialFormatters';

interface DailyPoint { date: string; sales: number; revenue: number }
interface TopPoint { name: string; ventes: number; revenue: number }

export function DailySalesChart({ data }: { data: DailyPoint[] }) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Ventes / Jour (30 derniers jours)
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={formatShortDate} style={{ fontSize: '12px' }} />
          <YAxis style={{ fontSize: '12px' }} />
          <Tooltip
            labelFormatter={(label) => formatShortDate(label as string)}
            formatter={(value: number) => [value, 'Ventes']}
          />
          <Bar dataKey="sales" fill="#3b82f6" name="Ventes" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function DailyRevenueChart({ data }: { data: DailyPoint[] }) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Revenus / Jour (30 derniers jours)
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={formatShortDate} style={{ fontSize: '12px' }} />
          <YAxis
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            labelFormatter={(label) => formatShortDate(label as string)}
            formatter={(value: number) => [formatCurrencyEur(value), 'Revenus']}
          />
          <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenus" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function Top5ProductsChart({ data }: { data: TopPoint[] }) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Top 5 Produits (Revenus & Ventes)
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" style={{ fontSize: '12px' }} />
          <YAxis yAxisId="left" style={{ fontSize: '12px' }} />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === 'Revenus') return [formatCurrencyEur(value), name];
              return [value, name];
            }}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="ventes" fill="#3b82f6" name="Ventes" />
          <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenus" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
