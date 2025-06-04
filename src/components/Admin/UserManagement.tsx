/**
 * User Management Component
 * Admin interface for managing users and their progress
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2,
  ArrowLeft,
  UserCheck,
  UserX,
  Calendar,
  TrendingUp,
  Award
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  display_name: string;
  user_type: string;
  subscription_tier: string;
  created_at: string;
  last_session_at: string | null;
  total_sessions: number;
  total_points: number;
  active_tube: number;
  is_active: boolean;
}

interface UserManagementProps {
  onBack: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/users');
      // const data = await response.json();
      
      // Mock data for now
      setUsers([
        {
          id: '11111111-1111-1111-1111-111111111111',
          email: 'user1@test.com',
          display_name: 'Test User 1',
          user_type: 'registered',
          subscription_tier: 'free',
          created_at: '2025-01-15T10:00:00Z',
          last_session_at: '2025-02-06T14:30:00Z',
          total_sessions: 45,
          total_points: 2340,
          active_tube: 1,
          is_active: true
        },
        {
          id: '22222222-2222-2222-2222-222222222222',
          email: 'user2@test.com',
          display_name: 'Test User 2',
          user_type: 'anonymous',
          subscription_tier: 'free',
          created_at: '2025-02-01T08:15:00Z',
          last_session_at: '2025-02-06T12:00:00Z',
          total_sessions: 12,
          total_points: 567,
          active_tube: 2,
          is_active: true
        },
        {
          id: '33333333-3333-3333-3333-333333333333',
          email: 'premium@test.com',
          display_name: 'Premium User',
          user_type: 'registered',
          subscription_tier: 'premium',
          created_at: '2024-12-01T16:45:00Z',
          last_session_at: '2025-02-05T20:15:00Z',
          total_sessions: 156,
          total_points: 8942,
          active_tube: 3,
          is_active: true
        }
      ]);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'registered' && user.user_type === 'registered') ||
                         (filterType === 'anonymous' && user.user_type === 'anonymous') ||
                         (filterType === 'premium' && user.subscription_tier === 'premium') ||
                         (filterType === 'inactive' && !user.is_active);
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const getTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const now = new Date();
    const date = new Date(dateString);
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Less than 1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const renderUserDetail = (user: User) => (
    <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-800 p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">{user.display_name}</h3>
          <p className="text-gray-400">{user.email}</p>
          <p className="text-sm text-gray-500">ID: {user.id}</p>
        </div>
        <button
          onClick={() => setSelectedUser(null)}
          className="text-gray-400 hover:text-gray-300 transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h4 className="font-semibold text-white mb-2">Account Info</h4>
          <div className="space-y-2 text-sm text-gray-400">
            <p><span className="font-medium text-gray-300">Type:</span> {user.user_type}</p>
            <p><span className="font-medium text-gray-300">Subscription:</span> {user.subscription_tier}</p>
            <p><span className="font-medium text-gray-300">Created:</span> {formatDate(user.created_at)}</p>
            <p><span className="font-medium text-gray-300">Last Session:</span> {getTimeAgo(user.last_session_at)}</p>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-white mb-2">Learning Progress</h4>
          <div className="space-y-2 text-sm text-gray-400">
            <p><span className="font-medium text-gray-300">Total Sessions:</span> {user.total_sessions}</p>
            <p><span className="font-medium text-gray-300">Total Points:</span> {user.total_points.toLocaleString()}</p>
            <p><span className="font-medium text-gray-300">Active Tube:</span> Tube {user.active_tube}</p>
            <p><span className="font-medium text-gray-300">Status:</span> 
              <span className={`ml-1 ${user.is_active ? 'text-green-400' : 'text-red-400'}`}>
                {user.is_active ? 'Active' : 'Inactive'}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all">
          View Learning Progress
        </button>
        <button className="flex-1 bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-all border border-gray-700">
          Edit User
        </button>
        <button className="bg-red-600/20 text-red-400 border border-red-400/20 py-2 px-4 rounded-lg hover:bg-red-600/30 transition-all">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 shadow-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 p-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">User Management</h1>
                <p className="text-gray-400 mt-1">Manage user accounts and learning progress</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedUser ? (
          renderUserDetail(selectedUser)
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-white">{users.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-center">
                  <UserCheck className="w-8 h-8 text-green-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Active Users</p>
                    <p className="text-2xl font-bold text-white">
                      {users.filter(u => u.is_active).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-center">
                  <Award className="w-8 h-8 text-purple-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Premium Users</p>
                    <p className="text-2xl font-bold text-white">
                      {users.filter(u => u.subscription_tier === 'premium').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-orange-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Avg Sessions</p>
                    <p className="text-2xl font-bold text-white">
                      {Math.round(users.reduce((sum, u) => sum + u.total_sessions, 0) / users.length || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-lg focus:ring-blue-400 focus:border-blue-400 focus:outline-none"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-blue-400 focus:border-blue-400 focus:outline-none"
              >
                <option value="all">All Users</option>
                <option value="registered">Registered</option>
                <option value="anonymous">Anonymous</option>
                <option value="premium">Premium</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Users Table */}
            <div className="bg-gray-900 shadow-lg rounded-xl overflow-hidden border border-gray-800">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Subscription
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Sessions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-800">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-800/50 transition-all">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-200">{user.display_name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.user_type === 'registered' ? 'bg-green-400/20 text-green-400' : 'bg-gray-700 text-gray-400'
                        }`}>
                          {user.user_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.subscription_tier === 'premium' ? 'bg-purple-400/20 text-purple-400' : 'bg-blue-400/20 text-blue-400'
                        }`}>
                          {user.subscription_tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.total_sessions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.total_points.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getTimeAgo(user.last_session_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => setSelectedUser(user)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-blue-400 hover:text-blue-300 transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button className="text-red-400 hover:text-red-300 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserManagement;