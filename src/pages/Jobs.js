import React, { useState, useEffect } from 'react';
import { useRealTime } from '../context/RealTimeContext';
import AddJobModal from '../components/AddJobModal';
import { jobsAPI } from '../utils/api';

export default function Jobs() {
  const { isConnected, socket } = useRealTime();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [draggedJob, setDraggedJob] = useState(null);

  // Mock data with comprehensive job details
  const mockJobs = [
    {
      id: "J001",
      title: "AC Repair - Residential",
      customer: { name: "Ahmed Khan", phone: "+92-300-1234567", address: "DHA Phase 5, Lahore" },
      technician: { name: "Ali Raza", id: "T001", phone: "+92-301-2345678" },
      status: "In Progress",
      priority: "High",
      description: "Air conditioning unit not cooling properly. Customer reports strange noises.",
      createdAt: "2024-01-15T09:30:00Z",
      assignedAt: "2024-01-15T10:00:00Z",
      estimatedCompletion: "2024-01-15T16:00:00Z",
      attachments: ["ac_photo.jpg", "warranty_card.pdf"],
      timeline: [
        { status: "Created", timestamp: "2024-01-15T09:30:00Z", notes: "Job created by customer call" },
        { status: "Assigned", timestamp: "2024-01-15T10:00:00Z", notes: "Assigned to Ali Raza" },
        { status: "In Progress", timestamp: "2024-01-15T11:00:00Z", notes: "Technician arrived on site" }
      ]
    },
    {
      id: "J002", 
      title: "Washing Machine Installation",
      customer: { name: "Fatima Ali", phone: "+92-302-3456789", address: "Gulberg III, Lahore" },
      technician: { name: "Hassan Raza", id: "T002", phone: "+92-303-4567890" },
      status: "Pending",
      priority: "Medium",
      description: "New washing machine installation and setup required.",
      createdAt: "2024-01-15T14:20:00Z",
      assignedAt: null,
      estimatedCompletion: "2024-01-16T12:00:00Z",
      attachments: ["purchase_receipt.pdf"],
      timeline: [
        { status: "Created", timestamp: "2024-01-15T14:20:00Z", notes: "Online booking received" }
      ]
    },
    {
      id: "J003",
      title: "Refrigerator Repair - Commercial", 
      customer: { name: "Omar Restaurant", phone: "+92-304-5678901", address: "MM Alam Road, Lahore" },
      technician: { name: "Sara Khan", id: "T003", phone: "+92-305-6789012" },
      status: "Completed",
      priority: "Urgent",
      description: "Commercial refrigerator temperature control issues affecting food storage.",
      createdAt: "2024-01-14T08:00:00Z",
      assignedAt: "2024-01-14T08:30:00Z",
      estimatedCompletion: "2024-01-14T18:00:00Z",
      completedAt: "2024-01-14T17:30:00Z",
      attachments: ["before_repair.jpg", "after_repair.jpg", "invoice.pdf"],
      timeline: [
        { status: "Created", timestamp: "2024-01-14T08:00:00Z", notes: "Emergency call received" },
        { status: "Assigned", timestamp: "2024-01-14T08:30:00Z", notes: "Urgent priority - assigned to Sara" },
        { status: "In Progress", timestamp: "2024-01-14T09:00:00Z", notes: "Technician on site" },
        { status: "Completed", timestamp: "2024-01-14T17:30:00Z", notes: "Repair completed successfully" }
      ]
    }
  ];

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getAll();
      if (response.success) {
        setJobs(response.data);
      } else {
        console.error('Failed to fetch jobs:', response.message);
        setJobs(mockJobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs(mockJobs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handler = (update) => {
      setJobs((prev) => {
        const index = prev.findIndex(j => j.id === update.id);
        if (index >= 0) {
          const copy = [...prev];
          copy[index] = { ...copy[index], status: update.status };
          return copy;
        }
        return prev;
      });
    };

    socket.on('job-status', handler);
    return () => socket.off('job-status', handler);
  }, [socket]);

  const handleAddJob = () => {
    setShowAddModal(true);
  };

  const handleSaveJob = async (newJob) => {
    try {
      const response = await jobsAPI.create(newJob);
      if (response.success) {
        setJobs(prevJobs => [response.data, ...prevJobs]);
        setShowAddModal(false);
      } else {
        console.error('Failed to create job:', response.message);
        alert('Failed to create job. Please try again.');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Failed to create job. Please try again.');
    }
  };

  const handleDeleteJob = async (jobId) => {
    console.log('Delete job called with ID:', jobId);
    if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      try {
        await jobsAPI.delete(jobId);
        setJobs(prevJobs => {
          const newJobs = prevJobs.filter(job => job.id !== jobId);
          console.log('Jobs after deletion:', newJobs);
          return newJobs;
        });
        alert('Job deleted successfully!');
      } catch (error) {
        console.error('Error deleting job:', error);
        alert('Failed to delete job. Please try again.');
      }
    }
  };


  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesPriority = priorityFilter === "all" || job.priority.toLowerCase() === priorityFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = (jobId, newStatus) => {
    setJobs(jobs.map(job => 
      job.id === jobId ? { 
        ...job, 
        status: newStatus,
        timeline: [...job.timeline, {
          status: newStatus,
          timestamp: new Date().toISOString(),
          notes: `Status updated to ${newStatus}`
        }]
      } : job
    ));
  };

  const handleDragStart = (e, job) => {
    setDraggedJob(job);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    if (draggedJob && draggedJob.status !== newStatus) {
      handleStatusChange(draggedJob.id, newStatus);
    }
    setDraggedJob(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <span className="mr-3 text-2xl">🛠️</span> Job Management
            </h1>
            <p className="text-indigo-100">Monitor and manage all service jobs</p>
            <div className="flex items-center mt-2 space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                <span className="text-sm">{isConnected ? 'Real-time Connected' : 'Offline Mode'}</span>
              </div>
              <span className="text-sm text-indigo-200">Total Jobs: {jobs.length}</span>
            </div>
          </div>
          <button
            onClick={handleAddJob}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl transition duration-200 font-medium border border-white/20 hover:scale-105 transform"
          >
            ➕ Create New Job
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Jobs</label>
            <input
              type="text"
              placeholder="Search by job ID, title, or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority Filter</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {['Pending', 'In Progress', 'Completed', 'Cancelled'].map((status) => (
          <div
            key={status}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-4"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center justify-between">
              <span>{status}</span>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                {filteredJobs.filter(job => job.status === status).length}
              </span>
            </h3>
            <div className="space-y-3">
              {filteredJobs
                .filter(job => job.status === status)
                .map((job) => (
                  <div
                    key={job.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, job)}
                    className="bg-gray-50 rounded-lg p-4 cursor-move hover:shadow-md transition duration-200 border-l-4 border-indigo-500"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{job.title}</h4>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(job.priority)}`}>
                        {job.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{job.id}</p>
                    <p className="text-sm text-gray-700 mb-2">{job.customer.name}</p>
                    <p className="text-xs text-gray-500 mb-3">{job.technician.name}</p>
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setShowDetailsModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 px-3 py-1 rounded-lg transition duration-200 text-xs"
                      >
                        View Details
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteJob(job.id);
                        }}
                        className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-lg transition duration-200 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: "Total Jobs", value: jobs.length, icon: "📋", color: "bg-blue-500" },
          { title: "Active Jobs", value: jobs.filter(j => j.status === 'In Progress').length, icon: "⚡", color: "bg-green-500" },
          { title: "Pending Jobs", value: jobs.filter(j => j.status === 'Pending').length, icon: "⏳", color: "bg-yellow-500" },
          { title: "Completed Today", value: jobs.filter(j => j.status === 'Completed').length, icon: "✅", color: "bg-purple-500" },
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3 mr-4`}>
                <span className="text-white text-2xl">{stat.icon}</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-gray-600">{stat.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Job Modal */}
      <AddJobModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveJob}
      />

      {/* Job Details Modal */}
      {showDetailsModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">{selectedJob.title}</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Job Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Job ID</label>
                  <p className="text-gray-900">{selectedJob.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedJob.status)}`}>
                    {selectedJob.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer</label>
                  <p className="text-gray-900">{selectedJob.customer.name}</p>
                  <p className="text-sm text-gray-500">{selectedJob.customer.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Technician</label>
                  <p className="text-gray-900">{selectedJob.technician.name}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{selectedJob.description}</p>
              </div>

              {/* Timeline */}
              {selectedJob.timeline && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Timeline</h4>
                  <div className="space-y-3">
                    {selectedJob.timeline.map((event, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium text-gray-900">{event.status}</p>
                          <p className="text-sm text-gray-500">{new Date(event.timestamp).toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{event.notes}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}