/**
 * Analytics Component
 * Admin analytics dashboard with system metrics and insights
 */

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock,
  ArrowLeft,
  Calendar,
  Target,
  Zap,
  Award
} from 'lucide-react';

interface AnalyticsData {
  userGrowth: Array<{ date: string; users: number }>;
  sessionMetrics: {
    totalSessions: number;
    averageSessionLength: number;
    completionRate: number;
  };
  contentPerformance: Array<{
    stitchId: string;
    name: string;
    sessions: number;
    averageScore: number;
    completionRate: number;
  }>;
  learningMetrics: {
    averagePointsPerSession: number;
    ftcPercentage: number;
    popularOperations: Array<{ operation: string; usage: number }>;
  };
}

interface AnalyticsProps {
  onBack: () => void;
}

export const Analytics: React.FC<AnalyticsProps> = ({ onBack }) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/admin/analytics?range=${timeRange}`);
      // const analyticsData = await response.json();
      
      // Mock data for now
      setData({
        userGrowth: [
          { date: '2025-01-01', users: 45 },
          { date: '2025-01-15', users: 67 },
          { date: '2025-02-01', users: 89 },
          { date: '2025-02-06', users: 156 }
        ],
        sessionMetrics: {
          totalSessions: 2847,
          averageSessionLength: 12.5,
          completionRate: 78.3
        },
        contentPerformance: [
          {
            stitchId: 't1-0001-0002',
            name: 'Double Numbers to 10',
            sessions: 245,
            averageScore: 85.6,
            completionRate: 92.1
          },
          {
            stitchId: 't1-0001-0004',
            name: 'Half of Numbers to 20',
            sessions: 198,
            averageScore: 81.2,
            completionRate: 88.7
          },
          {
            stitchId: 't1-0001-0001',
            name: '2 Times Table',
            sessions: 423,
            averageScore: 91.4,
            completionRate: 95.2
          }
        ],
        learningMetrics: {
          averagePointsPerSession: 47.3,
          ftcPercentage: 72.8,
          popularOperations: [
            { operation: 'multiplication', usage: 45.2 },
            { operation: 'double', usage: 23.1 },
            { operation: 'addition', usage: 18.7 },
            { operation: 'half', usage: 13.0 }
          ]
        }
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
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
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
                <p className="text-gray-600 mt-1">System metrics and learning insights</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{data.sessionMetrics.totalSessions.toLocaleString()}</p>
                <p className="text-sm text-green-600">+12.3% from last period</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Session Length</p>
                <p className="text-2xl font-bold text-gray-900">{data.sessionMetrics.averageSessionLength}m</p>
                <p className="text-sm text-green-600">+5.8% from last period</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{data.sessionMetrics.completionRate}%</p>
                <p className="text-sm text-red-600">-2.1% from last period</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Zap className="w-8 h-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">FTC Percentage</p>
                <p className="text-2xl font-bold text-gray-900">{data.learningMetrics.ftcPercentage}%</p>
                <p className="text-sm text-green-600">+3.4% from last period</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {data.userGrowth.map((point, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="bg-blue-500 rounded-t w-8"
                    style={{ height: `${(point.users / Math.max(...data.userGrowth.map(p => p.users))) * 200}px` }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2">
                    {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Operations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Operations</h3>
            <div className="space-y-4">
              {data.learningMetrics.popularOperations.map((op, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 capitalize">{op.operation}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${op.usage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{op.usage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Performance */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Content Performance</h3>
            <p className="text-sm text-gray-600 mt-1">How different stitches are performing</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stitch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sessions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.contentPerformance.map((stitch, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{stitch.name}</div>
                        <div className="text-sm text-gray-500">{stitch.stitchId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stitch.sessions.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stitch.averageScore.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stitch.completionRate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        stitch.averageScore >= 85 
                          ? 'bg-green-100 text-green-800' 
                          : stitch.averageScore >= 70 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {stitch.averageScore >= 85 ? 'Excellent' : stitch.averageScore >= 70 ? 'Good' : 'Needs Improvement'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;