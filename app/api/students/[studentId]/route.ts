import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface DeleteParams {
    params: Promise<{ studentId: string }>;
}

// DELETE - Remove a student (chairman only)
export async function DELETE(request: Request, { params }: DeleteParams) {
    try {
        const { studentId } = await params;
        const supabase = await createClient();

        // Verify authentication
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify user is Chairman or Vice Chair only
        const { data: admin } = await supabase
            .from('admins')
            .select('*')
            .eq('id', user.id)
            .single();

        const canDelete = admin && (
            admin.role === 'chairman' ||
            admin.position === 'Vice Chair'
        );

        if (!canDelete) {
            return NextResponse.json(
                { error: 'Forbidden - Only Chairman and Vice Chair can delete students' },
                { status: 403 }
            );
        }

        // Get student info before deletion for audit log
        const { data: student } = await supabase
            .from('group_members')
            .select('*')
            .eq('id', studentId)
            .single();

        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        // Delete from group_members table
        const { error: deleteError } = await supabase
            .from('group_members')
            .delete()
            .eq('id', studentId);

        if (deleteError) {
            console.error('Error deleting student profile:', deleteError);
            return NextResponse.json(
                { error: 'Failed to delete student profile' },
                { status: 500 }
            );
        }

        // Try to delete auth user (may fail if using service role is not available)
        // This is optional - the profile is already deleted
        try {
            await supabase.auth.admin.deleteUser(studentId);
        } catch (authError) {
            console.warn('Could not delete auth user (may require admin privileges):', authError);
            // Continue - profile deletion was successful
        }

        // Log the action (if audit_logs table exists)
        try {
            await supabase
                .from('audit_logs')
                .insert({
                    action: 'DELETE_STUDENT',
                    actor_id: user.id,
                    actor_email: admin.email,
                    target_id: studentId,
                    target_email: student.email,
                    details: {
                        student_name: student.name,
                        department: student.department,
                        year: student.year,
                        deleted_at: new Date().toISOString()
                    }
                });
        } catch (auditError) {
            // Audit logging is optional, don't fail the request
            console.warn('Audit log insert failed (table may not exist):', auditError);
        }

        return NextResponse.json({
            success: true,
            message: `Student ${student.email} has been deleted`,
            deletedStudent: {
                id: studentId,
                email: student.email,
                name: student.name
            }
        });

    } catch (error: any) {
        console.error('Student deletion error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// GET - Get a specific student's details
export async function GET(request: Request, { params }: DeleteParams) {
    try {
        const { studentId } = await params;
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

        const { data: student, error } = await supabase
            .from('group_members')
            .select(`
                *,
                group:groups(*)
            `)
            .eq('id', studentId)
            .single();

        if (error) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        return NextResponse.json({ student });

    } catch (error: any) {
        console.error('Error fetching student:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
