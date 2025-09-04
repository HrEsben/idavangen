import { neon } from '@neondatabase/serverless';

// Use a dummy URL for build time if DATABASE_URL is not set
const databaseUrl = process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy';
const sql = neon(databaseUrl);

export interface LogEntry {
  id: number;
  date: string;
  time_logged: string;
  category: string;
  title?: string;
  description?: string;
  mood_level?: number;
  energy_level?: number;
  anxiety_level?: number;
  motivation_level?: number;
  school_attendance?: boolean;
  school_hours?: number;
  school_activity?: string;
  school_challenges?: string;
  home_situation?: string;
  triggers?: string;
  interventions?: string;
  intervention_effectiveness?: number;
  sensory_notes?: string;
  communication_notes?: string;
  progress_notes?: string;
  logged_by: string;
  weather?: string;
  sleep_hours?: number;
  medication_taken?: boolean;
  child_id?: number;
  is_sensitive?: boolean;
  created_at: Date;
}

export async function createLogEntriesTable() {
  if (!process.env.DATABASE_URL) {
    return { success: false, error: 'No database connection configured' };
  }
  
  try {
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
    
    // Create index for better performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_log_entries_date ON log_entries(date);
      CREATE INDEX IF NOT EXISTS idx_log_entries_category ON log_entries(category);
      CREATE INDEX IF NOT EXISTS idx_log_entries_logged_by ON log_entries(logged_by);
    `;
    
    return { success: true };
  } catch (error) {
    console.error('Error creating log_entries table:', error);
    return { success: false, error };
  }
}

// Create a new log entry
export async function createLogEntry(entry: Omit<LogEntry, 'id' | 'created_at'> & { child_id: number; is_sensitive?: boolean }) {
  if (!process.env.DATABASE_URL) {
    return { success: false, error: 'Ingen database forbindelse konfigureret' };
  }
  
  try {
    const result = await sql`
      INSERT INTO log_entries (
        date, time_logged, category, title, description, 
        mood_level, energy_level, anxiety_level, motivation_level,
        school_attendance, school_hours, school_activity, school_challenges,
        home_situation, triggers, interventions, intervention_effectiveness,
        sensory_notes, communication_notes, progress_notes,
        logged_by, weather, sleep_hours, medication_taken,
        child_id, is_sensitive
      ) VALUES (
        ${entry.date}, ${entry.time_logged || new Date().toISOString()}, ${entry.category}, 
        ${entry.title}, ${entry.description}, ${entry.mood_level}, ${entry.energy_level}, 
        ${entry.anxiety_level}, ${entry.motivation_level}, ${entry.school_attendance}, 
        ${entry.school_hours}, ${entry.school_activity}, ${entry.school_challenges},
        ${entry.home_situation}, ${entry.triggers}, ${entry.interventions}, 
        ${entry.intervention_effectiveness}, ${entry.sensory_notes}, 
        ${entry.communication_notes}, ${entry.progress_notes}, ${entry.logged_by},
        ${entry.weather}, ${entry.sleep_hours}, ${entry.medication_taken},
        ${entry.child_id}, ${entry.is_sensitive || false}
      ) RETURNING *
    `;
    return { success: true, data: result[0] };
  } catch (error) {
    console.error('Fejl ved oprettelse af log entry:', error);
    return { success: false, error: 'Kunne ikke oprette log entry' };
  }
}

export async function getLogEntries(filters: any = {}) {
  if (!process.env.DATABASE_URL) {
    return { success: false, error: 'No database connection configured' };
  }
  
  try {
    // Build dynamic query - simplified for Neon
    if (filters.category && filters.startDate && filters.endDate) {
      const result = await sql`
        SELECT * FROM log_entries 
        WHERE category = ${filters.category} 
        AND date >= ${filters.startDate} 
        AND date <= ${filters.endDate}
        ORDER BY date DESC, time_logged DESC 
        LIMIT 50
      `;
      return { success: true, data: result };
    } else if (filters.startDate && filters.endDate) {
      const result = await sql`
        SELECT * FROM log_entries 
        WHERE date >= ${filters.startDate} 
        AND date <= ${filters.endDate}
        ORDER BY date DESC, time_logged DESC 
        LIMIT 50
      `;
      return { success: true, data: result };
    } else if (filters.category) {
      const result = await sql`
        SELECT * FROM log_entries 
        WHERE category = ${filters.category}
        ORDER BY date DESC, time_logged DESC 
        LIMIT 50
      `;
      return { success: true, data: result };
    } else {
      const result = await sql`
        SELECT * FROM log_entries 
        ORDER BY date DESC, time_logged DESC 
        LIMIT 50
      `;
      return { success: true, data: result };
    }
  } catch (error) {
    console.error('Error fetching log entries:', error);
    return { success: false, error };
  }
}

export async function getLogEntriesStats(days: number = 30) {
  if (!process.env.DATABASE_URL) {
    return { success: false, error: 'No database connection configured' };
  }
  
  try {
    const result = await sql`
      SELECT 
        category,
        COUNT(*) as count,
        ROUND(AVG(mood_level), 1) as avg_mood,
        ROUND(AVG(energy_level), 1) as avg_energy,
        ROUND(AVG(anxiety_level), 1) as avg_anxiety,
        SUM(CASE WHEN school_attendance THEN 1 ELSE 0 END) as school_days,
        ROUND(AVG(school_hours), 1) as avg_school_hours
      FROM log_entries 
      WHERE date >= CURRENT_DATE - INTERVAL '1 day' * ${days}
      GROUP BY category
      ORDER BY count DESC
    `;
    
    // Convert numeric strings to actual numbers
    const processedResult = result.map(row => ({
      ...row,
      count: parseInt(row.count) || 0,
      avg_mood: row.avg_mood ? parseFloat(row.avg_mood) : null,
      avg_energy: row.avg_energy ? parseFloat(row.avg_energy) : null,
      avg_anxiety: row.avg_anxiety ? parseFloat(row.avg_anxiety) : null,
      school_days: parseInt(row.school_days) || 0,
      avg_school_hours: row.avg_school_hours ? parseFloat(row.avg_school_hours) : null
    }));
    
    return { success: true, data: processedResult };
  } catch (error) {
    console.error('Error fetching log stats:', error);
    return { success: false, error };
  }
}
