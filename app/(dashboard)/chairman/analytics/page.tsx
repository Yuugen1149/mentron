import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/DashboardHeader';
import { DashboardLayout } from '@/components/DashboardLayout';

export default async function ChairmanAnalyticsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: admin } = await supabase
        .from('admins')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!admin || admin.role !== 'chairman') {
        redirect('/login');
    }

    const { count: totalStudents } = await supabase.from('group_members').select('*', { count: 'exact', head: true });

    // Fetch students for department distribution and recent activity
    const { data: students } = await supabase
        .from('group_members')
        .select('created_at, department, year')
        .order('created_at', { ascending: false });

    const { count: totalMaterials } = await supabase.from('materials').select('*', { count: 'exact', head: true });

    // Fetch materials for recent activity
    const { data: recentMaterials } = await supabase
        .from('materials')
        .select('created_at, title, department')
        .order('created_at', { ascending: false })
        .limit(5);

    const { data: materials } = await supabase.from('materials').select('view_count');
    const totalViews = materials?.reduce((sum, m) => sum + (m.view_count || 0), 0) || 0;

    // Calculate real department distribution
    const deptCounts = students?.reduce((acc: any, student: any) => {
        const dept = student.department || 'Unknown';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
    }, {}) || {};

    const deptData = [
        { name: 'ECE', count: deptCounts['ECE'] || 0, color: 'from-blue-500 to-cyan-500' },
        { name: 'CSE', count: deptCounts['CSE'] || 0, color: 'from-purple-500 to-pink-500' },
        { name: 'EEE', count: deptCounts['EEE'] || 0, color: 'from-cyan-500 to-blue-500' },
        { name: 'ME', count: deptCounts['ME'] || 0, color: 'from-pink-500 to-purple-500' },
        { name: 'CE', count: deptCounts['CE'] || 0, color: 'from-green-500 to-emerald-500' },
    ].filter(d => d.count > 0 || ['ECE', 'CSE', 'EEE', 'ME'].includes(d.name));

    // Combine and sort recent activity
    const activity = [
        ...(students?.slice(0, 5).map(s => ({
            type: 'student',
            text: `New student registered - ${s.department} Year ${s.year}`,
            date: new Date(s.created_at),
            color: 'bg-green-400'
        })) || []),
        ...(recentMaterials?.map(m => ({
            type: 'material',
            text: `Material uploaded - ${m.title}`,
            date: new Date(m.created_at),
            color: 'bg-blue-400'
        })) || [])
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

    const userName = admin.position || admin.email.split('@')[0];

    const handleSignOut = async () => {
        'use server';
        const supabase = await createClient();
        await supabase.auth.signOut();
        redirect('/');
    };

    return (
        <DashboardLayout userRole="chairman">
            <main className="relative min-h-screen p-6 sm:p-8 lg:p-10">
                <div className="max-w-7xl mx-auto">
                    <DashboardHeader
                        userName={userName}
                        subtitle="System Analytics & Insights"
                        userRole="chairman"
                        onSignOut={handleSignOut}
                    />

                    <div className="mb-8">
                        <h2 className="!text-3xl sm:!text-4xl font-bold mb-2">Analytics Dashboard</h2>
                        <p className="text-text-secondary">System-wide statistics and performance metrics</p>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="glass-card">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-text-secondary text-sm font-medium">Total Students</h3>
                                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <div className="text-3xl font-bold">{totalStudents || 0}</div>
                            <p className="text-text-secondary text-sm mt-2">Registered users</p>
                        </div>

                        <div className="glass-card">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-text-secondary text-sm font-medium">Total Materials</h3>
                                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="text-3xl font-bold">{totalMaterials || 0}</div>
                            <p className="text-text-secondary text-sm mt-2">Study materials</p>
                        </div>

                        <div className="glass-card">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-text-secondary text-sm font-medium">Total Views</h3>
                                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                            <div className="text-3xl font-bold">{totalViews}</div>
                            <p className="text-text-secondary text-sm mt-2">Material views</p>
                        </div>

                        <div className="glass-card">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-text-secondary text-sm font-medium">Avg. Views/Material</h3>
                                <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <div className="text-3xl font-bold">
                                {totalMaterials ? Math.round(totalViews / totalMaterials) : 0}
                            </div>
                            <p className="text-text-secondary text-sm mt-2">Per uploaded item</p>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="glass-card">
                            <h3 className="text-xl font-semibold mb-6">Department Distribution</h3>
                            <div className="space-y-4">
                                {deptData.map((dept) => (
                                    <div key={dept.name}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">{dept.name}</span>
                                            <span className="text-sm text-text-secondary">{dept.count} students</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-gradient-to-r ${dept.color}`}
                                                style={{ width: `${totalStudents ? (dept.count / totalStudents) * 100 : 0}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card">
                            <h3 className="text-xl font-semibold mb-6">Recent Activity</h3>
                            <div className="space-y-3">
                                {activity.length > 0 ? activity.map((item, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                                        <div className={`w-2 h-2 ${item.color} rounded-full`}></div>
                                        <span className="text-sm">{item.text}</span>
                                        <span className="text-xs text-text-secondary ml-auto">
                                            {item.date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                )) : (
                                    <p className="text-text-secondary text-sm">No recent activity</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="h-8 sm:h-0 mobile-nav-safe"></div>
                </div>
            </main>
        </DashboardLayout>
    );
}
