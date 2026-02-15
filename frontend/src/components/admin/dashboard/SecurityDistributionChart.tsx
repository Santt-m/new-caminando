import type { SecurityMetric } from '@/services/admin/analytics.service';
import { ShieldAlert, User, Bot } from 'lucide-react';

interface Props {
    data: SecurityMetric['visitorStateDistribution'];
    total: number;
    title: string;
}

export const SecurityDistributionChart = ({ data, total, title }: Props) => {
    // Definimos colores para cada estado
    const colors: Record<string, string> = {
        NORMAL: '#10B981', // Verde
        SUSPICIOUS: '#F59E0B', // Ambar
        BOT: '#6366F1', // Indigo
        SCRAPER: '#8B5CF6', // Violeta
        MALICIOUS: '#EF4444', // Rojo
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const icons: Record<string, any> = {
        NORMAL: User,
        SUSPICIOUS: ShieldAlert,
        BOT: Bot,
        SCRAPER: Bot,
        MALICIOUS: ShieldAlert,
    };

    // Calcular segmentos para el conic-gradient
    let currentDeg = 0;
    const segments = Object.entries(data).map(([key, value]) => {
        const percentage = (value / total) * 100;
        const deg = (value / total) * 360;
        const start = currentDeg;
        currentDeg += deg;
        return { key, value, percentage, start, end: currentDeg, color: colors[key] || '#9CA3AF' };
    });

    const conicGradient = segments
        .map((s) => `${s.color} ${s.start}deg ${s.end}deg`)
        .join(', ');

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm h-full flex flex-col">
            <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="font-semibold leading-none tracking-tight">{title}</h3>
                <p className="text-sm text-muted-foreground">Distribución de tipos de visitantes.</p>
            </div>
            <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4 items-center flex-1">
                {/* Gráfico Donut CSS puro */}
                <div className="relative w-48 h-48 mx-auto">
                    <div
                        className="w-full h-full rounded-full"
                        style={{
                            background: `conic-gradient(${conicGradient || '#e5e7eb 0deg 360deg'})`,
                        }}
                    ></div>
                    {/* Agujero del donut */}
                    <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-card rounded-full transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold">{total}</span>
                        <span className="text-xs text-muted-foreground uppercase">Requests</span>
                    </div>
                </div>

                {/* Leyenda */}
                <div className="space-y-3">
                    {segments
                        .sort((a, b) => b.value - a.value)
                        .map((segment) => {
                            const Icon = icons[segment.key] || User;
                            return (
                                <div key={segment.key} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 rounded-md" style={{ backgroundColor: segment.color + '20' }}>
                                            <Icon size={14} style={{ color: segment.color }} />
                                        </div>
                                        <span className="capitalize text-muted-foreground">
                                            {segment.key.toLowerCase()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{segment.value}</span>
                                        <span className="text-xs text-muted-foreground w-8 text-right">
                                            {segment.percentage.toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        </div>
    );
};
