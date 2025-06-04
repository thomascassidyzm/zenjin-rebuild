/**
 * Admin Dashboard - Main admin interface
 * Provides overview and navigation to all admin functions
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  Settings, 
  BarChart3, 
  Database, 
  Upload,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Activity
} from 'lucide-react';

interface SystemStats {
  totalUsers: number;
  totalFacts: number;
  totalSitches: number;
  activeSessions: number;
  systemHealth: 'healthy' | 'warning' | 'error';
}

interface AdminDashboardProps {
  onNavigate: (section: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalFacts: 0,
    totalSitches: 0,
    activeSessions: 0,
    systemHealth: 'healthy'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemStats();
  }, []);

  const loadSystemStats = async () => {
    try {
      // TODO: Replace with actual API calls
      // const response = await fetch('/api/admin/stats');
      // const data = await response.json();
      
      // Mock data for now
      setStats({
        totalUsers: 156,
        totalFacts: 1247,
        totalSitches: 29,
        activeSessions: 12,
        systemHealth: 'healthy'
      });
    } catch (error) {
      console.error('Failed to load system stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const adminSections = [
    {
      id: 'curriculum',
      title: 'Curriculum Planner',
      description: 'Design learning sequences for the triple helix',
      icon: BookOpen,
      color: 'bg-emerald-500',
      stats: 'Simplified stitch sequencing'
    },
    {
      id: 'content',
      title: 'Content Management',
      description: 'Manage facts, stitches, and learning progressions',
      icon: BookOpen,
      color: 'bg-blue-500',
      stats: `${stats.totalFacts} facts, ${stats.totalSitches} stitches`
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'View and manage user accounts and progress',
      icon: Users,
      color: 'bg-green-500',
      stats: `${stats.totalUsers} total users`
    },
    {
      id: 'analytics',
      title: 'Analytics & Reports',
      description: 'System metrics, user analytics, and performance data',
      icon: BarChart3,
      color: 'bg-purple-500',
      stats: `${stats.activeSessions} active sessions`
    },
    {
      id: 'deployment',
      title: 'Content Deployment',
      description: 'Deploy content changes and manage rollbacks',
      icon: Upload,
      color: 'bg-orange-500',
      stats: 'Deploy & rollback tools'
    },
    {
      id: 'database',
      title: 'Database Management',
      description: 'Database health, backups, and maintenance',
      icon: Database,
      color: 'bg-indigo-500',
      stats: 'Health monitoring'
    },
    {
      id: 'settings',
      title: 'System Settings',
      description: 'Configuration, Easter Egg thresholds, and system parameters',
      icon: Settings,
      color: 'bg-gray-500',
      stats: 'Configuration management'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Zenjin Maths Admin</h1>
              <p className="text-gray-600 mt-1">System administration and content management</p>
            </div>
            <div className="flex items-center space-x-4">
              {getHealthIcon(stats.systemHealth)}
              <span className="text-sm font-medium capitalize">{stats.systemHealth}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Facts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFacts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Stitches</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSitches}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeSessions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => {
            const IconComponent = section.icon;
            return (
              <div
                key={section.id}
                onClick={() => onNavigate(section.id)}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 hover:border-gray-300"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 ${section.color} rounded-lg flex items-center justify-center`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{section.description}</p>
                  <p className="text-sm text-gray-500">{section.stats}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-900">New user registration: user_123</span>
                </div>
                <span className="text-xs text-gray-500">2 minutes ago</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-900">Content deployed: 5 new stitches</span>
                </div>
                <span className="text-xs text-gray-500">1 hour ago</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-900">System backup completed</span>
                </div>
                <span className="text-xs text-gray-500">3 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;