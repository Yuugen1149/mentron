import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/DashboardHeader';
import { DashboardLayout } from '@/components/DashboardLayout';

export default async function StudentNotificationsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Get student profile
    const { data: student } = await supabase
        .from('group_members')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!student) {
        redirect('/login');
    }

    const userName = student.email.split('@')[0];

    const handleSignOut = async () => {
        'use server';
        const supabase = await createClient();
        await supabase.auth.signOut();
        redirect('/');
    };

    // Mock notifications data (replace with actual database query)
    const notifications = [
        {
            id: 1,
            title: 'New Study Material Available',
            message: 'Digital Electronics notes have been uploaded for ECE Year 2',
            type: 'material',
            timestamp: '2 hours ago',
            read: false,
        },
        {
            id: 2,
            title: 'Upcoming Event: Tech Workshop',
            message: 'Join us for a hands-on workshop on IoT development this Saturday',
            type: 'event',
            timestamp: '1 day ago',
            read: false,
        },
        {
            id: 3,
            title: 'Important Announcement',
            message: 'Library timings have been extended till 10 PM from next week',
            type: 'announcement',
            timestamp: '3 days ago',
            read: true,
        },
    ];

    return (
        <DashboardLayout userRole="student">
            <main className="relative min-h-screen p-6 sm:p-8 lg:p-10">
                <div className="max-w-4xl mx-auto">
                    <DashboardHeader
                        userName={userName}
                        subtitle={`${student.department} - Year ${student.year}`}
                        userRole="student"
                        onSignOut={handleSignOut}
                    />

                    {/* Page Title */}
                    <div className="mb-8">
                        <h2 className="!text-3xl sm:!text-4xl font-bold mb-2">Notifications</h2>
                        <p className="text-text-secondary">
                            Stay updated with announcements and important information
                        </p>
                    </div>

                    {/* Notifications List */}
                    {notifications.length > 0 ? (
                        <div className="space-y-4">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`glass-card hover:bg-white/5 transition-all cursor-pointer ${!notification.read ? 'border-l-4 border-primary-cyan' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${notification.type === 'material' ? 'bg-blue-500/20' :
                                                notification.type === 'event' ? 'bg-purple-500/20' :
                                                    'bg-cyan-500/20'
                                            }`}>
                                            {notification.type === 'material' && (
                                                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                            )}
                                            {notification.type === 'event' && (
                                                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            )}
                                            {notification.type === 'announcement' && (
                                                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h3 className="font-semibold text-lg">{notification.title}</h3>
                                                {!notification.read && (
                                                    <span className="w-2 h-2 bg-primary-cyan rounded-full flex-shrink-0 mt-2"></span>
                                                )}
                                            </div>
                                            <p className="text-text-secondary text-sm mb-2">
                                                {notification.message}
                                            </p>
                                            <span className="text-xs text-text-secondary">{notification.timestamp}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass-card text-center py-16">
                            <svg className="w-16 h-16 text-text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <h3 className="text-xl font-semibold mb-2">No Notifications</h3>
                            <p className="text-text-secondary">
                                You're all caught up! New notifications will appear here.
                            </p>
                        </div>
                    )}

                    {/* Mobile Bottom Padding */}
                    <div className="h-8 sm:h-0 mobile-nav-safe"></div>
                </div>
            </main>
        </DashboardLayout>
    );
}
