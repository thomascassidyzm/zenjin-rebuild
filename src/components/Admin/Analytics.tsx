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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold text-white">Analytics & Reports</h1>
                <p className="text-gray-400 mt-1">System metrics and learning insights</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-blue-400 focus:border-blue-400 focus:outline-none"
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
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-blue-400/50 transition-all">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-400/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Sessions</p>
                <p className="text-2xl font-bold text-white">{data.sessionMetrics.totalSessions.toLocaleString()}</p>
                <p className="text-sm text-green-400">+12.3% from last period</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-green-400/50 transition-all">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Avg Session Length</p>
                <p className="text-2xl font-bold text-white">{data.sessionMetrics.averageSessionLength}m</p>
                <p className="text-sm text-green-400">+5.8% from last period</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-purple-400/50 transition-all">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-400/20 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Completion Rate</p>
                <p className="text-2xl font-bold text-white">{data.sessionMetrics.completionRate}%</p>
                <p className="text-sm text-red-400">-2.1% from last period</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-orange-400/50 transition-all">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-400/20 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">FTC Percentage</p>
                <p className="text-2xl font-bold text-white">{data.learningMetrics.ftcPercentage}%</p>
                <p className="text-sm text-green-400">+3.4% from last period</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">User Growth</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {data.userGrowth.map((point, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="relative w-full flex justify-center">
                    <div 
                      className="bg-gradient-to-t from-blue-400 to-cyan-400 rounded-t w-12 shadow-lg shadow-blue-400/20 hover:shadow-blue-400/40 transition-all"
                      style={{ height: `${(point.users / Math.max(...data.userGrowth.map(p => p.users))) * 200}px` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-400 mt-2">
                    {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Operations */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Popular Operations</h3>
            <div className="space-y-4">
              {data.learningMetrics.popularOperations.map((op, index) => {
                const colors = ['from-purple-400 to-pink-400', 'from-blue-400 to-cyan-400', 'from-green-400 to-emerald-400', 'from-orange-400 to-yellow-400'];
                return (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300 capitalize">{op.operation}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-800 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`bg-gradient-to-r ${colors[index]} h-2.5 rounded-full shadow-lg transition-all`}
                          style={{ width: `${op.usage}%`, boxShadow: `0 0 20px ${['#c084fc', '#60a5fa', '#4ade80', '#fb923c'][index]}40` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-400 w-12 text-right">{op.usage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Performance */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h3 className="text-lg font-semibold text-white">Content Performance</h3>
            <p className="text-sm text-gray-400 mt-1">How different stitches are performing</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Stitch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Sessions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Avg Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Completion Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-800">
                {data.contentPerformance.map((stitch, index) => (
                  <tr key={index} className="hover:bg-gray-800/50 transition-all">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-200">{stitch.name}</div>
                        <div className="text-sm text-gray-500">{stitch.stitchId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {stitch.sessions.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <span className={`${
                        stitch.averageScore >= 85 ? 'text-green-400' : 
                        stitch.averageScore >= 70 ? 'text-yellow-400' : 
                        'text-red-400'
                      }`}>
                        {stitch.averageScore.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {stitch.completionRate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        stitch.averageScore >= 85 
                          ? 'bg-green-400/20 text-green-400 shadow-lg shadow-green-400/20' 
                          : stitch.averageScore >= 70 
                          ? 'bg-yellow-400/20 text-yellow-400 shadow-lg shadow-yellow-400/20' 
                          : 'bg-red-400/20 text-red-400 shadow-lg shadow-red-400/20'
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