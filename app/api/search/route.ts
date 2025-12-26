import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ materials: [], groups: [] });
    }

    const supabase = await createClient();

    // Parallel search for Materials and Groups
    const [materialsResult, groupsResult] = await Promise.all([
        supabase
            .from('materials')
            .select('id, title, subject')
            .ilike('title', `%${query}%`)
            .limit(5),
        supabase
            .from('groups')
            .select('id, name')
            .ilike('name', `%${query}%`)
            .limit(5)
    ]);

    return NextResponse.json({
        materials: materialsResult.data || [],
        groups: groupsResult.data || []
    });
}
