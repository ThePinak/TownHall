import { Client } from 'colyseus.js';

const SERVER_URL = 'ws://localhost:2567';

async function verifyCapacity() {
  console.log('=== Verifying 20-User Hard Capacity & 21st-User Rejection ===\n');
  const clients: Client[] = [];
  const rooms: any[] = [];

  try {
    // 1. First client connects to target world_room
    const host = new Client(SERVER_URL);
    const hostRoom = await host.joinOrCreate('world_room', {
      displayName: 'CapTester-01',
      avatarId: 'avatar-01',
    });
    clients.push(host);
    rooms.push(hostRoom);
    const targetRoomId = hostRoom.id;

    // Wait a moment for state hydration
    await new Promise((r) => setTimeout(r, 200));
    const initialOccupants = (hostRoom.state as any).players.size;
    console.log(`Connected to room: "${targetRoomId}"`);
    console.log(`Initial room occupancy (including any open browser tabs): ${initialOccupants}/20\n`);

    const slotsAvailable = 20 - initialOccupants;
    console.log(`Filling the remaining ${slotsAvailable} available slot(s) up to exactly 20...\n`);

    for (let i = 1; i <= slotsAvailable; i++) {
      const client = new Client(SERVER_URL);
      const room = await client.joinById(targetRoomId, {
        displayName: `CapTester-${String(i + 1).padStart(2, '0')}`,
        avatarId: 'avatar-01',
      });
      clients.push(client);
      rooms.push(room);
      console.log(`[Joined] CapTester-${String(i + 1).padStart(2, '0')} joined -> Room occupancy: ${initialOccupants + i}/20`);
    }

    await new Promise((r) => setTimeout(r, 200));
    console.log(`\n============================================================`);
    console.log(`STATUS: Room "${targetRoomId}" has reached MAX CAPACITY (20/20 users)!`);
    console.log(`============================================================\n`);

    console.log(`--> Now attempting to connect the 21st user ("Overflow-User")...\n`);

    const client21 = new Client(SERVER_URL);
    try {
      await client21.joinById(targetRoomId, {
        displayName: 'Overflow-User',
        avatarId: 'avatar-02',
      });
      console.error('FAIL: 21st client was unexpectedly accepted!');
      process.exit(1);
    } catch (err: any) {
      console.log(`>>> [SERVER REJECTION CONFIRMED] <<<`);
      console.log(`Error returned: "${err.message}" (Code: ${err.code})`);
      console.log(`The 21st user was blocked from entering the full world.\n`);
    }

    console.log(`--> Now testing capacity recovery: 1 user leaves...`);
    const leaver = rooms.pop();
    await leaver.leave();
    await new Promise((r) => setTimeout(r, 300));
    console.log(`Occupancy after departure: ${(hostRoom.state as any).players.size}/20 (1 slot freed)`);

    console.log(`--> Retrying the previously rejected user now that a slot is free...`);
    const accepted21 = await client21.joinById(targetRoomId, {
      displayName: 'Overflow-User-Retry',
      avatarId: 'avatar-02',
    });
    rooms.push(accepted21);
    console.log(`SUCCESS: Overflow-User joined successfully! Occupancy: ${(hostRoom.state as any).players.size}/20\n`);

    console.log(`=== Invariant Verified: Strict 20-User Cap & Immediate 21st Rejection ===`);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    console.log('\nCleaning up automated test connections...');
    await Promise.all(rooms.map((r) => r.leave().catch(() => {})));
    process.exit(0);
  }
}

verifyCapacity();
