import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { ArrowUpRight, ArrowDownRight, Target } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  trend: number | null;
  icon: React.ReactNode;
  goal?: number;
  goalLabel?: string;
}

export function KPICard({ title, value, trend, icon, goal, goalLabel }: KPICardProps) {
  const isPositive = trend !== null && trend >= 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        <div className="flex items-center justify-between mt-2">
          {trend !== null ? (
            <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              <span>{isPositive ? '+' : ''}{trend}% vs période préc.</span>
            </div>
          ) : (
            <span className="text-sm text-gray-400">Pas de données précédentes</span>
          )}
          {goal !== undefined && (
            <div className="flex items-center text-xs text-gray-500">
              <Target className="h-3 w-3 mr-1" />
              <span>{goalLabel || `Objectif: ${goal}%`}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
