import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/DashboardLayout';
import { HierarchyClient } from '@/components/hierarchy';

export default async function ExecomHierarchyPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    // Check if user is execom
    const { data: admin } = await supabase
        .from('admins')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!admin) {
        redirect('/dashboard');
    }

    return (
        <DashboardLayout userRole="execom">
            <HierarchyClient userRole="execom" userDepartment={admin.department} />
        </DashboardLayout>
    );
}
