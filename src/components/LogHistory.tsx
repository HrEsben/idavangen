'use client';

import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  child_id?: number;
  child_name?: string;
}

interface LogEntry {
  id: number;
  date: string;
  time_logged: string;
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

interface LogHistoryProps {
  user: User;
}

export default function LogHistory({ user }: LogHistoryProps) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    category: '',
    days: '30'
  });

  const categories = [
    { value: '', label: 'Alle kategorier' },
    { value: 'school', label: '🏫 Skole' },
    { value: 'wellbeing', label: '😊 Trivsel' },
    { value: 'behavior', label: '🎯 Adfærd' },
    { value: 'breakthrough', label: '🎉 Gennembrud' },
    { value: 'setback', label: '😔 Tilbageslag' },
    { value: 'meeting', label: '👥 Møde' },
    { value: 'therapy', label: '🔧 Terapi/Behandling' },
    { value: 'medication', label: '💊 Medicin' },
    { value: 'other', label: '📝 Andet' },
  ];

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filter.category) {
        params.append('category', filter.category);
      }
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(filter.days));
      
      params.append('startDate', startDate.toISOString().split('T')[0]);
      params.append('endDate', endDate.toISOString().split('T')[0]);

      const response = await fetch(`/api/log-entries?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      } else {
        console.error('Failed to fetch entries');
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [filter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('da-DK', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('da-DK', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRatingEmoji = (rating?: number) => {
    if (!rating) return '';
    const emojis = { 1: '😟', 2: '😕', 3: '😐', 4: '😊', 5: '😄' };
    return emojis[rating as keyof typeof emojis] || '';
  };

  const getCategoryData = (category: string) => {
    const categoryMap: { [key: string]: { emoji: string; color: string } } = {
      school: { emoji: '🏫', color: 'bg-blue-100 text-blue-800' },
      wellbeing: { emoji: '😊', color: 'bg-green-100 text-green-800' },
      behavior: { emoji: '🎯', color: 'bg-purple-100 text-purple-800' },
      breakthrough: { emoji: '🎉', color: 'bg-yellow-100 text-yellow-800' },
      setback: { emoji: '😔', color: 'bg-red-100 text-red-800' },
      meeting: { emoji: '👥', color: 'bg-indigo-100 text-indigo-800' },
      therapy: { emoji: '🔧', color: 'bg-teal-100 text-teal-800' },
      medication: { emoji: '💊', color: 'bg-pink-100 text-pink-800' },
      other: { emoji: '📝', color: 'bg-gray-100 text-gray-800' },
    };
    return categoryMap[category] || { emoji: '📝', color: 'bg-gray-100 text-gray-800' };
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Indlæser logindtastninger...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          📚 Loghistorik
        </h2>

        {/* Filtre */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Filtre</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
              </label>
              <select
                value={filter.category}
                onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tidsperiode
              </label>
              <select
                value={filter.days}
                onChange={(e) => setFilter(prev => ({ ...prev, days: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7">Sidste 7 dage</option>
                <option value="14">Sidste 14 dage</option>
                <option value="30">Sidste 30 dage</option>
                <option value="60">Sidste 2 måneder</option>
                <option value="90">Sidste 3 måneder</option>
              </select>
            </div>
          </div>
        </div>

        {/* Antal resultater */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Viser {entries.length} logindtastninger
          </p>
        </div>

        {/* Log entries */}
        <div className="space-y-4">
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Ingen logindtastninger fundet</p>
              <p className="text-gray-400">Prøv at justere filtrene eller tilføj nye logindtastninger</p>
            </div>
          ) : (
            entries.map((entry) => {
              const categoryData = getCategoryData(entry.category);
              return (
                <div key={entry.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryData.color}`}>
                        {categoryData.emoji} {entry.category}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900">{entry.title}</h3>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div>{formatDate(entry.date)}</div>
                      <div>Logget {formatTime(entry.time_logged)} af {entry.logged_by}</div>
                    </div>
                  </div>

                  {/* Beskrivelse */}
                  {entry.description && (
                    <p className="text-gray-700 mb-3">{entry.description}</p>
                  )}

                  {/* Ratings grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-3">
                    {entry.mood_level && (
                      <div className="bg-blue-50 px-2 py-1 rounded text-xs">
                        😊 Humør: {entry.mood_level}/5 {getRatingEmoji(entry.mood_level)}
                      </div>
                    )}
                    {entry.energy_level && (
                      <div className="bg-yellow-50 px-2 py-1 rounded text-xs">
                        ⚡ Energi: {entry.energy_level}/5 {getRatingEmoji(entry.energy_level)}
                      </div>
                    )}
                    {entry.anxiety_level && (
                      <div className="bg-red-50 px-2 py-1 rounded text-xs">
                        😰 Angst: {entry.anxiety_level}/5 {getRatingEmoji(6 - entry.anxiety_level)}
                      </div>
                    )}
                    {entry.focus_ability && (
                      <div className="bg-purple-50 px-2 py-1 rounded text-xs">
                        🎯 Fokus: {entry.focus_ability}/5 {getRatingEmoji(entry.focus_ability)}
                      </div>
                    )}
                    {entry.social_interaction_quality && (
                      <div className="bg-green-50 px-2 py-1 rounded text-xs">
                        👫 Social: {entry.social_interaction_quality}/5 {getRatingEmoji(entry.social_interaction_quality)}
                      </div>
                    )}
                    {entry.school_attendance && (
                      <div className="bg-green-100 px-2 py-1 rounded text-xs">
                        🏫 I skole {entry.school_hours && `(${entry.school_hours}t)`}
                      </div>
                    )}
                  </div>

                  {/* Skole info */}
                  {(entry.school_activity || entry.school_successes || entry.school_challenges) && (
                    <div className="bg-green-50 p-3 rounded-lg mb-3">
                      <h4 className="font-medium text-green-800 mb-2">🏫 Skole</h4>
                      {entry.school_activity && (
                        <p className="text-sm text-green-700 mb-1">
                          <strong>Aktiviteter:</strong> {entry.school_activity}
                        </p>
                      )}
                      {entry.school_successes && (
                        <p className="text-sm text-green-700 mb-1">
                          <strong>🎉 Succeser:</strong> {entry.school_successes}
                        </p>
                      )}
                      {entry.school_challenges && (
                        <p className="text-sm text-green-700">
                          <strong>⚠️ Udfordringer:</strong> {entry.school_challenges}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Triggers og indsatser */}
                  {(entry.triggers || entry.interventions_used) && (
                    <div className="bg-yellow-50 p-3 rounded-lg mb-3">
                      <h4 className="font-medium text-yellow-800 mb-2">🔧 Triggers & Indsatser</h4>
                      {entry.triggers && (
                        <p className="text-sm text-yellow-700 mb-1">
                          <strong>⚡ Triggers:</strong> {entry.triggers}
                        </p>
                      )}
                      {entry.interventions_used && (
                        <p className="text-sm text-yellow-700 mb-1">
                          <strong>🛠️ Indsatser:</strong> {entry.interventions_used}
                          {entry.effectiveness_rating && (
                            <span className="ml-2">
                              (Effektivitet: {entry.effectiveness_rating}/5 {getRatingEmoji(entry.effectiveness_rating)})
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Noter */}
                  {entry.notes && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">📝 Noter</h4>
                      <p className="text-sm text-gray-700">{entry.notes}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Reload button */}
        <div className="mt-6 text-center">
          <button
            onClick={fetchEntries}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Opdater
          </button>
        </div>
      </div>
    </div>
  );
}
