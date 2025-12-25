'use client';

interface TrendIndicatorProps {
    percentage: number;
    direction: 'up' | 'down' | 'neutral';
}

export function TrendIndicator({ percentage, direction }: TrendIndicatorProps) {
    const getColor = () => {
        if (direction === 'up') return 'text-green-500';
        if (direction === 'down') return 'text-red-500';
        return 'text-text-secondary';
    };

    const getIcon = () => {
        if (direction === 'up') return '↑';
        if (direction === 'down') return '↓';
        return '→';
    };

    return (
        <span className={`text-sm font-semibold ${getColor()}`}>
            {getIcon()} {percentage}%
        </span>
    );
}
