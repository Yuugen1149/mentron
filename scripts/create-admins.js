const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// IMPORTANT: This script uses the SERVICE ROLE KEY which has full access
// Only run this in a secure environment

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const admins = [
    // Chairman
    {
        email: 'aadithyanrs9e@gmail.com',
        password: 'chair123',
        role: 'chairman',
        department: 'ECE',
        position: 'Chairman'
    },
    // Execom Members
    {
        email: 'archasunil777@gmail.com',
        password: 'vchair123',
        role: 'execom',
        department: 'ECE',
        position: 'Vice Chair'
    },
    {
        email: 'amantejas05@gmail.com',
        password: 'sec123',
        role: 'execom',
        department: 'ECE',
        position: 'Secretary'
    },
    {
        email: 'nehasanjeevkrishna@gmail.com',
        password: 'jsec123',
        role: 'execom',
        department: 'ECE',
        position: 'Joint Secretary'
    },
    {
        email: 'abhirammanoj13@gmail.com',
        password: 'treas123',
        role: 'execom',
        department: 'ECE',
        position: 'Treasurer'
    },
    {
        email: 'aryashibu73@gmail.com',
        password: 'streas123',
        role: 'execom',
        department: 'ECE',
        position: 'Sub-Treasurer'
    },
    {
        email: 'anjanapradeep512@gmail.com',
        password: 'thead123',
        role: 'execom',
        department: 'CSE',
        position: 'Technical Head'
    },
    {
        email: 'aabhinavbr@gmail.com',
        password: 'mhead123',
        role: 'execom',
        department: 'ECE',
        position: 'Media Head'
    },
    {
        email: 'hareeshms6665@gmail.com',
        password: 'marhead123',
        role: 'execom',
        department: 'ECE',
        position: 'Marketing Head'
    },
    {
        email: 'unnikrishnan44013au@gmail.com',
        password: 'schair123',
        role: 'execom',
        department: 'ECE',
        position: 'Chairman SWAS'
    },
    {
        email: 'abhiraminair0406@gmail.com',
        password: 'sec-swas123',
        role: 'execom',
        department: 'ECE',
        position: 'Secretary SWAS'
    }
];

async function createAdminUsers() {
    console.log('🚀 Starting admin user creation...\n');

    for (const admin of admins) {
        try {
            // Create auth user
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: admin.email,
                password: admin.password,
                email_confirm: true // Auto-confirm email
            });

            if (authError) {
                console.error(`❌ Failed to create auth user for ${admin.email}:`, authError.message);
                continue;
            }

            console.log(`✅ Created auth user: ${admin.email}`);

            // Create admin profile
            const { error: profileError } = await supabase
                .from('admins')
                .insert({
                    id: authData.user.id,
                    email: admin.email,
                    role: admin.role,
                    department: admin.department,
                    position: admin.position,
                    can_view_analytics: admin.role === 'chairman',
                    is_active: true
                });

            if (profileError) {
                console.error(`❌ Failed to create admin profile for ${admin.email}:`, profileError.message);
            } else {
                console.log(`✅ Created admin profile: ${admin.position}\n`);
            }

        } catch (error) {
            console.error(`❌ Unexpected error for ${admin.email}:`, error);
        }
    }

    console.log('\n🎉 Admin creation complete!');
    console.log('\n📋 Summary:');
    console.log(`   - Total admins: ${admins.length}`);
    console.log(`   - Chairman: 1`);
    console.log(`   - Execom: ${admins.length - 1}`);
    console.log('\n🔐 Test login with:');
    console.log(`   Email: aadithyanrs9e@gmail.com`);
    console.log(`   Password: chair123`);
}

// Run the script
createAdminUsers()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
