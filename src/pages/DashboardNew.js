import React, { useState, useEffect } from "react";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import { useRealTime } from "../context/RealTimeContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

export default function DashboardNew() {
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
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (dashboardUpdates && dashboardUpdates.type === 'dashboard-update') {
      setStats(dashboardUpdates.data);
      setLastUpdated(new Date(dashboardUpdates.timestamp));
    }
  }, [dashboardUpdates]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/analytics/overview', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo'}`,
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
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

  // Enhanced Chart Data
  const lineChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Active Jobs",
        data: [65, 59, 80, 81, 56, 55, 70],
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "New Users",
        data: [28, 48, 40, 19, 86, 27, 45],
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Completed Jobs",
        data: [45, 35, 60, 70, 45, 65, 55],
        borderColor: "rgb(245, 158, 11)",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const doughnutData = {
    labels: ["Active Jobs", "Completed Jobs", "Pending Jobs", "Cancelled Jobs"],
    datasets: [
      {
        data: [stats.activeJobs, stats.completedJobs, stats.totalJobs - stats.activeJobs - stats.completedJobs, 5],
        backgroundColor: [
          "rgba(99, 102, 241, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderColor: [
          "rgba(99, 102, 241, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(239, 68, 68, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const barChartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Jobs Completed",
        data: [12, 19, 15, 25, 22, 18, 8],
        backgroundColor: "rgba(99, 102, 241, 0.8)",
        borderRadius: 8,
      },
      {
        label: "New Disputes",
        data: [3, 5, 2, 8, 4, 1, 2],
        backgroundColor: "rgba(239, 68, 68, 0.8)",
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
    },
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
              <p className="text-indigo-100 text-lg">Welcome back! Here's what's happening with SmartFix today.</p>
              <div className="flex items-center mt-4 space-x-6">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                  <span className="text-sm font-medium">{isConnected ? 'Real-time Connected' : 'Offline Mode'}</span>
                </div>
                <div className="text-sm text-indigo-200">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              </div>
            </div>
            <button
              onClick={handleRealTimeUpdate}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl transition duration-200 font-medium border border-white/20 hover:scale-105 transform"
            >
              {isConnected ? "🔄 Refresh Data" : "📡 Connect Real-time"}
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            title: "Total Users", 
            value: stats.totalUsers, 
            change: "+12%", 
            changeType: "positive",
            icon: "👥", 
            color: "from-blue-500 to-blue-600",
            bg: "bg-blue-50",
            textColor: "text-blue-600"
          },
          { 
            title: "Active Jobs", 
            value: stats.activeJobs, 
            change: "+8%", 
            changeType: "positive",
            icon: "🛠️", 
            color: "from-green-500 to-green-600",
            bg: "bg-green-50",
            textColor: "text-green-600"
          },
          { 
            title: "Pending Disputes", 
            value: stats.totalDisputes, 
            change: "-3%", 
            changeType: "negative",
            icon: "⚖️", 
            color: "from-red-500 to-red-600",
            bg: "bg-red-50",
            textColor: "text-red-600"
          },
          { 
            title: "Notifications", 
            value: stats.totalNotifications, 
            change: "+25%", 
            changeType: "positive",
            icon: "🔔", 
            color: "from-purple-500 to-purple-600",
            bg: "bg-purple-50",
            textColor: "text-purple-600"
          },
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition duration-300`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                stat.changeType === 'positive' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">{stat.title}</p>
              <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Line Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Performance Trends</h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-xs bg-indigo-100 text-indigo-600 rounded-full">7 Days</button>
              <button className="px-3 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded-full">30 Days</button>
            </div>
          </div>
          <div className="h-80">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Job Status Distribution</h3>
          <div className="h-80">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Weekly Overview */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Weekly Overview</h3>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-xs bg-indigo-100 text-indigo-600 rounded-full">This Week</button>
            <button className="px-3 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded-full">Last Week</button>
          </div>
        </div>
        <div className="h-80">
          <Bar data={barChartData} options={chartOptions} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Send Notification", icon: "🔔", color: "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700" },
            { label: "View Users", icon: "👥", color: "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700" },
            { label: "Manage Jobs", icon: "🛠️", color: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700" },
            { label: "Handle Disputes", icon: "⚖️", color: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700" },
          ].map((action, index) => (
            <button
              key={index}
              className={`${action.color} text-white p-6 rounded-xl transition duration-200 font-medium hover:scale-105 transform shadow-lg`}
            >
              <div className="text-3xl mb-3">{action.icon}</div>
              <div className="text-sm font-semibold">{action.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { action: "New job assigned", user: "Ahmed Khan", time: "2 minutes ago", type: "job" },
            { action: "Dispute resolved", user: "Fatima Ali", time: "15 minutes ago", type: "dispute" },
            { action: "User registered", user: "Omar Farooq", time: "1 hour ago", type: "user" },
            { action: "Notification sent", user: "System", time: "2 hours ago", type: "notification" },
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                activity.type === 'job' ? 'bg-blue-100' :
                activity.type === 'dispute' ? 'bg-red-100' :
                activity.type === 'user' ? 'bg-green-100' : 'bg-purple-100'
              }`}>
                <span className="text-lg">
                  {activity.type === 'job' ? '🛠️' :
                   activity.type === 'dispute' ? '⚖️' :
                   activity.type === 'user' ? '👤' : '🔔'}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{activity.action}</p>
                <p className="text-sm text-gray-600">by {activity.user}</p>
              </div>
              <div className="text-sm text-gray-500">{activity.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
