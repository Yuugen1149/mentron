'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestPage() {
    const [results, setResults] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function runTests() {
            const testResults: any = {};

            // Test 1: Check auth status
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            testResults.auth = {
                success: !authError,
                user: user ? { id: user.id, email: user.email } : null,
                error: authError?.message
            };

            // Test 2: Query admins table
            const { data: admins, error: adminsError } = await supabase
                .from('admins')
                .select('*');

            testResults.admins = {
                success: !adminsError,
                count: admins?.length || 0,
                data: admins,
                error: adminsError?.message,
                details: adminsError?.details,
                hint: adminsError?.hint,
                code: adminsError?.code
            };

            // Test 3: Query specific admin by ID (if user exists)
            if (user) {
                const { data: admin, error: adminError } = await supabase
                    .from('admins')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                testResults.specificAdmin = {
                    success: !adminError,
                    data: admin,
                    error: adminError?.message,
                    details: adminError?.details,
                    hint: adminError?.hint,
                    code: adminError?.code
                };
            }

            // Test 4: Query groups table
            const { data: groups, error: groupsError } = await supabase
                .from('groups')
                .select('*');

            testResults.groups = {
                success: !groupsError,
                count: groups?.length || 0,
                error: groupsError?.message
            };

            // Test 5: Query group_members table
            const { data: students, error: studentsError } = await supabase
                .from('group_members')
                .select('*');

            testResults.students = {
                success: !studentsError,
                count: students?.length || 0,
                error: studentsError?.message
            };

            setResults(testResults);
            setLoading(false);
        }

        runTests();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-cyan mx-auto mb-4"></div>
                    <p className="text-text-secondary">Running database tests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">Database Connection Test</h1>

                {/* Auth Test */}
                <div className="glass-card mb-6">
                    <h2 className="text-2xl font-bold mb-4">
                        {results.auth?.success ? '✅' : '❌'} Authentication
                    </h2>
                    <pre className="bg-black/20 p-4 rounded overflow-auto text-sm">
                        {JSON.stringify(results.auth, null, 2)}
                    </pre>
                </div>

                {/* Admins Table Test */}
                <div className="glass-card mb-6">
                    <h2 className="text-2xl font-bold mb-4">
                        {results.admins?.success ? '✅' : '❌'} Admins Table Query
                    </h2>
                    <pre className="bg-black/20 p-4 rounded overflow-auto text-sm">
                        {JSON.stringify(results.admins, null, 2)}
                    </pre>
                </div>

                {/* Specific Admin Test */}
                {results.specificAdmin && (
                    <div className="glass-card mb-6">
                        <h2 className="text-2xl font-bold mb-4">
                            {results.specificAdmin?.success ? '✅' : '❌'} Specific Admin Query
                        </h2>
                        <pre className="bg-black/20 p-4 rounded overflow-auto text-sm">
                            {JSON.stringify(results.specificAdmin, null, 2)}
                        </pre>
                    </div>
                )}

                {/* Groups Table Test */}
                <div className="glass-card mb-6">
                    <h2 className="text-2xl font-bold mb-4">
                        {results.groups?.success ? '✅' : '❌'} Groups Table Query
                    </h2>
                    <pre className="bg-black/20 p-4 rounded overflow-auto text-sm">
                        {JSON.stringify(results.groups, null, 2)}
                    </pre>
                </div>

                {/* Students Table Test */}
                <div className="glass-card mb-6">
                    <h2 className="text-2xl font-bold mb-4">
                        {results.students?.success ? '✅' : '❌'} Group Members Table Query
                    </h2>
                    <pre className="bg-black/20 p-4 rounded overflow-auto text-sm">
                        {JSON.stringify(results.students, null, 2)}
                    </pre>
                </div>

                {/* Summary */}
                <div className="glass-card bg-gradient-to-br from-primary-cyan/10 to-secondary-purple/10">
                    <h2 className="text-2xl font-bold mb-4">Summary</h2>
                    <div className="space-y-2">
                        <p>✅ Tests Passed: {Object.values(results).filter((r: any) => r?.success).length}</p>
                        <p>❌ Tests Failed: {Object.values(results).filter((r: any) => !r?.success).length}</p>

                        {!results.admins?.success && (
                            <div className="mt-4 p-4 bg-accent-pink/10 border border-accent-pink/20 rounded">
                                <p className="font-bold text-accent-pink mb-2">⚠️ Admin Table Query Failed</p>
                                <p className="text-sm">This is likely due to:</p>
                                <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                                    <li>RLS policies blocking anonymous access</li>
                                    <li>Table doesn't exist (run schema.sql)</li>
                                    <li>Service role key not configured</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
