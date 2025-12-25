'use client';

interface MiniBarChartProps {
    data: number[];
    color?: 'blue' | 'purple' | 'pink' | 'cyan';
}

export function MiniBarChart({ data, color = 'blue' }: MiniBarChartProps) {
    const max = Math.max(...data, 1); // Prevent division by zero
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    const colorClasses = {
        blue: 'bg-blue-400',
        purple: 'bg-purple-400',
        pink: 'bg-pink-400',
        cyan: 'bg-cyan-400',
    };

    return (
        <div className="flex items-end gap-1 h-16 mt-4">
            {data.map((value, index) => {
                const height = (value / max) * 100;
                return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                        <div
                            className={`w-full rounded-t ${colorClasses[color]} opacity-70 hover:opacity-100 transition-all`}
                            style={{ height: `${height}%`, minHeight: '2px' }}
                            title={`${days[index]}: ${value}`}
                        />
                    </div>
                );
            })}
        </div>
    );
}
