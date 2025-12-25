import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// POST - Assign/reassign students to groups
export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const { data: admin } = await supabase
            .from('admins')
            .select('*')
            .eq('id', user.id)
            .single();

        if (!admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { studentIds, groupId } = body;

        if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
            return NextResponse.json(
                { error: 'studentIds array is required' },
                { status: 400 }
            );
        }

        // If groupId is provided, verify the group exists and admin has permission
        if (groupId) {
            const { data: group } = await supabase
                .from('groups')
                .select('*')
                .eq('id', groupId)
                .single();

            if (!group) {
                return NextResponse.json({ error: 'Group not found' }, { status: 404 });
            }

            // Execom can only assign to groups in their department
            if (admin.role === 'execom' && group.department !== admin.department) {
                return NextResponse.json(
                    { error: 'You can only assign students to groups in your department' },
                    { status: 403 }
                );
            }
        }

        // Update the students' group_id
        const { data: updatedStudents, error } = await supabase
            .from('group_members')
            .update({ group_id: groupId })
            .in('id', studentIds)
            .select();

        if (error) throw error;

        return NextResponse.json({
            message: `Successfully ${groupId ? 'assigned' : 'unassigned'} ${updatedStudents?.length || 0} student(s)`,
            students: updatedStudents
        });
    } catch (error: any) {
        console.error('Error assigning students:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
