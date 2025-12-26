export function getLast7DaysCounts(data: { created_at: string }[]) {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    data.forEach(item => {
        const itemDate = new Date(item.created_at);
        const itemDay = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());

        // Calculate difference in days
        const diffTime = today.getTime() - itemDay.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays < 7) {
            // 0 is today (index 6), 6 is 7 days ago (index 0)
            // We want index 6 to be today
            counts[6 - diffDays]++;
        }
    });

    return counts;
}

export function calculateGrowth(currentPeriod: number, previousPeriod: number): string {
    if (previousPeriod === 0) {
        return currentPeriod > 0 ? "+100%" : "0%";
    }
    const growth = ((currentPeriod - previousPeriod) / previousPeriod) * 100;
    return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
}
