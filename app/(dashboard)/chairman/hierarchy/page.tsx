import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/DashboardLayout';
import { HierarchyClient } from '@/components/hierarchy';

export default async function ChairmanHierarchyPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    // Check if user is chairman
    const { data: admin } = await supabase
        .from('admins')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!admin || admin.role !== 'chairman') {
        redirect('/dashboard');
    }

    return (
        <DashboardLayout userRole="chairman">
            <HierarchyClient userRole="chairman" />
        </DashboardLayout>
    );
}
