'use client';

import { useState, useEffect } from 'react';
import { getUsersWithRoles, getChildren, grantPermissions, promoteToAdmin } from '../lib/user-roles';

interface BaseUser {
  id: number;
  name: string;
  email: string;
  role: string;
  child_id?: number;
  child_name?: string;
}

interface User extends BaseUser {
  is_active: boolean;
  created_at: string;
}

interface Child {
  id: number;
  name: string;
  birth_date: string;
  created_by: number;
  created_by_name: string;
  is_active: boolean;
  created_at: string;
}

interface UserRoleManagerProps {
  user: BaseUser;
}

export default function UserRoleManager({ user: currentUser }: UserRoleManagerProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [permissions, setPermissions] = useState({
    canRead: false,
    canWrite: false,
    canReadSensitive: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // For demo purposes, simulate current user as first admin user
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersResult, childrenResult] = await Promise.all([
        fetch('/api/users/roles').then(r => r.json()),
        fetch('/api/children').then(r => r.json())
      ]);

      if (usersResult.success) {
        setUsers(usersResult.data);
      }
      if (childrenResult.success) {
        setChildren(childrenResult.data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Fejl ved indlæsning af data' });
    }
    setLoading(false);
  };

  const handleGrantPermissions = async () => {
    if (!currentUser || !selectedUser || !selectedChild) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/users/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          granterId: currentUser.id,
          userId: selectedUser,
          childId: selectedChild,
          permissions
        })
      });

      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: 'Tilladelser tildelt succesfuldt!' });
        loadData();
      } else {
        setMessage({ type: 'error', text: result.error || 'Fejl ved tildeling af tilladelser' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Fejl ved tildeling af tilladelser' });
    }
    setLoading(false);
  };

  const handlePromoteToAdmin = async () => {
    if (!currentUser || !selectedUser || !selectedChild) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/users/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          granterId: currentUser.id,
          userId: selectedUser,
          childId: selectedChild
        })
      });

      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: 'Bruger forfremmet til administrator!' });
        loadData();
      } else {
        setMessage({ type: 'error', text: result.error || 'Fejl ved forfremmelse' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Fejl ved forfremmelse' });
    }
    setLoading(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'parent': return 'bg-blue-100 text-blue-800';
      case 'teacher': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Administrator';
      case 'parent': return 'Forælder';
      case 'teacher': return 'Lærer';
      default: return role;
    }
  };

  if (loading && users.length === 0) {
    return <div className="p-6">Indlæser brugeradministration...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Bruger- og Rolleadministration</h2>
        
        {message && (
          <div className={`mb-4 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {currentUser && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900">Logget ind som:</h3>
            <p className="text-blue-800">
              {currentUser.name} ({getRoleDisplayName(currentUser.role)})
              {currentUser.child_name && ` - Administrator for ${currentUser.child_name}`}
            </p>
          </div>
        )}

        {/* Users Overview */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alle Brugere</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Navn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rolle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Barn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.child_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Permission Management */}
        {currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin') && (
          <div className="space-y-6">
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tildel Tilladelser</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vælg Barn
                  </label>
                  <select
                    value={selectedChild || ''}
                    onChange={(e) => setSelectedChild(Number(e.target.value) || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Vælg barn...</option>
                    {children.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vælg Bruger
                  </label>
                  <select
                    value={selectedUser || ''}
                    onChange={(e) => setSelectedUser(Number(e.target.value) || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Vælg bruger...</option>
                    {users.filter(u => u.id !== currentUser.id).map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({getRoleDisplayName(user.role)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={permissions.canRead}
                    onChange={(e) => setPermissions(prev => ({ ...prev, canRead: e.target.checked }))}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Kan læse log entries</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={permissions.canWrite}
                    onChange={(e) => setPermissions(prev => ({ ...prev, canWrite: e.target.checked }))}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Kan skrive/redigere log entries</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={permissions.canReadSensitive}
                    onChange={(e) => setPermissions(prev => ({ ...prev, canReadSensitive: e.target.checked }))}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Kan læse følsomme oplysninger</span>
                </label>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleGrantPermissions}
                  disabled={!selectedUser || !selectedChild || loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Tildeler...' : 'Tildel Tilladelser'}
                </button>

                <button
                  onClick={handlePromoteToAdmin}
                  disabled={!selectedUser || !selectedChild || loading}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Forfremmer...' : 'Forfrem til Administrator'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Role Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rolleoversigt</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-900">Super Administrator</h4>
              <p className="text-sm text-purple-700 mt-1">
                Kan se alle børn og data, men ikke følsomme oplysninger. Systemadministration.
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-900">Administrator</h4>
              <p className="text-sm text-red-700 mt-1">
                Fuld adgang til eget barn. Kan tildele tilladelser og forfremmelser.
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900">Forælder</h4>
              <p className="text-sm text-blue-700 mt-1">
                Familiemedlem. Adgang som tildelt. Kan forfremmes til administrator.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900">Lærer</h4>
              <p className="text-sm text-green-700 mt-1">
                Skolemedarbejder. Adgang som tildelt. Fokus på uddannelsesmæssige aspekter.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
