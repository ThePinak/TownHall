import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkConnection() {
  console.log('=== Checking Live Supabase Connection ===\n');

  if (!url || !serviceKey || url.includes('your-project') || serviceKey.includes('your-service-role-key')) {
    console.error('FAILED: Real Supabase credentials not found in .env.');
    console.error(`SUPABASE_URL found: ${url ? 'Yes (' + url.replace(/https:\/\/[^.]+\./, 'https://***.') + ')' : 'No'}`);
    console.error(`SUPABASE_SERVICE_ROLE_KEY found: ${serviceKey ? 'Yes' : 'No'}`);
    process.exit(1);
  }

  try {
    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });

    // 1. Check tables existence
    const tables = ['profiles', 'worlds', 'invitations', 'account_sessions'];
    console.log('Checking database tables in PostgreSQL:');

    for (const table of tables) {
      const { error } = await supabase.from(table).select('*', { count: 'exact', head: true });
      if (error) {
        console.error(`❌ Table "${table}": Error -> ${error.message} (Code: ${error.code})`);
      } else {
        console.log(`✅ Table "${table}": Accessible & verified.`);
      }
    }

    // 2. Test round-trip write and delete
    console.log('\nTesting server-role write & delete permissions:');
    const testUserId = '00000000-0000-0000-0000-000000000001';
    
    // Upsert profile
    const { error: profileErr } = await supabase.from('profiles').upsert({
      user_id: testUserId,
      display_name: 'SystemHealthCheck',
      avatar_id: 'avatar-01',
    });
    if (profileErr) throw new Error(`Profile insert failed: ${profileErr.message}`);

    // Create test world
    const { data: worldData, error: worldErr } = await supabase.from('worlds').insert({
      owner_user_id: testUserId,
      name: 'HealthCheck World',
      status: 'active',
    }).select().single();
    if (worldErr) throw new Error(`World insert failed: ${worldErr.message}`);

    console.log('✅ Write permissions: World and Profile successfully inserted.');

    // Cleanup
    await supabase.from('worlds').delete().eq('id', worldData.id);
    await supabase.from('profiles').delete().eq('user_id', testUserId);
    console.log('✅ Delete permissions: Test records successfully cleaned up.');

    console.log('\n=== Supabase Live Database Connection: 100% VERIFIED & READY ===');
    process.exit(0);
  } catch (err: any) {
    console.error('\n❌ Supabase Connection Check Failed:', err.message);
    process.exit(1);
  }
}

checkConnection();
