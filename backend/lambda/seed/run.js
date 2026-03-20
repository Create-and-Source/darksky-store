#!/usr/bin/env node
// ── DynamoDB Seed Script ─────────────────────────────────────────
// Loads all mock/default data from the frontend into DynamoDB tables.
// Usage: AWS_REGION=us-west-2 node lambda/seed/run.js
//
// This mirrors the initStore() function from src/admin/data/store.js
// but writes to DynamoDB instead of localStorage.

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, BatchWriteCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-west-2' });
const doc = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

const PREFIX = 'darksky-prod-';
const t = (name) => `${PREFIX}${name}`;

// ── Batch writer (handles 25-item limit) ─────────────────────────
async function batchPut(tableName, items) {
  const fullName = t(tableName);
  const chunks = [];
  for (let i = 0; i < items.length; i += 25) {
    chunks.push(items.slice(i, i + 25));
  }
  for (const chunk of chunks) {
    await doc.send(new BatchWriteCommand({
      RequestItems: {
        [fullName]: chunk.map(item => ({ PutRequest: { Item: item } })),
      },
    }));
  }
  console.log(`  ✓ ${fullName}: ${items.length} items`);
}

async function putOne(tableName, item) {
  await doc.send(new PutCommand({ TableName: t(tableName), Item: item }));
  console.log(`  ✓ ${t(tableName)}: 1 item`);
}

async function isEmpty(tableName) {
  const { Items } = await doc.send(new ScanCommand({ TableName: t(tableName), Limit: 1 }));
  return !Items || Items.length === 0;
}

// ── Helpers ──────────────────────────────────────────────────────
const today = new Date();
const isoToday = today.toISOString().slice(0, 10);
const genId = (prefix) => `${prefix}-${String(Date.now()).slice(-6)}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
const dayOffset = (days) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

// ── Mock Data ────────────────────────────────────────────────────
// These mirror the DEFAULT_ constants from store.js

const DEFAULT_EVENTS = [
  { id: 'EVT-001', title: 'Night Sky Photography Workshop', date: dayOffset(7), time: '7:00 PM', endTime: '9:30 PM', location: 'Dark Sky Observatory', capacity: 25, ticketsSold: 18, price: 4500, status: 'Published', category: 'Workshop', description: 'Learn to capture stunning night sky photos with your DSLR or mirrorless camera.', image: '/images/darksky/milky-way.jpg' },
  { id: 'EVT-002', title: 'Planetarium Show: Journey to the Stars', date: dayOffset(3), time: '6:30 PM', endTime: '7:30 PM', location: 'Craig & Ruth Gimbel Planetarium', capacity: 65, ticketsSold: 52, price: 2000, status: 'Published', category: 'Show', description: 'Immersive planetarium show exploring the night sky visible from Fountain Hills.', image: '/images/darksky/nebula.jpg' },
  { id: 'EVT-003', title: 'Telescope Night: Deep Sky Objects', date: dayOffset(14), time: '8:00 PM', endTime: '10:00 PM', location: 'Dark Sky Observatory', capacity: 30, ticketsSold: 12, price: 3500, status: 'Published', category: 'Observation', description: 'View galaxies, nebulae, and star clusters through our PlaneWave CDK700 telescope.', image: '/images/darksky/andromeda.jpg' },
  { id: 'EVT-004', title: 'Kids Space Camp: Rocket Science', date: dayOffset(21), time: '10:00 AM', endTime: '2:00 PM', location: 'Einstein Exploration Station', capacity: 20, ticketsSold: 20, price: 5000, status: 'Published', category: 'Kids', description: 'Hands-on rocket building and launch for ages 8-12. Includes lunch.', image: '/images/darksky/comet-neowise.jpg' },
  { id: 'EVT-005', title: 'Desert Wildlife After Dark', date: dayOffset(10), time: '7:30 PM', endTime: '9:00 PM', location: 'Night Sky Exhibit Hall', capacity: 40, ticketsSold: 28, price: 2500, status: 'Published', category: 'Nature', description: 'UV-guided walk to discover nocturnal desert creatures — scorpions, owls, and more.', image: '/images/darksky/meteor-shower.jpg' },
  { id: 'EVT-006', title: 'Member Appreciation Night', date: dayOffset(28), time: '6:00 PM', endTime: '9:00 PM', location: 'Inspiration Theater', capacity: 150, ticketsSold: 45, price: 0, status: 'Draft', category: 'Social', description: 'Exclusive evening for members — guest speaker, observatory access, complimentary refreshments.', image: '/images/darksky/first-light-nebula.jpg' },
];

const DEFAULT_MEMBERS = [
  { id: 'MEM-001', name: 'Sarah Chen', email: 'sarah.chen@example.com', tier: 'Star Gazer', joinDate: '2024-09-15', status: 'active' },
  { id: 'MEM-002', name: 'Michael Torres', email: 'mtorres@example.com', tier: 'Constellation Circle', joinDate: '2024-10-01', status: 'active' },
  { id: 'MEM-003', name: 'Jennifer Patel', email: 'jpatel@example.com', tier: 'Cosmic Patron', joinDate: '2024-08-20', status: 'active' },
  { id: 'MEM-004', name: 'David Kim', email: 'dkim@example.com', tier: 'Star Gazer', joinDate: '2024-11-05', status: 'active' },
  { id: 'MEM-005', name: 'Lisa Nakamura', email: 'lnakamura@example.com', tier: 'Constellation Circle', joinDate: '2024-07-30', status: 'active' },
];

const DEFAULT_DONATIONS = [
  { id: 'DON-001', donor: 'Craig & Ruth Gimbel Foundation', email: 'foundation@gimbel.org', amount: 500000000, type: 'grant', campaign: 'Capital Campaign', date: '2024-01-15', status: 'received', acknowledged: true, notes: 'Planetarium naming rights' },
  { id: 'DON-002', donor: 'Arizona Community Foundation', email: 'grants@azfoundation.org', amount: 250000000, type: 'grant', campaign: 'Capital Campaign', date: '2024-03-01', status: 'received', acknowledged: true },
  { id: 'DON-003', donor: 'Robert & Maria Santos', email: 'rsantos@example.com', amount: 10000000, type: 'individual', campaign: 'Capital Campaign', date: '2024-06-15', status: 'received', acknowledged: true },
  { id: 'DON-004', donor: 'Fountain Hills Community Fund', email: 'info@fhcf.org', amount: 75000000, type: 'corporate', campaign: 'Capital Campaign', date: '2024-04-20', status: 'received', acknowledged: true },
  { id: 'DON-005', donor: 'Anonymous Donor', email: '', amount: 5000000, type: 'individual', campaign: 'Annual Fund', date: dayOffset(-30), status: 'received', acknowledged: false },
  { id: 'DON-006', donor: 'Jennifer Patel', email: 'jpatel@example.com', amount: 25000, type: 'individual', campaign: 'Annual Fund', date: dayOffset(-14), status: 'received', acknowledged: true },
  { id: 'DON-007', donor: 'Dark Sky Association', email: 'info@darksky.org', amount: 100000000, type: 'grant', campaign: 'Education Fund', date: '2024-08-01', status: 'pledged', acknowledged: true },
  { id: 'DON-008', donor: 'Scottsdale Rotary Club', email: 'rotary@scottsdale.org', amount: 5000000, type: 'corporate', campaign: 'Education Fund', date: dayOffset(-7), status: 'received', acknowledged: false },
];

const DEFAULT_FUNDRAISING = { id: 'main', goal: 2900000000, raised: 2720000000 };

const DEFAULT_ANNOUNCEMENT = { id: 'main', text: 'International Dark Sky Discovery Center · Opening Soon · Fountain Hills, AZ', active: true };

const DEFAULT_VOLUNTEERS = [
  { id: 'VOL-001', name: 'Tom Bradley', email: 'tbradley@example.com', phone: '(480) 555-0101', role: 'Observatory Guide', status: 'active', startDate: '2024-08-01', hoursLogged: 120, certifications: ['Telescope Operation', 'First Aid'], availability: ['Friday', 'Saturday'] },
  { id: 'VOL-002', name: 'Maria Gonzalez', email: 'mgonzalez@example.com', phone: '(480) 555-0102', role: 'Gift Shop', status: 'active', startDate: '2024-09-15', hoursLogged: 85, certifications: ['POS Training'], availability: ['Wednesday', 'Thursday', 'Sunday'] },
  { id: 'VOL-003', name: 'James Park', email: 'jpark@example.com', phone: '(480) 555-0103', role: 'Event Support', status: 'active', startDate: '2024-07-01', hoursLogged: 200, certifications: ['First Aid', 'Event Management'], availability: ['Friday', 'Saturday', 'Sunday'] },
  { id: 'VOL-004', name: 'Anne Sullivan', email: 'asullivan@example.com', phone: '(480) 555-0104', role: 'Education', status: 'active', startDate: '2024-10-01', hoursLogged: 45, certifications: ['Teaching Certificate'], availability: ['Saturday'] },
  { id: 'VOL-005', name: 'Robert Chen', email: 'rchen@example.com', phone: '(480) 555-0105', role: 'Planetarium', status: 'on_leave', startDate: '2024-06-01', hoursLogged: 150, certifications: ['Planetarium Operation', 'First Aid'], availability: [] },
  { id: 'VOL-006', name: 'Diana Reeves', email: 'dreeves@example.com', phone: '(480) 555-0106', role: 'Photography', status: 'active', startDate: '2024-11-01', hoursLogged: 30, certifications: ['Photography'], availability: ['Friday', 'Saturday'] },
];

const DEFAULT_STAFF = [
  { id: 'STF-001', name: 'Nancy Rivera', role: 'Gift Shop Manager', email: 'nancy@darkskycenter.org', phone: '(480) 555-1001', hourlyRate: 2800, status: 'active', startDate: '2024-06-01' },
  { id: 'STF-002', name: 'Tovah Feldshuh', role: 'Gift Shop Associate', email: 'tovah@darkskycenter.org', phone: '(480) 555-1002', hourlyRate: 1800, status: 'active', startDate: '2024-07-15' },
  { id: 'STF-003', name: 'Josie Martinez', role: 'Gift Shop Associate', email: 'josie@darkskycenter.org', phone: '(480) 555-1003', hourlyRate: 1700, status: 'active', startDate: '2024-08-01' },
  { id: 'STF-004', name: 'Patricia Wells', role: 'Finance Director', email: 'patricia@darkskycenter.org', phone: '(480) 555-1004', hourlyRate: 4500, status: 'active', startDate: '2024-05-01' },
  { id: 'STF-005', name: 'Derek Owens', role: 'Events Coordinator', email: 'derek@darkskycenter.org', phone: '(480) 555-1005', hourlyRate: 2500, status: 'active', startDate: '2024-09-01' },
  { id: 'STF-006', name: 'Maya Thompson', role: 'Education Director', email: 'maya@darkskycenter.org', phone: '(480) 555-1006', hourlyRate: 3500, status: 'active', startDate: '2024-04-15' },
  { id: 'STF-007', name: 'Carlos Ruiz', role: 'Facilities Manager', email: 'carlos@darkskycenter.org', phone: '(480) 555-1007', hourlyRate: 2600, status: 'active', startDate: '2024-06-15' },
];

const FACILITY_SPACES = [
  { name: 'Dark Sky Observatory', capacity: 30 },
  { name: 'Craig & Ruth Gimbel Planetarium', capacity: 65 },
  { name: 'Inspiration Theater', capacity: 150 },
  { name: 'Night Sky Exhibit Hall', capacity: 0 },
  { name: 'Einstein Exploration Station', capacity: 0 },
];

function generateFacilityBookings() {
  const bookings = [];
  const types = ['Public Event', 'Private Rental', 'School Group', 'Member Event', 'Staff Meeting'];
  let idx = 1;
  for (let d = -3; d <= 10; d++) {
    const date = dayOffset(d);
    const spaceIdx = (d + 3) % FACILITY_SPACES.length;
    bookings.push({
      id: `FB-${String(idx++).padStart(3, '0')}`,
      space: FACILITY_SPACES[spaceIdx].name,
      date,
      startTime: '18:00',
      endTime: '21:00',
      type: types[idx % types.length],
      title: `Booking ${idx}`,
      contact: DEFAULT_STAFF[idx % DEFAULT_STAFF.length].name,
      status: d < 0 ? 'completed' : 'confirmed',
      notes: '',
    });
  }
  return bookings;
}

function generateVisitors() {
  const days = [];
  for (let d = -30; d <= 0; d++) {
    const date = dayOffset(d);
    const base = 80 + Math.floor(Math.random() * 120);
    const dow = new Date(date).getDay();
    const weekend = dow === 0 || dow === 5 || dow === 6;
    const total = weekend ? base + 60 : base;
    days.push({
      date,
      total,
      members: Math.floor(total * 0.15),
      children: Math.floor(total * 0.25),
      groups: Math.floor(Math.random() * 4),
    });
  }
  return days;
}

function generateFieldTrips() {
  const schools = [
    'Fountain Hills Middle School', 'McDowell Mountain Elementary',
    'Scottsdale Prep Academy', 'Mesa Unified District',
    'Chandler STEM Academy', 'Phoenix Day School',
    'Gilbert Classical Academy', 'Tempe Elementary',
  ];
  return schools.map((school, i) => ({
    id: `FT-${String(i + 1).padStart(3, '0')}`,
    school,
    contact: `Teacher ${i + 1}`,
    email: `teacher${i + 1}@school.edu`,
    grade: `${4 + (i % 5)}th Grade`,
    students: 20 + (i * 3),
    date: dayOffset(7 + i * 7),
    program: ['Star Explorer', 'Cosmic Voyage', 'Desert Sky'][i % 3],
    status: i < 3 ? 'confirmed' : i < 6 ? 'pending' : 'inquiry',
    notes: '',
    createdAt: dayOffset(-(30 - i * 3)),
  }));
}

function generateMessages() {
  return [
    { id: 'MSG-001', from: 'Sarah Chen', email: 'sarah.chen@example.com', subject: 'Membership question', body: 'Can I upgrade my Star Gazer membership to Constellation Circle?', date: dayOffset(-2), read: false },
    { id: 'MSG-002', from: 'Tom Bradley', email: 'tbradley@example.com', subject: 'Volunteer schedule', body: 'I can cover an extra shift this Saturday evening.', date: dayOffset(-3), read: true },
    { id: 'MSG-003', from: 'Mesa Unified', email: 'fieldtrips@mesa.edu', subject: 'Field trip for 45 students', body: 'We\'d like to book a field trip for our 5th graders in March.', date: dayOffset(-1), read: false },
    { id: 'MSG-004', from: 'Jennifer Patel', email: 'jpatel@example.com', subject: 'Donation receipt', body: 'Could I get a tax receipt for my recent donation?', date: dayOffset(-5), read: true },
    { id: 'MSG-005', from: 'Scottsdale Magazine', email: 'editor@scottsdalemag.com', subject: 'Feature article', body: 'We\'d like to feature IDSDC in our spring issue.', date: dayOffset(-4), read: false },
  ];
}

// ── MAIN ─────────────────────────────────────────────────────────
async function seed() {
  console.log('\n🌌 Dark Sky Discovery Center — DynamoDB Seed\n');

  // Check if already seeded
  if (!(await isEmpty('events'))) {
    console.log('⚠️  Tables already contain data. Use --force to re-seed.');
    if (!process.argv.includes('--force')) return;
    console.log('  → Force mode: overwriting existing data\n');
  }

  // Events
  await batchPut('events', DEFAULT_EVENTS);

  // Members
  await batchPut('members', DEFAULT_MEMBERS);

  // Donations
  await batchPut('donations', DEFAULT_DONATIONS);

  // Fundraising
  await putOne('fundraising', DEFAULT_FUNDRAISING);

  // Announcement
  await putOne('announcement', DEFAULT_ANNOUNCEMENT);

  // Volunteers
  await batchPut('volunteers', DEFAULT_VOLUNTEERS);

  // Staff
  await batchPut('staff', DEFAULT_STAFF);

  // Facility Bookings
  await batchPut('facility_bookings', generateFacilityBookings());

  // Visitors
  await batchPut('visitors', generateVisitors());

  // Field Trips
  await batchPut('field_trips', generateFieldTrips());

  // Messages
  await batchPut('messages', generateMessages());

  // Content defaults
  await putOne('content', { page: 'home', heroTitle: 'Explore the Night Sky', heroSubtitle: 'International Dark Sky Discovery Center' });
  await putOne('content', { page: 'about', heroTitle: 'About the Center', heroSubtitle: 'Fountain Hills, Arizona' });

  // NOTE: Products and Inventory should be seeded separately since they come
  // from products.js (67 items) and mockData.js (36 items) which are ES modules.
  // Use: node --experimental-modules lambda/seed/seed-products.js
  console.log('\n  ℹ  Products & Inventory require a separate ESM seed script.');
  console.log('     Run: node lambda/seed/seed-products.mjs\n');

  console.log('✅ Seed complete!\n');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
