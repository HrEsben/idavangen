'use client';

import { useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  child_id?: number;
  child_name?: string;
}

interface LogEntry {
  date: string;
  category: string;
  mood_level?: number;
  energy_level?: number;
  school_attendance?: boolean;
  school_hours?: number;
  school_activity?: string;
  school_challenges?: string;
  school_successes?: string;
  anxiety_level?: number;
  social_interaction_quality?: number;
  focus_ability?: number;
  title: string;
  description?: string;
  notes?: string;
  logged_by?: string;
  tags?: string[];
  triggers?: string;
  interventions_used?: string;
  effectiveness_rating?: number;
}

interface LogEntryFormProps {
  user: User;
}

export default function LogEntryForm({ user }: LogEntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [logEntry, setLogEntry] = useState<LogEntry>({
    date: new Date().toISOString().split('T')[0],
    category: 'wellbeing',
    title: '',
    description: '',
    logged_by: user.name,
  });

  const categories = [
    { value: 'school', label: 'Skole', emoji: '🏫' },
    { value: 'wellbeing', label: 'Trivsel', emoji: '😊' },
    { value: 'behavior', label: 'Adfærd', emoji: '🎯' },
    { value: 'breakthrough', label: 'Gennembrud', emoji: '🎉' },
    { value: 'setback', label: 'Tilbageslag', emoji: '😔' },
    { value: 'meeting', label: 'Møde', emoji: '👥' },
    { value: 'therapy', label: 'Terapi/Behandling', emoji: '🔧' },
    { value: 'medication', label: 'Medicin', emoji: '💊' },
    { value: 'other', label: 'Andet', emoji: '📝' },
  ];

  const ratingLabels = {
    1: 'Meget dårlig',
    2: 'Dårlig', 
    3: 'Neutral',
    4: 'God',
    5: 'Meget god'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const entryWithChildId = {
        ...logEntry,
        child_id: user.child_id,
        logged_by: user.name
      };
      
      const response = await fetch('/api/log-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryWithChildId),
      });

      if (response.ok) {
        setMessage('Logindtastning gemt succesfuldt! 🎉');
        // Reset form
        setLogEntry({
          date: new Date().toISOString().split('T')[0],
          category: 'wellbeing',
          title: '',
          logged_by: user.name,
        });
      } else {
        const errorData = await response.json();
        setMessage(`Fejl: ${errorData.error}`);
      }
    } catch (error) {
      setMessage('Fejl ved gemning af logindtastning');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof LogEntry, value: any) => {
    setLogEntry(prev => ({ ...prev, [field]: value }));
  };

  const RatingInput = ({ 
    label, 
    field, 
    value 
  }: { 
    label: string; 
    field: keyof LogEntry; 
    value?: number;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => updateField(field, rating)}
            className={`w-10 h-10 rounded-full border-2 text-sm font-medium transition-colors ${
              value === rating
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'
            }`}
            title={ratingLabels[rating as keyof typeof ratingLabels]}
          >
            {rating}
          </button>
        ))}
      </div>
      {value && (
        <p className="text-xs text-gray-500">
          {ratingLabels[value as keyof typeof ratingLabels]}
        </p>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          📖 Ny Logindtastning
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grundlæggende info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dato *
              </label>
              <input
                type="date"
                value={logEntry.date}
                onChange={(e) => updateField('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori *
              </label>
              <select
                value={logEntry.category}
                onChange={(e) => updateField('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logget af
              </label>
              <select
                value={logEntry.logged_by}
                onChange={(e) => updateField('logged_by', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Forælder">👨‍👩‍👧 Forælder</option>
                <option value="Lærer">👩‍🏫 Lærer</option>
                <option value="Pædagog">👨‍🎓 Pædagog</option>
                <option value="Sagsbehandler">👨‍💼 Sagsbehandler</option>
                <option value="Psykolog">👩‍⚕️ Psykolog</option>
                <option value="Selv">👧 Eleven selv</option>
                <option value="Andet">👤 Andet</option>
              </select>
            </div>
          </div>

          {/* Titel og beskrivelse */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titel/Overskrift *
            </label>
            <input
              type="text"
              value={logEntry.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="F.eks. 'God dag i skolen' eller 'Svær morgen'"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Beskrivelse
            </label>
            <textarea
              value={logEntry.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Beskriv hvad der skete, hvordan dagen forløb, etc."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Humør og trivsel vurderinger */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">😊 Humør og Trivsel</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <RatingInput
                label="😊 Humør"
                field="mood_level"
                value={logEntry.mood_level}
              />
              <RatingInput
                label="⚡ Energiniveau"
                field="energy_level"
                value={logEntry.energy_level}
              />
              <RatingInput
                label="😰 Angst/Bekymring"
                field="anxiety_level"
                value={logEntry.anxiety_level}
              />
              <RatingInput
                label="🎯 Fokus/Koncentration"
                field="focus_ability"
                value={logEntry.focus_ability}
              />
            </div>
            
            <div className="mt-4">
              <RatingInput
                label="👫 Social interaktion"
                field="social_interaction_quality"
                value={logEntry.social_interaction_quality}
              />
            </div>
          </div>

          {/* Skole sektion */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🏫 Skole</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={logEntry.school_attendance || false}
                    onChange={(e) => updateField('school_attendance', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Var i skole i dag</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Antal timer i skole
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="8"
                  value={logEntry.school_hours || ''}
                  onChange={(e) => updateField('school_hours', parseFloat(e.target.value) || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aktiviteter/Fag
                </label>
                <input
                  type="text"
                  value={logEntry.school_activity || ''}
                  onChange={(e) => updateField('school_activity', e.target.value)}
                  placeholder="F.eks. matematik, dansk, frikvarter"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    🎉 Succesoplevelser
                  </label>
                  <textarea
                    value={logEntry.school_successes || ''}
                    onChange={(e) => updateField('school_successes', e.target.value)}
                    placeholder="Hvad gik godt?"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ⚠️ Udfordringer
                  </label>
                  <textarea
                    value={logEntry.school_challenges || ''}
                    onChange={(e) => updateField('school_challenges', e.target.value)}
                    placeholder="Hvad var svært?"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Triggers og indsatser */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 Triggers og Indsatser</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ⚡ Triggers/Udløsere
                </label>
                <textarea
                  value={logEntry.triggers || ''}
                  onChange={(e) => updateField('triggers', e.target.value)}
                  placeholder="Hvad udløste episoden/situationen?"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🛠️ Anvendte indsatser
                </label>
                <textarea
                  value={logEntry.interventions_used || ''}
                  onChange={(e) => updateField('interventions_used', e.target.value)}
                  placeholder="Hvilke teknikker/metoder blev brugt?"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {logEntry.interventions_used && (
              <div className="mt-4">
                <RatingInput
                  label="📊 Effektivitet af indsatser"
                  field="effectiveness_rating"
                  value={logEntry.effectiveness_rating}
                />
              </div>
            )}
          </div>

          {/* Noter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📝 Yderligere noter
            </label>
            <textarea
              value={logEntry.notes || ''}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Andre vigtige observationer, planer for næste dag, etc."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Submit knap */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setLogEntry({
                  date: new Date().toISOString().split('T')[0],
                  category: 'wellbeing',
                  title: '',
                  logged_by: 'Forælder',
                });
                setMessage('');
              }}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Nulstil
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting || !logEntry.title}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Gemmer...' : 'Gem Logindtastning'}
            </button>
          </div>

          {message && (
            <div className={`p-4 rounded-lg text-center ${
              message.includes('succesfuldt') 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
