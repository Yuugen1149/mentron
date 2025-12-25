const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabase() {
    console.log('🔍 Checking Mentron Database Status...\n');

    try {
        // Check if admins table exists and has data
        console.log('1️⃣  Checking admins table...');
        const { data: admins, error: adminsError } = await supabase
            .from('admins')
            .select('*');

        if (adminsError) {
            console.error('❌ Error querying admins table:', adminsError.message);
            console.log('   This likely means the table doesn\'t exist yet.');
            console.log('   👉 Run supabase/schema.sql in Supabase Dashboard\n');
        } else {
            console.log(`✅ Admins table exists with ${admins?.length || 0} rows`);
            if (admins && admins.length > 0) {
                console.log('   Admins found:');
                admins.forEach(admin => {
                    console.log(`   - ${admin.email} (${admin.role}) - ${admin.is_active ? 'Active' : 'Inactive'}`);
                });
            }
            console.log('');
        }

        // Check auth users
        console.log('2️⃣  Checking auth.users...');
        const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

        if (usersError) {
            console.error('❌ Error listing users:', usersError.message);
        } else {
            console.log(`✅ Found ${users?.length || 0} auth users`);
            if (users && users.length > 0) {
                console.log('   Users:');
                users.forEach(user => {
                    console.log(`   - ${user.email} (ID: ${user.id.substring(0, 8)}...)`);
                });
            }
            console.log('');
        }

        // Check if auth users are linked to admin profiles
        if (admins && admins.length > 0 && users && users.length > 0) {
            console.log('3️⃣  Checking user-profile linkage...');
            const adminIds = new Set(admins.map(a => a.id));
            const userIds = new Set(users.map(u => u.id));

            const linkedUsers = users.filter(u => adminIds.has(u.id));
            const unlinkedUsers = users.filter(u => !adminIds.has(u.id));

            console.log(`✅ ${linkedUsers.length} users are linked to admin profiles`);
            if (unlinkedUsers.length > 0) {
                console.log(`⚠️  ${unlinkedUsers.length} users are NOT linked:`);
                unlinkedUsers.forEach(u => {
                    console.log(`   - ${u.email}`);
                });
                console.log('   👉 Run supabase/seed-admins.sql to link them\n');
            } else {
                console.log('');
            }
        }

        // Check groups table
        console.log('4️⃣  Checking groups table...');
        const { data: groups, error: groupsError } = await supabase
            .from('groups')
            .select('*');

        if (groupsError) {
            console.error('❌ Error querying groups table:', groupsError.message);
        } else {
            console.log(`✅ Groups table exists with ${groups?.length || 0} rows\n`);
        }

        // Check group_members table
        console.log('5️⃣  Checking group_members table...');
        const { data: students, error: studentsError } = await supabase
            .from('group_members')
            .select('*');

        if (studentsError) {
            console.error('❌ Error querying group_members table:', studentsError.message);
        } else {
            console.log(`✅ Group members table exists with ${students?.length || 0} rows\n`);
        }

        // Summary
        console.log('📋 Summary:');
        console.log('─'.repeat(50));

        if (adminsError) {
            console.log('❌ DATABASE NOT SET UP');
            console.log('\n📝 Next Steps:');
            console.log('1. Open Supabase Dashboard');
            console.log('2. Go to SQL Editor');
            console.log('3. Run supabase/schema.sql');
            console.log('4. Run supabase/seed-admins.sql');
            console.log('5. Run this script again to verify\n');
        } else if (admins && admins.length === 0) {
            console.log('⚠️  TABLES EXIST BUT NO ADMINS');
            console.log('\n📝 Next Steps:');
            console.log('1. Open Supabase Dashboard');
            console.log('2. Go to SQL Editor');
            console.log('3. Run supabase/seed-admins.sql');
            console.log('4. Try logging in again\n');
        } else {
            console.log('✅ DATABASE IS SET UP CORRECTLY');
            console.log(`\n🎉 You should be able to log in with:`);
            console.log(`   Email: aadithyanrs9e@gmail.com`);
            console.log(`   Password: chair123\n`);
        }

    } catch (error) {
        console.error('💥 Fatal error:', error);
    }
}

checkDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
