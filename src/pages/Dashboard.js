import React, { useState, useEffect } from "react";
import { Line, Doughnut } from "react-chartjs-2";
import { useRealTime } from "../context/RealTimeContext";
import { analyticsAPI } from '../utils/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

export default function Dashboard() {
  const { isConnected, dashboardUpdates, requestDashboardUpdate } = useRealTime();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalDisputes: 0,
    totalNotifications: 0,
    activeUsers: 0,
    activeJobs: 0,
    completedJobs: 0,
    resolvedDisputes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Listen for real-time updates
  useEffect(() => {
    if (dashboardUpdates && dashboardUpdates.type === 'dashboard-update') {
      setStats(dashboardUpdates.data);
      setLastUpdated(new Date(dashboardUpdates.timestamp));
    }
  }, [dashboardUpdates]);

  const fetchDashboardData = async () => {
    try {
      const response = await analyticsAPI.getDashboard();
      if (response.success) {
        setStats(response.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRealTimeUpdate = () => {
    if (isConnected) {
      requestDashboardUpdate();
    } else {
      fetchDashboardData();
    }
  };

  const lineChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Active Jobs",
        data: [65, 59, 80, 81, 56, 55],
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.3,
      },
      {
        label: "New Users",
        data: [28, 48, 40, 19, 86, 27],
        borderColor: "rgb(153, 102, 255)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        tension: 0.3,
      },
    ],
  };

  const doughnutData = {
    labels: ["Active Jobs", "Completed Jobs", "Pending Jobs"],
    datasets: [
      {
        data: [stats.totalJobs * 0.6, stats.totalJobs * 0.3, stats.totalJobs * 0.1],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(251, 191, 36, 0.8)",
        ],
        borderColor: [
          "rgba(34, 197, 94, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(251, 191, 36, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center">
          <span className="mr-3 text-2xl">📊</span> Live Dashboard
        </h2>
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-500">
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={handleRealTimeUpdate}
            disabled={loading}
            className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition duration-200 font-medium disabled:opacity-50"
          >
            {loading ? '🔄' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {/* Live Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { title: "Total Users", value: stats.totalUsers, color: "text-indigo-600", icon: "👥", bg: "bg-indigo-50" },
          { title: "Active Jobs", value: stats.totalJobs, color: "text-green-600", icon: "🛠️", bg: "bg-green-50" },
          { title: "Pending Disputes", value: stats.totalDisputes, color: "text-red-600", icon: "⚖️", bg: "bg-red-50" },
          { title: "Notifications", value: stats.totalNotifications, color: "text-purple-600", icon: "🔔", bg: "bg-purple-50" },
        ].map((stat, index) => (
          <div
            key={index}
            className={`${stat.bg} rounded-xl shadow-lg p-6 transform transition-all hover:scale-[1.02] duration-300 border border-gray-100`}
          >
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">{stat.icon}</span>
              <h3 className="text-lg font-semibold text-gray-800">{stat.title}</h3>
            </div>
            <p className={`text-3xl font-extrabold ${stat.color}`}>
              {loading ? '...' : stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Line Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Activity Trends</h3>
          <div className="h-64">
            <Line
              data={lineChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "top" },
                  title: { display: false },
                },
                scales: {
                  y: { beginAtZero: true },
                },
              }}
            />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Job Distribution</h3>
          <div className="h-64">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "bottom" },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Send Notification", icon: "🔔", color: "bg-indigo-500 hover:bg-indigo-600" },
            { label: "View Users", icon: "👥", color: "bg-green-500 hover:bg-green-600" },
            { label: "Manage Jobs", icon: "🛠️", color: "bg-blue-500 hover:bg-blue-600" },
            { label: "Handle Disputes", icon: "⚖️", color: "bg-red-500 hover:bg-red-600" },
          ].map((action, index) => (
            <button
              key={index}
              className={`${action.color} text-white p-4 rounded-lg transition duration-200 font-medium`}
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <div className="text-sm">{action.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Status */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Real-time Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">🌐</div>
            <div className="text-sm text-gray-600">WebSocket</div>
            <div className={`text-lg font-bold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">📡</div>
            <div className="text-sm text-gray-600">Auto Refresh</div>
            <div className="text-lg font-bold text-blue-600">30s</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">⚡</div>
            <div className="text-sm text-gray-600">Live Updates</div>
            <div className={`text-lg font-bold ${isConnected ? 'text-green-600' : 'text-gray-600'}`}>
              {isConnected ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}