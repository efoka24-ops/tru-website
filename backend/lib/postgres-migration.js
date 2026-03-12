/**
 * PostgreSQL Migration Script
 * Convertit les données JSON → PostgreSQL
 * Usage: node lib/postgres-migration.js
 */

import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { readData } from '../dataManager.js';

// Configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/tru_group',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const DATABASE_SCHEMA = `
-- Services Table
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(255),
  features JSONB,
  objective TEXT,
  color VARCHAR(50),
  image_url TEXT,
  ordering INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Solutions Table
CREATE TABLE IF NOT EXISTS solutions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  target_audience TEXT,
  features JSONB,
  benefits JSONB,
  pricing TEXT,
  demo_url VARCHAR(255),
  service_id INT REFERENCES services(id),
  ordering INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Team Table
CREATE TABLE IF NOT EXISTS team (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  role VARCHAR(255),
  department VARCHAR(100),
  bio TEXT,
  photo_url TEXT,
  phone VARCHAR(20),
  social_links JSONB,
  ordering INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Contacts/Messages Table
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Backups Table (pour audit)
CREATE TABLE IF NOT EXISTS data_backups (
  id SERIAL PRIMARY KEY,
  backup_name VARCHAR(255),
  backup_data JSONB,
  record_count INT,
  backup_source VARCHAR(50) DEFAULT 'json',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_services_name ON services(name);
CREATE INDEX IF NOT EXISTS idx_solutions_service_id ON solutions(service_id);
CREATE INDEX IF NOT EXISTS idx_team_role ON team(role);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
`;

async function executeSchema() {
  console.log('🔨 Creating PostgreSQL schema...');
  try {
    await pool.query(DATABASE_SCHEMA);
    console.log('✅ Schema created successfully');
    return true;
  } catch (error) {
    console.error('❌ Schema creation failed:', error.message);
    return false;
  }
}

async function migrateServices(data) {
  console.log('\n📦 Migrating Services...');
  if (!data.services || !Array.isArray(data.services)) {
    console.log('⚠️ No services found');
    return;
  }

  let count = 0;
  for (const service of data.services) {
    try {
      await pool.query(
        `INSERT INTO services (name, description, icon, features, objective, color, image_url, ordering)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (name) DO UPDATE SET 
           description = $2, icon = $3, features = $4, 
           objective = $5, color = $6, image_url = $7, updated_at = NOW()`,
        [
          service.name,
          service.description || null,
          service.icon || null,
          service.features ? JSON.stringify(service.features) : null,
          service.objective || null,
          service.color || null,
          service.image_url || null,
          service.ordering || count
        ]
      );
      count++;
    } catch (err) {
      console.error(`❌ Error migrating service "${service.name}":`, err.message);
    }
  }
  console.log(`✅ ${count} services migrated`);
}

async function migrateSolutions(data) {
  console.log('\n📦 Migrating Solutions...');
  if (!data.solutions || !Array.isArray(data.solutions)) {
    console.log('⚠️ No solutions found');
    return;
  }

  let count = 0;
  for (const solution of data.solutions) {
    try {
      await pool.query(
        `INSERT INTO solutions (name, description, target_audience, features, benefits, pricing, demo_url, ordering)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (name) DO UPDATE SET
           description = $2, target_audience = $3, features = $4,
           benefits = $5, pricing = $6, demo_url = $7, updated_at = NOW()`,
        [
          solution.name,
          solution.description || null,
          solution.target_audience || null,
          solution.features ? JSON.stringify(solution.features) : null,
          solution.benefits ? JSON.stringify(solution.benefits) : null,
          solution.pricing || null,
          solution.demo_url || null,
          solution.ordering || count
        ]
      );
      count++;
    } catch (err) {
      console.error(`❌ Error migrating solution "${solution.name}":`, err.message);
    }
  }
  console.log(`✅ ${count} solutions migrated`);
}

async function migrateTeam(data) {
  console.log('\n📦 Migrating Team Members...');
  if (!data.team || !Array.isArray(data.team)) {
    console.log('⚠️ No team members found');
    return;
  }

  let count = 0;
  for (const member of data.team) {
    try {
      await pool.query(
        `INSERT INTO team (name, email, role, department, bio, photo_url, phone, social_links, ordering)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (email) DO UPDATE SET
           name = $1, role = $3, department = $4, bio = $5,
           photo_url = $6, phone = $7, social_links = $8, updated_at = NOW()`,
        [
          member.name,
          member.email || null,
          member.role || null,
          member.department || null,
          member.bio || null,
          member.photo_url || null,
          member.phone || null,
          member.social_links ? JSON.stringify(member.social_links) : null,
          member.ordering || count
        ]
      );
      count++;
    } catch (err) {
      console.error(`❌ Error migrating team member "${member.name}":`, err.message);
    }
  }
  console.log(`✅ ${count} team members migrated`);
}

async function migrateContacts(data) {
  console.log('\n📦 Migrating Contacts/Messages...');
  if (!data.contacts || !Array.isArray(data.contacts)) {
    console.log('⚠️ No contacts found');
    return;
  }

  let count = 0;
  for (const contact of data.contacts) {
    try {
      await pool.query(
        `INSERT INTO contacts (name, email, phone, message, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          contact.name,
          contact.email || null,
          contact.phone || null,
          contact.message || contact.text || '',
          contact.status || 'new'
        ]
      );
      count++;
    } catch (err) {
      console.error(`❌ Error migrating contact:`, err.message);
    }
  }
  console.log(`✅ ${count} contacts migrated`);
}

async function backupToJSON(data) {
  console.log('\n💾 Creating JSON backup...');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join('/tmp', `data-backup-${timestamp}.json`);
  
  try {
    fs.writeFileSync(backupPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✅ Backup saved to: ${backupPath}`);
    
    // Aussi sauvegarder dans PostgreSQL
    await pool.query(
      'INSERT INTO data_backups (backup_name, backup_data, record_count) VALUES ($1, $2, $3)',
      [
        `backup-${timestamp}`,
        JSON.stringify(data),
        (data.services?.length || 0) + (data.team?.length || 0) + (data.solutions?.length || 0)
      ]
    );
    console.log('✅ Backup also stored in PostgreSQL');
  } catch (err) {
    console.error('❌ Backup failed:', err.message);
  }
}

async function verifyMigration() {
  console.log('\n🔍 Verifying migration...');
  try {
    const results = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM services'),
      pool.query('SELECT COUNT(*) as count FROM solutions'),
      pool.query('SELECT COUNT(*) as count FROM team'),
      pool.query('SELECT COUNT(*) as count FROM contacts')
    ]);

    console.log('📊 Migration Summary:');
    console.log(`   • Services: ${results[0].rows[0].count}`);
    console.log(`   • Solutions: ${results[1].rows[0].count}`);
    console.log(`   • Team: ${results[2].rows[0].count}`);
    console.log(`   • Contacts: ${results[3].rows[0].count}`);
  } catch (err) {
    console.error('❌ Verification failed:', err.message);
  }
}

async function runMigration() {
  console.log('🚀 Starting PostgreSQL Migration\n');
  console.log('========================================');

  try {
    // 1. Test connection
    console.log('🔗 Testing database connection...');
    await pool.query('SELECT 1');
    console.log('✅ Connection successful\n');

    // 2. Create schema
    const schemaOk = await executeSchema();
    if (!schemaOk) {
      console.error('❌ Schema creation failed. Aborting.');
      process.exit(1);
    }

    // 3. Read JSON data
    console.log('\n📂 Reading JSON data...');
    const data = readData();
    console.log(`✅ JSON data loaded (${Object.keys(data).length} collections)`);

    // 4. Backup before migration
    await backupToJSON(data);

    // 5. Migrate data
    await migrateServices(data);
    await migrateSolutions(data);
    await migrateTeam(data);
    await migrateContacts(data);

    // 6. Verify
    await verifyMigration();

    console.log('\n========================================');
    console.log('✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Update server.js to use PostgreSQL');
    console.log('2. Update API routes to use db.query()');
    console.log('3. Test all endpoints');
    console.log('4. Deploy to production');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration
runMigration().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

export { executeSchema, migrateServices, migrateSolutions, migrateTeam, migrateContacts };
