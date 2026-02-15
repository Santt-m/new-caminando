interface SimpleLineChartProps {
    data: Array<{ label: string; value: number }>;
    height?: number;
    color?: string;
}

export const SimpleLineChart = ({ data, height = 200, color = 'rgb(59, 130, 246)' }: SimpleLineChartProps) => {
    if (data.length === 0) return <div className="text-center text-muted-foreground py-8">Sin datos</div>;

    const maxValue = Math.max(...data.map(d => d.value), 1);
    const points = data.map((d, i) => ({
        x: (i / (data.length - 1)) * 100,
        y: 100 - (d.value / maxValue) * 100
    }));

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaD = `${pathD} L 100 100 L 0 100 Z`;

    return (
        <div className="relative" style={{ height }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.3 }} />
                        <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
                    </linearGradient>
                </defs>
                <path d={areaD} fill="url(#gradient)" />
                <path d={pathD} fill="none" stroke={color} strokeWidth="0.5" />
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-[10px] text-muted-foreground">
                <span>{data[0]?.label}</span>
                <span>{data[Math.floor(data.length / 2)]?.label}</span>
                <span>{data[data.length - 1]?.label}</span>
            </div>
        </div>
    );
};

interface DonutChartProps {
    data: Array<{ label: string; value: number; color: string }>;
    size?: number;
}

export const DonutChart = ({ data, size = 200 }: DonutChartProps) => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    if (total === 0) return <div className="text-center text-muted-foreground py-8">Sin datos</div>;

    const radius = 40;
    const innerRadius = 28;
    const cx = 50;
    const cy = 50;

    const segments = data.reduce((acc, d, index) => {
        const percentage = (d.value / total) * 100;
        const angle = (percentage / 100) * 360;
        const prevAngle = index === 0 ? -90 : acc[index - 1].endAngle;
        const startAngle = prevAngle;
        const endAngle = prevAngle + angle;

        const x1 = cx + radius * Math.cos((startAngle * Math.PI) / 180);
        const y1 = cy + radius * Math.sin((startAngle * Math.PI) / 180);
        const x2 = cx + radius * Math.cos((endAngle * Math.PI) / 180);
        const y2 = cy + radius * Math.sin((endAngle * Math.PI) / 180);
        const largeArc = angle > 180 ? 1 : 0;

        const ix1 = cx + innerRadius * Math.cos((startAngle * Math.PI) / 180);
        const iy1 = cy + innerRadius * Math.sin((startAngle * Math.PI) / 180);
        const ix2 = cx + innerRadius * Math.cos((endAngle * Math.PI) / 180);
        const iy2 = cy + innerRadius * Math.sin((endAngle * Math.PI) / 180);

        const path = `
            M ${x1} ${y1}
            A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
            L ${ix2} ${iy2}
            A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}
            Z
        `;

        acc.push({ path, color: d.color, label: d.label, value: d.value, percentage, endAngle });
        return acc;
    }, [] as Array<{ path: string; color: string; label: string; value: number; percentage: number; endAngle: number }>);

    return (
        <div className="flex items-center gap-6">
            <svg width={size} height={size} viewBox="0 0 100 100">
                {segments.map((seg, i) => (
                    <path key={i} d={seg.path} fill={seg.color} />
                ))}
                <text x="50" y="50" textAnchor="middle" dy=".3em" className="text-xl font-bold fill-foreground">
                    {total}
                </text>
            </svg>
            <div className="space-y-2">
                {segments.map((seg, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: seg.color }} />
                        <span className="text-muted-foreground">{seg.label}</span>
                        <span className="font-medium ml-auto">{seg.value} ({seg.percentage.toFixed(1)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface BarChartProps {
    data: Array<{ label: string; value: number; color?: string }>;
}

export const BarChart = ({ data }: BarChartProps) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <div className="space-y-3">
            {data.map((item, i) => (
                <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-medium">{item.value}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${(item.value / maxValue) * 100}%`,
                                backgroundColor: item.color || 'rgb(59, 130, 246)'
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};
