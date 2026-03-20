#!/usr/bin/env node
// Seeds products and inventory from the frontend ES module source files.
// Usage: AWS_REGION=us-west-2 node lambda/seed/seed-products.mjs

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-west-2' });
const doc = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

const PREFIX = 'darksky-prod-';

async function batchPut(tableName, items) {
  const fullName = `${PREFIX}${tableName}`;
  const chunks = [];
  for (let i = 0; i < items.length; i += 25) chunks.push(items.slice(i, i + 25));
  for (const chunk of chunks) {
    await doc.send(new BatchWriteCommand({
      RequestItems: {
        [fullName]: chunk.map(item => ({ PutRequest: { Item: item } })),
      },
    }));
  }
  console.log(`  ✓ ${fullName}: ${items.length} items`);
}

// ── Load products.js ─────────────────────────────────────────────
// The products.js file exports a PRODUCTS array as ES module.
// We'll dynamically import it.
async function loadProducts() {
  const productsPath = resolve(__dirname, '../../../src/data/products.js');
  // Use dynamic import for ES module
  const mod = await import(productsPath);
  return mod.PRODUCTS || mod.default || [];
}

// ── Load mockData.js (inventory, orders, POs, transfers) ─────────
async function loadMockData() {
  const mockPath = resolve(__dirname, '../../../src/admin/data/mockData.js');
  const mod = await import(mockPath);
  return {
    inventory: mod.INVENTORY || [],
    orders: mod.ORDERS || [],
    purchaseOrders: mod.PURCHASE_ORDERS || [],
    transfers: mod.TRANSFERS || [],
  };
}

async function main() {
  console.log('\n🛒 Seeding Products & Inventory\n');

  try {
    const products = await loadProducts();
    // Add physical products
    const physicals = [
      { id: 'PHYS-001', title: 'Fountain Hills Star Map Poster', price: 2499, images: [], category: 'Gifts', tags: ['poster','star map','fountain hills'], description: 'A detailed star map of the night sky as seen from Fountain Hills, Arizona.', type: 'physical' },
      { id: 'PHYS-002', title: 'Dark Sky Discovery Center Enamel Pin', price: 1299, images: [], category: 'Gifts', tags: ['pin','enamel','souvenir'], description: 'Gold and navy enamel pin featuring the IDSDC telescope dome logo.', type: 'physical' },
      { id: 'PHYS-003', title: 'Night Sky Field Guide — Arizona Edition', price: 1899, images: [], category: 'Gifts', tags: ['book','field guide','arizona'], description: 'Pocket-sized guide to Arizona night sky objects and constellations.', type: 'physical' },
      { id: 'PHYS-004', title: 'Glow-in-the-Dark Constellation Stickers', price: 699, images: [], category: 'Kids', tags: ['stickers','glow','kids'], description: 'Set of 50 glow-in-the-dark star and constellation stickers.', type: 'physical' },
      { id: 'PHYS-005', title: 'PlaneWave CDK700 Telescope Model', price: 4999, images: [], category: 'Gifts', tags: ['model','telescope','collectible'], description: '1:50 scale die-cast model of the PlaneWave CDK700 telescope.', type: 'physical' },
      { id: 'PHYS-006', title: 'Desert Crystal Collection Box', price: 3499, images: [], category: 'Gifts', tags: ['crystals','desert','local'], description: 'Curated box of 6 Arizona desert minerals with ID cards.', type: 'physical' },
      { id: 'PHYS-007', title: 'Scorpion UV Flashlight', price: 1599, images: [], category: 'Gifts', tags: ['uv','flashlight','scorpion'], description: 'Professional UV flashlight for finding scorpions on night hikes.', type: 'physical' },
      { id: 'PHYS-008', title: 'Astronaut Ice Cream 3-Pack', price: 899, images: [], category: 'Kids', tags: ['ice cream','space','kids'], description: 'Freeze-dried ice cream in vanilla, chocolate, and strawberry.', type: 'physical' },
      { id: 'PHYS-009', title: 'Dark Sky Coffee — Midnight Roast', price: 1699, images: [], category: 'Gifts', tags: ['coffee','local','roast'], description: 'Small-batch dark roast coffee. 12oz whole bean bag.', type: 'physical' },
      { id: 'PHYS-010', title: 'Milky Way Photography Print — Signed', price: 8999, images: [], category: 'Gifts', tags: ['print','photography','signed'], description: 'Signed 16x20 print of the Milky Way over Fountain Hills.', type: 'physical' },
    ];
    const allProducts = [...products, ...physicals];
    await batchPut('products', allProducts);

    const mock = await loadMockData();
    await batchPut('inventory', mock.inventory);
    await batchPut('orders', mock.orders);
    await batchPut('purchase_orders', mock.purchaseOrders);
    await batchPut('transfers', mock.transfers);

    console.log('\n✅ Products & Inventory seed complete!\n');
  } catch (err) {
    console.error('❌ Failed:', err.message);
    console.log('\n💡 If ES module import fails, ensure products.js and mockData.js');
    console.log('   are importable. You may need to add "type": "module" to package.json');
    console.log('   or rename the source files.\n');
    process.exit(1);
  }
}

main();
