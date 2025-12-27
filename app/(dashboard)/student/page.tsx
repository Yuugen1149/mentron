import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/DashboardHeader';
import { StatCard } from '@/components/StatCard';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MaterialViewButton } from '@/components/MaterialViewButton';

export default async function StudentDashboard() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Get student profile with group info
    const { data: student } = await supabase
        .from('group_members')
        .select(`
            *,
            group:groups(id, name, department, year, color)
        `)
        .eq('id', user.id)
        .single();

    if (!student) {
        redirect('/login');
    }

    // Check if student is assigned to a group
    const isAssigned = student.group_id !== null;
    const studentGroup = student.group as { id: string; name: string; department: string; year: number; color: string } | null;

    // Get materials - only if assigned, filter by group's department and year
    let materials: any[] = [];
    if (isAssigned && studentGroup) {
        const { data: materialsData } = await supabase
            .from('materials')
            .select('*')
            .eq('department', studentGroup.department)
            .or(`year.eq.${studentGroup.year},year.is.null`)
            .order('created_at', { ascending: false });
        materials = materialsData || [];
    }

    // Mock data for charts
    const mockWeeklyData = [5, 8, 6, 12, 9, 15, 11];

    const userName = student.email.split('@')[0];

    const handleSignOut = async () => {
        'use server';
        const supabase = await createClient();
        await supabase.auth.signOut();
        redirect('/');
    };

    // Subtitle based on assignment status
    const subtitle = isAssigned && studentGroup
        ? `${studentGroup.name} • ${studentGroup.department} - Year ${studentGroup.year}`
        : 'Pending Group Assignment';

    return (
        <DashboardLayout userRole="student">
            <main className="relative min-h-screen p-6 sm:p-8 lg:p-10">
                <div className="max-w-7xl mx-auto">
                    {/* Enhanced Header */}
                    <DashboardHeader
                        userName={userName}
                        subtitle={subtitle}
                        userRole="student"
                        onSignOut={handleSignOut}
                    />

                    {/* Unassigned Student View */}
                    {!isAssigned && (
                        <div className="mb-8">
                            <div className="glass-card border-2 border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-transparent">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-yellow-400 mb-1">
                                            Pending Group Assignment
                                        </h3>
                                        <p className="text-[var(--text-secondary)] text-sm">
                                            You haven't been assigned to a group yet. Once an administrator assigns you to a group,
                                            you'll have access to study materials, announcements, and other resources specific to your department and year.
                                        </p>
                                        <p className="text-[var(--text-secondary)] text-xs mt-2 opacity-70">
                                            Please contact your department coordinator if you believe this is an error.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stat Cards - Only show full stats if assigned */}
                    {isAssigned ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-10">
                            <StatCard
                                title="Available Materials"
                                value={materials.length}
                                trend={{ percentage: 8, direction: 'up' }}
                                subtitle={`For ${studentGroup?.department || 'your group'}`}
                                chartData={mockWeeklyData}
                                color="blue"
                                icon={
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                }
                            />

                            <StatCard
                                title="Materials Viewed"
                                value={0}
                                trend={{ percentage: 0, direction: 'neutral' }}
                                subtitle="This week"
                                chartData={[0, 0, 0, 0, 0, 0, 0]}
                                color="purple"
                                icon={
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                }
                            />

                            <StatCard
                                title="New This Week"
                                value={0}
                                trend={{ percentage: 0, direction: 'neutral' }}
                                subtitle="Recently added"
                                chartData={[0, 0, 0, 0, 0, 0, 0]}
                                color="cyan"
                                icon={
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                }
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                            <div className="glass-card opacity-50">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-[var(--text-secondary)]">Materials</p>
                                        <p className="text-xl font-bold text-[var(--text-primary)]">--</p>
                                    </div>
                                </div>
                                <p className="text-xs text-[var(--text-secondary)]">Available after assignment</p>
                            </div>

                            <div className="glass-card opacity-50">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-[var(--text-secondary)]">Group</p>
                                        <p className="text-xl font-bold text-[var(--text-primary)]">--</p>
                                    </div>
                                </div>
                                <p className="text-xs text-[var(--text-secondary)]">Awaiting assignment</p>
                            </div>
                        </div>
                    )}

                    {/* Materials Section - Only show if assigned */}
                    {isAssigned && (
                        <>
                            <div className="mb-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl sm:text-2xl font-bold">Study Materials</h2>
                                    {studentGroup && (
                                        <span
                                            className="px-3 py-1 rounded-full text-xs font-medium"
                                            style={{
                                                backgroundColor: `${studentGroup.color}20`,
                                                color: studentGroup.color
                                            }}
                                        >
                                            {studentGroup.department} - Year {studentGroup.year}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {materials.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                    {materials.map((material) => (
                                        <div
                                            key={material.id}
                                            className="glass-card hover:scale-[1.02] transition-transform touch-manipulation"
                                        >
                                            <div className="flex items-start gap-3 sm:gap-4 mb-4">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary-cyan/20 flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-base sm:text-lg font-semibold mb-1 truncate">{material.title}</h3>
                                                    {material.description && (
                                                        <p className="text-text-secondary text-xs sm:text-sm line-clamp-2">
                                                            {material.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 sm:gap-4 text-xs text-text-secondary mb-4">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    {material.view_count} views
                                                </span>
                                                <span className="uppercase font-semibold">{material.file_type}</span>
                                            </div>
                                            <MaterialViewButton
                                                materialId={material.id}
                                                fileUrl={material.file_url}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="glass-card text-center py-12 sm:py-16">
                                    <svg className="w-12 h-12 sm:w-16 sm:h-16 text-text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <h3 className="text-lg sm:text-xl font-semibold mb-2">No Materials Yet</h3>
                                    <p className="text-text-secondary text-sm sm:text-base">
                                        Study materials for {studentGroup?.department} Year {studentGroup?.year} will appear here.
                                    </p>
                                </div>
                            )}
                        </>
                    )}

                    {/* Unassigned - Show placeholder content */}
                    {!isAssigned && (
                        <div className="glass-card text-center py-16">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-[var(--text-primary)]">
                                Content Locked
                            </h3>
                            <p className="text-[var(--text-secondary)] max-w-md mx-auto">
                                Study materials, announcements, and group resources will become available
                                once you've been assigned to a group by an administrator.
                            </p>
                        </div>
                    )}

                    {/* Mobile Bottom Padding for Safe Area */}
                    <div className="h-8 sm:h-0 mobile-nav-safe"></div>
                </div>
            </main>
        </DashboardLayout>
    );
}
