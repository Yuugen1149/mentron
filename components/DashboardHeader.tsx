'use client';

import { useState, useEffect } from 'react';
import { NotificationsPanel } from './NotificationsPanel';

interface DashboardHeaderProps {
    userName: string;
    subtitle: string;
    userRole: 'student' | 'execom' | 'chairman';
    onSignOut?: () => void;
}

export function DashboardHeader({ userName, subtitle, userRole, onSignOut }: DashboardHeaderProps) {
    const [greeting, setGreeting] = useState('Hello');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 18) setGreeting('Good afternoon');
        else setGreeting('Good evening');
    }, []);

    return (
        <div className="flex flex-col gap-6 mb-8 md:mb-10 lg:mb-12">
            {/* Top Row - Greeting and Sign Out */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <h2 className="!text-2xl sm:!text-3xl md:!text-4xl font-bold mb-1 truncate">
                        {greeting}, {userName}
                    </h2>
                    <p className="text-text-secondary text-sm sm:text-base">{subtitle}</p>
                </div>

                {/* Mobile: Just Sign Out */}
                {onSignOut && (
                    <button
                        onClick={onSignOut}
                        className="md:hidden px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm font-medium whitespace-nowrap"
                    >
                        Sign Out
                    </button>
                )}
            </div>

            {/* Bottom Row - Search and Actions (Desktop) */}
            <div className="hidden md:flex items-center gap-4">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full px-4 py-2 pl-10 rounded-lg bg-white/5 border border-white/10 focus:border-primary-cyan focus:outline-none focus:ring-2 focus:ring-primary-cyan/20 transition-all text-sm"
                    />
                    <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Notifications */}
                <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute top-1 right-1 w-2 h-2 bg-accent-pink rounded-full"></span>
                </button>

                {/* Sign Out (Desktop) */}
                {onSignOut && (
                    <button
                        onClick={onSignOut}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm font-medium"
                    >
                        Sign Out
                    </button>
                )}
            </div>

            {/* Mobile Search Bar */}
            <div className="md:hidden relative">
                <input
                    type="text"
                    placeholder="Search..."
                    className="w-full px-4 py-2.5 pl-10 rounded-lg bg-white/5 border border-white/10 focus:border-primary-cyan focus:outline-none focus:ring-2 focus:ring-primary-cyan/20 transition-all text-sm"
                />
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
        </div>
    );
}
