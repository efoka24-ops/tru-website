/**
 * Supabase Migration Script
 * Migre données JSON → Supabase PostgreSQL
 * 
 * Usage: node lib/supabase-migration.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Configuration Supabase
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Add SUPABASE_URL and SUPABASE_KEY to .env');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

/**
 * Lire les données JSON
 */
function readJSONData() {
  const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..');
  const DATA_FILE = path.join(DATA_DIR, 'data.json');
  
  if (!fs.existsSync(DATA_FILE)) {
    console.error(`❌ data.json not found at ${DATA_FILE}`);
    process.exit(1);
  }
  
  const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(rawData);
}

/**
 * Créer le backup avant migration
 */
function createBackup(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(__dirname, '..', `data-backup-${timestamp}.json`);
  
  fs.writeFileSync(backupPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ Backup créé: ${backupPath}`);
  return backupPath;
}

/**
 * Migrer Services
 */
async function migrateServices(services) {
  console.log('\n📦 Migration Services...');
  if (!services || !Array.isArray(services)) {
    console.log('⚠️ No services found');
    return 0;
  }

  let count = 0;
  let errors = 0;

  for (const service of services) {
    try {
      // Mapper les champs correctement (title → name, image → image_url)
      const serviceName = service.name || service.title || service.label;
      
      if (!serviceName) {
        console.error(`❌ Service skipped: missing name/title`, service);
        errors++;
        continue;
      }

      const { data, error } = await supabase
        .from('services')
        .upsert([{
          name: serviceName,
          description: service.description || null,
          icon: service.icon || null,
          features: service.features || null,
          objective: service.objective || null,
          color: service.color || null,
          image_url: service.image_url || service.imageUrl || service.image || null,
          ordering: service.ordering || service.id || count
        }], { onConflict: 'name' });

      if (error) {
        console.error(`❌ Error migrating service "${serviceName}":`, error.message);
        errors++;
      } else {
        count++;
      }
    } catch (err) {
      console.error(`❌ Exception for service:`, err.message);
      errors++;
    }
  }

  console.log(`✅ ${count} services migrés (${errors} erreurs)`);
  return count;
}

/**
 * Migrer Solutions
 */
async function migrateSolutions(solutions) {
  console.log('\n📦 Migration Solutions...');
  if (!solutions || !Array.isArray(solutions)) {
    console.log('⚠️ No solutions found');
    return 0;
  }

  let count = 0;
  let errors = 0;

  for (const solution of solutions) {
    try {
      const { data, error } = await supabase
        .from('solutions')
        .upsert([{
          name: solution.name,
          description: solution.description || null,
          target_audience: solution.target_audience || solution.targetAudience || null,
          features: solution.features || null,
          benefits: solution.benefits || null,
          pricing: solution.pricing || null,
          demo_url: solution.demo_url || solution.demoUrl || null,
          ordering: solution.ordering || count
        }], { onConflict: 'name' });

      if (error) {
        console.error(`❌ Error migrating solution "${solution.name}":`, error.message);
        errors++;
      } else {
        count++;
      }
    } catch (err) {
      console.error(`❌ Exception for solution "${solution.name}":`, err.message);
      errors++;
    }
  }

  console.log(`✅ ${count} solutions migrées (${errors} erreurs)`);
  return count;
}

/**
 * Migrer Team
 */
async function migrateTeam(team) {
  console.log('\n📦 Migration Team...');
  if (!team || !Array.isArray(team)) {
    console.log('⚠️ No team members found');
    return 0;
  }

  let count = 0;
  let errors = 0;

  for (const member of team) {
    try {
      // Mapper les champs correctement (title → role)
      const memberName = member.name || member.fullName;
      const memberEmail = member.email || `member${member.id}@trugroup.cm`;
      
      if (!memberName) {
        console.error(`❌ Team member skipped: missing name`, member);
        errors++;
        continue;
      }

      const { data, error } = await supabase
        .from('team')
        .upsert([{
          name: memberName,
          email: memberEmail,
          role: member.role || member.title || member.position || null,
          department: member.department || null,
          bio: member.bio || member.description || null,
          photo_url: member.photo_url || member.photoUrl || member.image || member.avatar || null,
          phone: member.phone || null,
          social_links: member.social_links || member.socialLinks || null,
          ordering: member.ordering || member.id || count
        }], { onConflict: 'email' });

      if (error) {
        console.error(`❌ Error migrating team member "${memberName}":`, error.message);
        errors++;
      } else {
        count++;
      }
    } catch (err) {
      console.error(`❌ Exception for team member:`, err.message);
      errors++;
    }
  }

  console.log(`✅ ${count} membres migrés (${errors} erreurs)`);
  return count;
}

/**
 * Migrer Contacts
 */
async function migrateContacts(contacts) {
  console.log('\n📦 Migration Contacts...');
  if (!contacts || !Array.isArray(contacts)) {
    console.log('⚠️ No contacts found');
    return 0;
  }

  let count = 0;
  let errors = 0;

  for (const contact of contacts) {
    try {
      // Mapper les champs correctement (fullName → name)
      const contactName = contact.name || contact.fullName || contact.firstName + ' ' + contact.lastName || 'Anonymous';
      const contactMessage = contact.message || contact.text || contact.subject || '';
      
      if (!contactName || !contactMessage) {
        console.error(`❌ Contact skipped: missing name or message`, contact);
        errors++;
        continue;
      }

      const { data, error } = await supabase
        .from('contacts')
        .insert([{
          name: contactName,
          email: contact.email || null,
          phone: contact.phone || null,
          message: contactMessage,
          status: contact.status || 'new',
          notes: contact.notes || contact.replyMessage || null
        }]);

      if (error) {
        console.error(`❌ Error migrating contact "${contactName}":`, error.message);
        errors++;
      } else {
        count++;
      }
    } catch (err) {
      console.error(`❌ Exception for contact:`, err.message);
      errors++;
    }
  }

  console.log(`✅ ${count} contacts migrés (${errors} erreurs)`);
  return count;
}

/**
 * Vérifier la migration
 */
async function verifyMigration() {
  console.log('\n🔍 Vérification de la migration...');
  
  try {
    const [servicesResult, solutionsResult, teamResult, contactsResult] = await Promise.all([
      supabase.from('services').select('count'),
      supabase.from('solutions').select('count'),
      supabase.from('team').select('count'),
      supabase.from('contacts').select('count')
    ]);

    console.log('📊 Résumé:');
    console.log(`   • Services: ${servicesResult.count || 0}`);
    console.log(`   • Solutions: ${solutionsResult.count || 0}`);
    console.log(`   • Team: ${teamResult.count || 0}`);
    console.log(`   • Contacts: ${contactsResult.count || 0}`);
  } catch (error) {
    console.error('❌ Vérification échouée:', error.message);
  }
}

/**
 * Fonction principale
 */
async function runMigration() {
  console.log('🚀 Démarrage Migration Supabase\n');
  console.log('========================================');

  try {
    // 1. Test de connexion
    console.log('🔗 Test connexion Supabase...');
    const { data, error } = await supabase.from('services').select('count').limit(1);
    if (error) {
      console.error('❌ Connexion échouée:', error.message);
      console.log('\n💡 Assurez-vous que:');
      console.log('1. Les tables sont créées dans Supabase');
      console.log('2. SUPABASE_URL et SUPABASE_KEY sont corrects');
      process.exit(1);
    }
    console.log('✅ Connexion réussie\n');

    // 2. Lire données JSON
    console.log('📂 Lecture data.json...');
    const jsonData = readJSONData();
    console.log(`✅ ${Object.keys(jsonData).length} collections trouvées`);

    // 3. Créer backup
    console.log('\n💾 Création backup...');
    const backupPath = createBackup(jsonData);

    // 4. Migrer les données
    const servicesCount = await migrateServices(jsonData.services);
    const solutionsCount = await migrateSolutions(jsonData.solutions);
    const teamCount = await migrateTeam(jsonData.team);
    const contactsCount = await migrateContacts(jsonData.contacts);

    // 5. Vérifier
    await verifyMigration();

    console.log('\n========================================');
    console.log('✅ Migration terminée avec succès!');
    console.log(`\n📊 Total migré:`);
    console.log(`   • ${servicesCount} services`);
    console.log(`   • ${solutionsCount} solutions`);
    console.log(`   • ${teamCount} membres`);
    console.log(`   • ${contactsCount} contacts`);
    console.log(`\n💾 Backup sauvegardé: ${backupPath}`);
    
    console.log('\n📝 Prochaines étapes:');
    console.log('1. Mettre à jour server.js pour utiliser Supabase');
    console.log('2. Tester les endpoints');
    console.log('3. Déployer sur Render');

  } catch (error) {
    console.error('\n❌ Migration échouée:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Exécuter la migration
runMigration();
