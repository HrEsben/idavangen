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

interface Stats {
  category: string;
  count: number;
  avg_mood?: number;
  avg_energy?: number;
  avg_anxiety?: number;
  school_days: number;
  avg_school_hours?: number;
}

interface LogDashboardProps {
  user: User;
}

export default function LogDashboard({ user }: LogDashboardProps) {
  const [stats, setStats] = useState<Stats[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/log-entries/stats?days=${days}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [days]);

  const getCategoryData = (category: string) => {
    const categoryMap: { [key: string]: { emoji: string; label: string; color: string } } = {
      school: { emoji: '🏫', label: 'Skole', color: 'bg-blue-100 border-blue-200' },
      wellbeing: { emoji: '😊', label: 'Trivsel', color: 'bg-green-100 border-green-200' },
      behavior: { emoji: '🎯', label: 'Adfærd', color: 'bg-purple-100 border-purple-200' },
      breakthrough: { emoji: '🎉', label: 'Gennembrud', color: 'bg-yellow-100 border-yellow-200' },
      setback: { emoji: '😔', label: 'Tilbageslag', color: 'bg-red-100 border-red-200' },
      meeting: { emoji: '👥', label: 'Møder', color: 'bg-indigo-100 border-indigo-200' },
      therapy: { emoji: '🔧', label: 'Terapi', color: 'bg-teal-100 border-teal-200' },
      medication: { emoji: '💊', label: 'Medicin', color: 'bg-pink-100 border-pink-200' },
      other: { emoji: '📝', label: 'Andet', color: 'bg-gray-100 border-gray-200' },
    };
    return categoryMap[category] || { emoji: '📝', label: 'Ukendt', color: 'bg-gray-100 border-gray-200' };
  };

  const getRatingColor = (rating?: number) => {
    if (!rating) return 'text-gray-400';
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingEmoji = (rating?: number) => {
    if (!rating) return '';
    const emojis = { 1: '😟', 2: '😕', 3: '😐', 4: '😊', 5: '😄' };
    return emojis[Math.round(rating) as keyof typeof emojis] || '';
  };

  // Calculate totals
  const totalEntries = stats.reduce((sum, stat) => sum + stat.count, 0);
  const totalSchoolDays = stats.reduce((sum, stat) => sum + stat.school_days, 0);
  const avgMoodOverall = stats.reduce((sum, stat) => sum + (stat.avg_mood || 0) * stat.count, 0) / totalEntries || 0;
  const avgEnergyOverall = stats.reduce((sum, stat) => sum + (stat.avg_energy || 0) * stat.count, 0) / totalEntries || 0;
  const avgAnxietyOverall = stats.reduce((sum, stat) => sum + (stat.avg_anxiety || 0) * stat.count, 0) / totalEntries || 0;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Indlæser statistikker...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            📊 Oversigt
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tidsperiode
            </label>
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={7}>Sidste 7 dage</option>
              <option value={14}>Sidste 14 dage</option>
              <option value={30}>Sidste 30 dage</option>
              <option value={60}>Sidste 2 måneder</option>
              <option value={90}>Sidste 3 måneder</option>
            </select>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{totalEntries}</div>
            <div className="text-sm text-blue-800">Samlede logindtastninger</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">{totalSchoolDays}</div>
            <div className="text-sm text-green-800">Skoledage</div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className={`text-2xl font-bold flex items-center ${getRatingColor(avgMoodOverall)}`}>
              {avgMoodOverall.toFixed(1)} {getRatingEmoji(avgMoodOverall)}
            </div>
            <div className="text-sm text-yellow-800">Gennemsnitligt humør</div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className={`text-2xl font-bold flex items-center ${getRatingColor(avgEnergyOverall)}`}>
              {avgEnergyOverall.toFixed(1)} {getRatingEmoji(avgEnergyOverall)}
            </div>
            <div className="text-sm text-purple-800">Gennemsnitlig energi</div>
          </div>
        </div>
      </div>

      {/* Category Stats */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">📈 Kategorier i de sidste {days} dage</h3>
        
        {stats.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Ingen data for den valgte periode</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat) => {
              const categoryData = getCategoryData(stat.category);
              return (
                <div key={stat.category} className={`p-4 rounded-lg border ${categoryData.color}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      <span className="text-2xl mr-2">{categoryData.emoji}</span>
                      {categoryData.label}
                    </h4>
                    <span className="bg-white px-2 py-1 rounded-full text-sm font-medium">
                      {stat.count} {stat.count === 1 ? 'indtastning' : 'indtastninger'}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    {stat.avg_mood && (
                      <div className="flex justify-between">
                        <span>😊 Gennemsnit humør:</span>
                        <span className={`font-medium ${getRatingColor(stat.avg_mood)}`}>
                          {stat.avg_mood.toFixed(1)}/5 {getRatingEmoji(stat.avg_mood)}
                        </span>
                      </div>
                    )}
                    
                    {stat.avg_energy && (
                      <div className="flex justify-between">
                        <span>⚡ Gennemsnit energi:</span>
                        <span className={`font-medium ${getRatingColor(stat.avg_energy)}`}>
                          {stat.avg_energy.toFixed(1)}/5 {getRatingEmoji(stat.avg_energy)}
                        </span>
                      </div>
                    )}
                    
                    {stat.avg_anxiety && (
                      <div className="flex justify-between">
                        <span>😰 Gennemsnit angst:</span>
                        <span className={`font-medium ${getRatingColor(6 - stat.avg_anxiety)}`}>
                          {stat.avg_anxiety.toFixed(1)}/5 {getRatingEmoji(6 - stat.avg_anxiety)}
                        </span>
                      </div>
                    )}
                    
                    {stat.school_days > 0 && (
                      <div className="flex justify-between">
                        <span>🏫 Skoledage:</span>
                        <span className="font-medium text-green-600">
                          {stat.school_days}
                        </span>
                      </div>
                    )}
                    
                    {stat.avg_school_hours && (
                      <div className="flex justify-between">
                        <span>⏰ Gennemsnit timer:</span>
                        <span className="font-medium text-blue-600">
                          {stat.avg_school_hours.toFixed(1)}t
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">💡 Indsigter</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Positive trends */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">🎉 Positive tendenser</h4>
            <ul className="text-sm text-green-700 space-y-1">
              {avgMoodOverall >= 3.5 && (
                <li>• Generelt godt humør (gennemsnit {avgMoodOverall.toFixed(1)}/5)</li>
              )}
              {avgEnergyOverall >= 3.5 && (
                <li>• Højt energiniveau (gennemsnit {avgEnergyOverall.toFixed(1)}/5)</li>
              )}
              {totalSchoolDays > 0 && (
                <li>• {totalSchoolDays} skoledage registreret</li>
              )}
              {stats.find(s => s.category === 'breakthrough')?.count && (
                <li>• {stats.find(s => s.category === 'breakthrough')?.count} gennembrud registreret</li>
              )}
            </ul>
          </div>

          {/* Areas for attention */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Opmærksomheds-områder</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              {avgMoodOverall < 3 && (
                <li>• Lavt humør gennemsnit ({avgMoodOverall.toFixed(1)}/5)</li>
              )}
              {avgAnxietyOverall > 3.5 && (
                <li>• Højt angst niveau (gennemsnit {avgAnxietyOverall.toFixed(1)}/5)</li>
              )}
              {totalSchoolDays === 0 && (
                <li>• Ingen skoledage registreret</li>
              )}
              {stats.find(s => s.category === 'setback')?.count && (
                <li>• {stats.find(s => s.category === 'setback')?.count} tilbageslag registreret</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
