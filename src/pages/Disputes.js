import React, { useState, useEffect } from "react";
import { useRealTime } from "../context/RealTimeContext";
import { disputesAPI } from '../utils/api';

export default function Disputes() {
  const { isConnected } = useRealTime();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [newComment, setNewComment] = useState("");

  // Mock data with comprehensive dispute details
  const mockDisputes = [
    {
      id: "D001",
      disputeId: "DSP-2024-001",
      jobId: "J001",
      title: "Service Quality Issue",
      description: "Technician arrived late and did not complete the AC repair properly. Unit still not working after 3 hours of work.",
      customer: { name: "Ahmed Khan", phone: "+92-300-1234567", email: "ahmed@example.com" },
      technician: { name: "Ali Raza", id: "T001" },
      status: "Open",
      priority: "High",
      assignedTo: "Support Manager",
      createdAt: "2024-01-15T14:30:00Z",
      updatedAt: "2024-01-15T16:45:00Z",
      attachments: ["complaint_photo.jpg", "job_receipt.pdf"],
      comments: [
        {
          id: 1,
          author: "Ahmed Khan",
          role: "Customer",
          message: "The technician was 2 hours late and rushed through the job. My AC is still not working properly.",
          timestamp: "2024-01-15T14:30:00Z",
          attachments: ["ac_not_working.jpg"]
        },
        {
          id: 2,
          author: "Support Manager",
          role: "Admin",
          message: "We apologize for the inconvenience. We are investigating this matter and will send another technician.",
          timestamp: "2024-01-15T15:00:00Z",
          attachments: []
        }
      ],
      resolution: null
    },
    {
      id: "D002",
      disputeId: "DSP-2024-002", 
      jobId: "J002",
      title: "Billing Dispute",
      description: "Customer was charged for parts that were not used in the washing machine installation.",
      customer: { name: "Fatima Ali", phone: "+92-302-3456789", email: "fatima@example.com" },
      technician: { name: "Hassan Raza", id: "T002" },
      status: "In Review",
      priority: "Medium",
      assignedTo: "Billing Department",
      createdAt: "2024-01-14T10:20:00Z",
      updatedAt: "2024-01-15T09:15:00Z",
      attachments: ["original_bill.pdf", "parts_list.pdf"],
      comments: [
        {
          id: 1,
          author: "Fatima Ali",
          role: "Customer",
          message: "I was charged for additional parts that the technician said were not needed. Please review my bill.",
          timestamp: "2024-01-14T10:20:00Z",
          attachments: ["bill_dispute.pdf"]
        },
        {
          id: 2,
          author: "Billing Department",
          role: "Admin",
          message: "We are reviewing your bill and will get back to you within 24 hours.",
          timestamp: "2024-01-14T11:00:00Z",
          attachments: []
        }
      ],
      resolution: null
    },
    {
      id: "D003",
      disputeId: "DSP-2024-003",
      jobId: "J003", 
      title: "Damage to Property",
      description: "Technician accidentally damaged the kitchen cabinet while repairing the refrigerator.",
      customer: { name: "Omar Restaurant", phone: "+92-304-5678901", email: "omar@restaurant.com" },
      technician: { name: "Sara Khan", id: "T003" },
      status: "Resolved",
      priority: "High",
      assignedTo: "Claims Department",
      createdAt: "2024-01-12T16:00:00Z",
      updatedAt: "2024-01-14T14:30:00Z",
      attachments: ["damage_photo.jpg", "repair_estimate.pdf"],
      comments: [
        {
          id: 1,
          author: "Omar Restaurant",
          role: "Customer", 
          message: "The technician damaged our kitchen cabinet. We need compensation for the repair.",
          timestamp: "2024-01-12T16:00:00Z",
          attachments: ["cabinet_damage.jpg"]
        },
        {
          id: 2,
          author: "Claims Department",
          role: "Admin",
          message: "We acknowledge the damage and will cover the repair costs. Compensation approved.",
          timestamp: "2024-01-13T10:00:00Z",
          attachments: ["compensation_approval.pdf"]
        }
      ],
      resolution: {
        notes: "Compensation of PKR 15,000 approved for cabinet repair. Customer satisfied with resolution.",
        resolvedBy: "Claims Manager",
        resolvedAt: "2024-01-14T14:30:00Z",
        compensationAmount: 15000
      }
    }
  ];

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const response = await disputesAPI.getAll();
      if (response.success) {
        setDisputes(response.data);
      } else {
        console.error('Failed to fetch disputes:', response.message);
        setDisputes(mockDisputes);
      }
    } catch (error) {
      console.error('Error fetching disputes:', error);
      setDisputes(mockDisputes);
    } finally {
      setLoading(false);
    }
  };

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = dispute.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dispute.disputeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dispute.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || dispute.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesPriority = priorityFilter === "all" || dispute.priority.toLowerCase() === priorityFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in review': return 'bg-blue-100 text-blue-800';
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
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

  const handleStatusChange = (disputeId, newStatus) => {
    setDisputes(disputes.map(dispute => 
      dispute.id === disputeId ? { 
        ...dispute, 
        status: newStatus,
        updatedAt: new Date().toISOString()
      } : dispute
    ));
  };

  const handleAddComment = (disputeId) => {
    if (!newComment.trim() || newComment.length < 5) {
      alert('Comment must be at least 5 characters long');
      return;
    }
    
    setDisputes(disputes.map(dispute => 
      dispute.id === disputeId ? {
        ...dispute,
        comments: [...dispute.comments, {
          id: dispute.comments.length + 1,
          author: "Admin User",
          role: "Admin",
          message: newComment,
          timestamp: new Date().toISOString(),
          attachments: []
        }],
        updatedAt: new Date().toISOString()
      } : dispute
    ));
    setNewComment("");
  };

  const handleResolveDispute = (disputeId) => {
    if (window.confirm('Are you sure you want to mark this dispute as resolved?')) {
      setDisputes(disputes.map(dispute => 
        dispute.id === disputeId ? {
          ...dispute,
          status: 'Resolved',
          updatedAt: new Date().toISOString(),
          resolution: {
            notes: 'Dispute resolved by admin',
            resolvedBy: 'Admin User',
            resolvedAt: new Date().toISOString()
          }
        } : dispute
      ));
    }
  };

  const handleDeleteDispute = async (disputeId) => {
    console.log('Delete dispute called with ID:', disputeId);
    if (window.confirm('Are you sure you want to delete this dispute? This action cannot be undone.')) {
      try {
        await disputesAPI.delete(disputeId);
        setDisputes(prevDisputes => {
          const newDisputes = prevDisputes.filter(dispute => dispute.id !== disputeId);
          console.log('Disputes after deletion:', newDisputes);
          return newDisputes;
        });
        alert('Dispute deleted successfully!');
      } catch (error) {
        console.error('Error deleting dispute:', error);
        alert('Failed to delete dispute. Please try again.');
      }
    }
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
              <span className="mr-3 text-2xl">⚖️</span> Dispute Resolution
            </h1>
            <p className="text-indigo-100">Manage and resolve customer disputes</p>
            <div className="flex items-center mt-2 space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                <span className="text-sm">{isConnected ? 'Real-time Connected' : 'Offline Mode'}</span>
              </div>
              <span className="text-sm text-indigo-200">Total Disputes: {disputes.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Disputes</label>
            <input
              type="text"
              placeholder="Search by ID, title, or customer..."
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
              <option value="open">Open</option>
              <option value="in review">In Review</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
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

      {/* Disputes Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dispute</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDisputes.map((dispute) => (
                <tr key={dispute.id} className="hover:bg-gray-50 transition duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{dispute.title}</div>
                      <div className="text-sm text-gray-500">{dispute.disputeId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{dispute.customer.name}</div>
                    <div className="text-sm text-gray-500">{dispute.customer.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {dispute.jobId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(dispute.priority)}`}>
                      {dispute.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(dispute.status)}`}>
                      {dispute.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dispute.assignedTo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        setSelectedDispute(dispute);
                        setShowDetailsModal(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 px-3 py-1 rounded-lg transition duration-200"
                    >
                      View Details
                    </button>
                    {dispute.status !== 'Resolved' && (
                      <button
                        onClick={() => handleResolveDispute(dispute.id)}
                        className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1 rounded-lg transition duration-200"
                      >
                        Resolve
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteDispute(dispute.id);
                      }}
                      className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-lg transition duration-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: "Total Disputes", value: disputes.length, icon: "📋", color: "bg-blue-500" },
          { title: "Open Disputes", value: disputes.filter(d => d.status === 'Open').length, icon: "🔓", color: "bg-red-500" },
          { title: "In Review", value: disputes.filter(d => d.status === 'In Review').length, icon: "👁️", color: "bg-yellow-500" },
          { title: "Resolved", value: disputes.filter(d => d.status === 'Resolved').length, icon: "✅", color: "bg-green-500" },
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

      {/* Dispute Details Modal */}
      {showDetailsModal && selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">{selectedDispute.title}</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Dispute Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dispute ID</label>
                  <p className="text-gray-900">{selectedDispute.disputeId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Job ID</label>
                  <p className="text-gray-900">{selectedDispute.jobId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer</label>
                  <p className="text-gray-900">{selectedDispute.customer.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Technician</label>
                  <p className="text-gray-900">{selectedDispute.technician.name}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{selectedDispute.description}</p>
              </div>

              {/* Comments Thread */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Comments</h4>
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {selectedDispute.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium text-gray-900">{comment.author}</span>
                          <span className="text-sm text-gray-500 ml-2">({comment.role})</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.message}</p>
                      {comment.attachments.length > 0 && (
                        <div className="mt-2">
                          <span className="text-sm text-gray-500">Attachments: </span>
                          {comment.attachments.map((file, index) => (
                            <span key={index} className="text-sm text-indigo-600 mr-2">{file}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Comment */}
                <div className="mt-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows="3"
                    minLength="5"
                    maxLength="1000"
                    required
                    title="Comment must be between 5-1000 characters"
                  />
                  <button
                    onClick={() => handleAddComment(selectedDispute.id)}
                    className="mt-2 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition duration-200"
                  >
                    Add Comment
                  </button>
                </div>
              </div>

              {/* Resolution */}
              {selectedDispute.resolution && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-green-800 mb-2">Resolution</h4>
                  <p className="text-green-700 mb-2">{selectedDispute.resolution.notes}</p>
                  <div className="text-sm text-green-600">
                    <p>Resolved by: {selectedDispute.resolution.resolvedBy}</p>
                    <p>Date: {new Date(selectedDispute.resolution.resolvedAt).toLocaleString()}</p>
                    {selectedDispute.resolution.compensationAmount && (
                      <p>Compensation: PKR {selectedDispute.resolution.compensationAmount.toLocaleString()}</p>
                    )}
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