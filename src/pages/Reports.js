import React, { useState, useEffect } from "react";
import { Line, Bar, Doughnut, Pie } from "react-chartjs-2";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState("overview");
  const [dateRange, setDateRange] = useState("7d");
  const [exportFormat, setExportFormat] = useState("pdf");

  // New: live analytics state
  const [trends, setTrends] = useState({ newUsers: 0, newJobs: 0, newDisputes: 0, completedJobs: 0, resolvedDisputes: 0 });
  const [revenueSeries, setRevenueSeries] = useState([]);
  const [performance, setPerformance] = useState({ jobCompletionRate: 0, disputeResolutionRate: 0, averageResponseTime: "-", customerSatisfaction: "-", userRetentionRate: "-" });

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  useEffect(() => {
    fetchLiveAnalytics();
  }, [dateRange]);

  const authHeader = {
    'Authorization': `Bearer ${localStorage.getItem('token') || 'demo'}`,
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Simulate API call with mock data for recent reports list
      await new Promise(resolve => setTimeout(resolve, 300));
      const mockReports = generateMockReports();
      setReports(mockReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveAnalytics = async () => {
    try {
      const queries = new URLSearchParams({ period: dateRange }).toString();
      const [trRes, perfRes, revRes] = await Promise.all([
        fetch(`/api/analytics/trends?${queries}`, { headers: authHeader }),
        fetch(`/api/analytics/performance`, { headers: authHeader }),
        fetch(`/api/analytics/revenue?period=${mapDateRangeToRevenue(dateRange)}`, { headers: authHeader }),
      ]);

      if (trRes.ok) {
        const t = await trRes.json();
        setTrends(t);
      }
      if (perfRes.ok) {
        const p = await perfRes.json();
        setPerformance(p);
      }
      if (revRes.ok) {
        const r = await revRes.json();
        setRevenueSeries(r.revenueData || []);
      }
    } catch (e) {
      console.error('Error fetching analytics', e);
    }
  };

  const mapDateRangeToRevenue = (range) => {
    if (range === '90d' || range === '1y') return '1y';
    if (range === '30d') return '6m';
    return '3m';
  };

  const generateMockReports = () => {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return [
      { id: 1, title: "Weekly Performance Report", type: "performance", date: now.toISOString(), data: { newUsers: 45, activeJobs: 23, completedJobs: 18, disputes: 3, revenue: 12500 } },
      { id: 2, title: "User Activity Analysis", type: "users", date: lastWeek.toISOString(), data: { totalUsers: 1200, activeUsers: 890, newSignups: 67, userRetention: 0.74 } },
    ];
  };

  const exportReport = (format) => {
    const report = reports[0];
    if (!report) return;
    const data = JSON.stringify(report, null, 2);
    if (format === 'json') {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title.replace(/\s+/g, '_')}.json`;
      a.click();
    } else if (format === 'csv') {
      const csvContent = convertToCSV(report);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title.replace(/\s+/g, '_')}.csv`;
      a.click();
    } else if (format === 'pdf') {
      generatePDFReport(report);
    }
  };

  const generatePDFReport = (report) => {
    const pdfContent = `
SmartFix Report: ${report.title}
Generated on: ${new Date().toLocaleDateString()}
Type: ${report.type}

Report Data:
${Object.entries(report.data).map(([key, value]) => `${key}: ${value}`).join('\n')}

This is a sample PDF report. In production, you would use a library like jsPDF or react-pdf for proper PDF generation.
    `;
    
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/\s+/g, '_')}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleViewDetails = (report) => {
    alert(`Report Details:\n\nTitle: ${report.title}\nType: ${report.type}\nDate: ${new Date(report.date).toLocaleDateString()}\n\nData:\n${Object.entries(report.data).map(([key, value]) => `${key}: ${value}`).join('\n')}`);
  };

  const handleDownloadReport = (report) => {
    const format = exportFormat || 'json';
    if (format === 'json') {
      const data = JSON.stringify(report, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title.replace(/\s+/g, '_')}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const csvContent = convertToCSV(report);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title.replace(/\s+/g, '_')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      generatePDFReport(report);
    }
  };

  const convertToCSV = (report) => {
    const headers = ['Metric', 'Value'];
    const rows = Object.entries(report.data).map(([key, value]) => [key, value]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  // Charts bound to live state
  const userGrowthData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "New Users",
        data: [trends.newUsers / 7, trends.newUsers / 6, trends.newUsers / 5, trends.newUsers / 4, trends.newUsers / 3, trends.newUsers / 2, trends.newUsers].map(v => Math.max(0, Math.round(v))),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
      {
        label: "Completed Jobs",
        data: [trends.completedJobs / 7, trends.completedJobs / 6, trends.completedJobs / 5, trends.completedJobs / 4, trends.completedJobs / 3, trends.completedJobs / 2, trends.completedJobs].map(v => Math.max(0, Math.round(v))),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const jobStatusData = {
    labels: ["Active", "Completed", "Pending", "Cancelled"],
    datasets: [
      {
        data: [trends.newJobs - trends.completedJobs, trends.completedJobs, trends.newDisputes, Math.max(0, Math.round(trends.newJobs * 0.05))].map(v => Math.max(0, v)),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(251, 191, 36, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(34, 197, 94, 1)",
          "rgba(251, 191, 36, 1)",
          "rgba(239, 68, 68, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const revenueData = {
    labels: revenueSeries.map(r => r.month),
    datasets: [
      {
        label: "Revenue ($)",
        data: revenueSeries.map(r => r.revenue),
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 2,
      },
    ],
  };

  const disputeResolutionData = {
    labels: ["Resolved", "In Progress", "Escalated", "Closed"],
    datasets: [
      {
        data: [trends.resolvedDisputes, Math.max(0, trends.newDisputes - trends.resolvedDisputes), Math.max(0, Math.round(trends.newDisputes * 0.15)), Math.max(0, Math.round(trends.newDisputes * 0.1))],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(251, 191, 36, 0.8)",
          "rgba(156, 163, 175, 0.8)",
        ],
        borderColor: [
          "rgba(34, 197, 94, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(251, 191, 36, 1)",
          "rgba(156, 163, 175, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center">
          <span className="mr-3 text-2xl">📑</span> Advanced Analytics & Reports
        </h2>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <button
            onClick={() => { fetchReports(); fetchLiveAnalytics(); }}
            disabled={loading}
            className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition duration-200 font-medium disabled:opacity-50"
          >
            {loading ? '🔄' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {/* Report Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Generate Reports</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { id: "overview", label: "Overview", icon: "📊" },
            { id: "users", label: "Users", icon: "👥" },
            { id: "jobs", label: "🛠️", icon: "🛠️" },
            { id: "revenue", label: "Revenue", icon: "💰" },
          ].map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`p-4 rounded-lg border-2 transition duration-200 ${
                selectedReport === report.id
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-2xl mb-2">{report.icon}</div>
              <div className="text-sm font-medium">{report.label}</div>
            </button>
          ))}
        </div>

        {/* Export Options */}
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Export as:</span>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </select>
          <button
            onClick={() => exportReport(exportFormat)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200 font-medium"
          >
            📥 Export Report
          </button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">User Growth Trends</h3>
          <div className="h-64">
            <Line
              data={userGrowthData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "top" },
                },
                scales: {
                  y: { beginAtZero: true },
                },
              }}
            />
          </div>
        </div>

        {/* Job Status Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Job Status Distribution</h3>
          <div className="h-64">
            <Doughnut
              data={jobStatusData}
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

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Revenue Trends</h3>
          <div className="h-64">
            <Bar
              data={revenueData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "top" },
                },
                scales: {
                  y: { 
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return '$' + value.toLocaleString();
                      }
                    }
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Dispute Resolution */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Dispute Resolution</h3>
          <div className="h-64">
            <Pie
              data={disputeResolutionData}
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

      {/* Key Metrics from /performance */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Key Performance Indicators</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "User Retention Rate", value: performance.userRetentionRate, color: "text-green-600", icon: "📈" },
            { label: "Job Completion Rate", value: `${performance.jobCompletionRate}%`, color: "text-blue-600", icon: "✅" },
            { label: "Average Response Time", value: performance.averageResponseTime, color: "text-purple-600", icon: "⏱️" },
            { label: "Customer Satisfaction", value: performance.customerSatisfaction, color: "text-yellow-600", icon: "⭐" },
          ].map((metric, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl mb-2">{metric.icon}</div>
              <div className="text-sm text-gray-600 mb-1">{metric.label}</div>
              <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Reports</h3>
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-800">{report.title}</h4>
                <span className="text-sm text-gray-500">
                  {new Date(report.date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Type: {report.type}</p>
              <div className="flex space-x-4">
                <button 
                  onClick={() => handleViewDetails(report)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium bg-indigo-100 hover:bg-indigo-200 px-3 py-1 rounded-lg transition duration-200"
                >
                  View Details
                </button>
                <button 
                  onClick={() => handleDownloadReport(report)}
                  className="text-green-600 hover:text-green-800 text-sm font-medium bg-green-100 hover:bg-green-200 px-3 py-1 rounded-lg transition duration-200"
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}