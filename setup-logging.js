#!/usr/bin/env node

/**
 * Setup script for creating log_entries table
 */

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

// Load environment variables from .env.development.local
config({ path: '.env.development.local' });

const sql = neon(process.env.DATABASE_URL);

async function setupLogTable() {
  console.log('🔧 Setting up log_entries table...\n');
  
  try {
    // Create log_entries table
    console.log('1. Creating log_entries table...');
    await sql`
      CREATE TABLE IF NOT EXISTS log_entries (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        time_logged TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        -- Basic kategorier
        category VARCHAR(50) NOT NULL CHECK (category IN ('school', 'wellbeing', 'behavior', 'breakthrough', 'setback', 'meeting', 'therapy', 'medication', 'other')),
        mood_level INTEGER CHECK (mood_level >= 1 AND mood_level <= 5),
        energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
        
        -- Skole-relateret
        school_attendance BOOLEAN,
        school_hours DECIMAL(3,1), -- Timer i skole
        school_activity TEXT, -- Hvilke aktiviteter/fag
        school_challenges TEXT,
        school_successes TEXT,
        
        -- Trivsel og adfærd
        anxiety_level INTEGER CHECK (anxiety_level >= 1 AND anxiety_level <= 5),
        social_interaction_quality INTEGER CHECK (social_interaction_quality >= 1 AND social_interaction_quality <= 5),
        focus_ability INTEGER CHECK (focus_ability >= 1 AND focus_ability <= 5),
        
        -- Fri tekst logging
        title VARCHAR(255) NOT NULL,
        description TEXT,
        notes TEXT,
        
        -- Metadata
        logged_by VARCHAR(100), -- Hvem der logger (forælder, lærer, etc.)
        tags TEXT[], -- Array af tags
        
        -- Triggers og indsatser
        triggers TEXT, -- Hvad udløste episoden
        interventions_used TEXT, -- Hvilke indsatser blev brugt
        effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✅ Table created successfully!');
    
    // Create indexes for better performance
    console.log('2. Creating indexes...');
    await sql`
      CREATE INDEX IF NOT EXISTS idx_log_entries_date ON log_entries(date);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_log_entries_category ON log_entries(category);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_log_entries_logged_by ON log_entries(logged_by);
    `;
    console.log('✅ Indexes created successfully!');
    
    // Add some sample data
    console.log('3. Adding sample log entries...');
    
    const sampleEntries = [
      {
        date: '2025-09-01',
        category: 'school',
        mood_level: 3,
        energy_level: 2,
        school_attendance: true,
        school_hours: 2.5,
        school_activity: 'Matematik og dansk',
        school_successes: 'Gennemførte matematikopgaven uden hjælp',
        school_challenges: 'Svært at koncentrere sig i dansk',
        anxiety_level: 4,
        focus_ability: 2,
        title: 'Første dag efter ferien',
        description: 'Lidt nervøs for at skulle tilbage, men gik bedre end forventet',
        notes: 'Husk at bruge pause-kort næste gang',
        logged_by: 'Forælder',
        triggers: 'Høj støj i klassen',
        interventions_used: 'Brug af noise-cancelling høretelefoner',
        effectiveness_rating: 4
      },
      {
        date: '2025-09-02',
        category: 'breakthrough',
        mood_level: 5,
        energy_level: 4,
        school_attendance: true,
        school_hours: 4.0,
        school_activity: 'Kreativ workshop',
        school_successes: 'Præsenterede sit projekt for hele klassen!',
        anxiety_level: 2,
        social_interaction_quality: 4,
        focus_ability: 5,
        title: 'Fantastisk gennembrud!',
        description: 'Første gang hun frivilligt præsenterede noget for klassen. Stor milepæl!',
        notes: 'Skal huske at rose og anerkende denne succes',
        logged_by: 'Lærer',
        interventions_used: 'Forberedt præsentation hjemmefra',
        effectiveness_rating: 5
      },
      {
        date: '2025-09-03',
        category: 'setback',
        mood_level: 2,
        energy_level: 1,
        school_attendance: false,
        anxiety_level: 5,
        focus_ability: 1,
        title: 'Svær morgen - kunne ikke komme af sted',
        description: 'Voldsom angst allerede ved tanken om skole. Blev hjemme.',
        notes: 'Ring til skolen og lav plan for i morgen. Måske kortere dag?',
        logged_by: 'Forælder',
        triggers: 'Dårlig søvn, bekymring for matematik-test',
        interventions_used: 'Åndedrætsøvelser, afslappende aktiviteter',
        effectiveness_rating: 2
      }
    ];
    
    for (const entry of sampleEntries) {
      try {
        await sql`
          INSERT INTO log_entries (
            date, category, mood_level, energy_level, school_attendance, school_hours,
            school_activity, school_challenges, school_successes, anxiety_level,
            social_interaction_quality, focus_ability, title, description, notes,
            logged_by, triggers, interventions_used, effectiveness_rating
          ) VALUES (
            ${entry.date}, ${entry.category}, ${entry.mood_level}, ${entry.energy_level},
            ${entry.school_attendance}, ${entry.school_hours}, ${entry.school_activity},
            ${entry.school_challenges}, ${entry.school_successes}, ${entry.anxiety_level},
            ${entry.social_interaction_quality}, ${entry.focus_ability}, ${entry.title},
            ${entry.description}, ${entry.notes}, ${entry.logged_by}, ${entry.triggers},
            ${entry.interventions_used}, ${entry.effectiveness_rating}
          )
        `;
        console.log(`✅ Added: ${entry.title}`);
      } catch (err) {
        console.log(`⚠️  Skipped: ${entry.title} (might already exist)`);
      }
    }
    
    // Show table info
    console.log('\n4. Table structure:');
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'log_entries' 
      ORDER BY ordinal_position
      LIMIT 10
    `;
    console.table(tableInfo);
    
    // Show recent entries
    console.log('5. Recent log entries:');
    const recentEntries = await sql`
      SELECT id, date, category, title, logged_by, created_at 
      FROM log_entries 
      ORDER BY created_at DESC 
      LIMIT 5
    `;
    console.table(recentEntries);
    
    console.log('\n🎉 Log system setup completed successfully!');
    console.log('💡 You can now use the web interface to add and view log entries.');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupLogTable();
