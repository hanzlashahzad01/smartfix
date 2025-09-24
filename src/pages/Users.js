import React, { useState, useEffect } from 'react';
import { useRealTime } from '../context/RealTimeContext';
import AddUserModal from '../components/AddUserModal';
import EditUserModal from '../components/EditUserModal';
import { usersAPI } from '../utils/api';

export default function Users() {
  const { isConnected } = useRealTime();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [bulkSelected, setBulkSelected] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  // Mock data - replace with API call
  const mockUsers = [
    { 
      id: "U001", 
      name: "Ali Raza", 
      email: "ali@smartfix.com", 
      phone: "+92-300-1234567",
      role: "Admin", 
      status: "Active", 
      department: "Management",
      lastLogin: "2024-01-15 10:30 AM",
      joinedDate: "2023-06-15",
      avatar: "https://ui-avatars.com/api/?name=Ali+Raza&background=6366f1&color=fff"
    },
    { 
      id: "U002", 
      name: "Fatima Khan", 
      email: "fatima@smartfix.com", 
      phone: "+92-301-2345678",
      role: "Support", 
      status: "Active", 
      department: "Customer Service",
      lastLogin: "2024-01-15 09:15 AM",
      joinedDate: "2023-08-20",
      avatar: "https://ui-avatars.com/api/?name=Fatima+Khan&background=10b981&color=fff"
    },
    { 
      id: "U003", 
      name: "Ahmed Shah", 
      email: "ahmed@smartfix.com", 
      phone: "+92-302-3456789",
      role: "Technician", 
      status: "Blocked", 
      department: "Field Operations",
      lastLogin: "2024-01-10 02:45 PM",
      joinedDate: "2023-09-10",
      avatar: "https://ui-avatars.com/api/?name=Ahmed+Shah&background=f59e0b&color=fff"
    },
    { 
      id: "U004", 
      name: "Sara Ali", 
      email: "sara@smartfix.com", 
      phone: "+92-303-4567890",
      role: "Viewer", 
      status: "Active", 
      department: "Analytics",
      lastLogin: "2024-01-14 04:20 PM",
      joinedDate: "2023-11-05",
      avatar: "https://ui-avatars.com/api/?name=Sara+Ali&background=8b5cf6&color=fff"
    },
    { 
      id: "U005", 
      name: "Hassan Raza", 
      email: "hassan@smartfix.com", 
      phone: "+92-304-5678901",
      role: "Support", 
      status: "Suspended", 
      department: "Customer Service",
      lastLogin: "2024-01-12 11:00 AM",
      joinedDate: "2023-12-01",
      avatar: "https://ui-avatars.com/api/?name=Hassan+Raza&background=ef4444&color=fff"
    }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      if (response.success) {
        setUsers(response.data);
      } else {
        console.error('Failed to fetch users:', response.message);
        // Fallback to mock data if API fails
        setUsers(mockUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to mock data if API fails
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setShowAddModal(true);
  };

  const handleSaveUser = async (newUser) => {
    try {
      const response = await usersAPI.create(newUser);
      if (response.success) {
        setUsers(prevUsers => [response.data, ...prevUsers]);
        setShowAddModal(false);
      } else {
        console.error('Failed to create user:', response.message);
        alert('Failed to create user. Please try again.');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user. Please try again.');
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (updatedUser) => {
    try {
      const response = await usersAPI.update(updatedUser.id, updatedUser);
      if (response.success) {
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === updatedUser.id ? response.data : user
          )
        );
        setShowEditModal(false);
      } else {
        console.error('Failed to update user:', response.message);
        alert('Failed to update user. Please try again.');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId) => {
    console.log('Delete user called with ID:', userId);
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await usersAPI.delete(userId);
        setUsers(prevUsers => {
          const newUsers = prevUsers.filter(user => user.id !== userId);
          console.log('Users after deletion:', newUsers);
          return newUsers;
        });
        alert('User deleted successfully!');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };


  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesRole = roleFilter === "all" || user.role.toLowerCase() === roleFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleStatusChange = (userId, newStatus) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  const handleBulkAction = (action) => {
    if (bulkSelected.length === 0) return;
    
    switch (action) {
      case 'activate':
        setUsers(users.map(user => 
          bulkSelected.includes(user.id) ? { ...user, status: 'Active' } : user
        ));
        break;
      case 'block':
        setUsers(users.map(user => 
          bulkSelected.includes(user.id) ? { ...user, status: 'Blocked' } : user
        ));
        break;
      case 'delete':
        setUsers(users.filter(user => !bulkSelected.includes(user.id)));
        break;
    }
    setBulkSelected([]);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setBulkSelected(currentUsers.map(user => user.id));
    } else {
      setBulkSelected([]);
    }
  };

  const handleSelectUser = (userId, checked) => {
    if (checked) {
      setBulkSelected([...bulkSelected, userId]);
    } else {
      setBulkSelected(bulkSelected.filter(id => id !== userId));
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'support': return 'bg-blue-100 text-blue-800';
      case 'technician': return 'bg-orange-100 text-orange-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
              <span className="mr-3 text-2xl">👥</span> User Management
            </h1>
            <p className="text-indigo-100">Manage users, roles, and permissions</p>
            <div className="flex items-center mt-2 space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                <span className="text-sm">{isConnected ? 'Real-time Connected' : 'Offline Mode'}</span>
              </div>
              <span className="text-sm text-indigo-200">Total Users: {users.length}</span>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl transition duration-200 font-medium border border-white/20 hover:scale-105 transform"
          >
            ➕ Add New User
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
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
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role Filter</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="support">Support</option>
              <option value="technician">Technician</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bulk Actions</label>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('activate')}
                disabled={bulkSelected.length === 0}
                className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('block')}
                disabled={bulkSelected.length === 0}
                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Block
              </button>
            </div>
          </div>
        </div>
        
        {bulkSelected.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <p className="text-indigo-800 font-medium">
              {bulkSelected.length} user(s) selected
            </p>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={bulkSelected.length === currentUsers.length && currentUsers.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={bulkSelected.includes(user.id)}
                      onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img className="h-10 w-10 rounded-full" src={user.avatar} alt={user.name} />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">{user.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 px-3 py-1 rounded-lg transition duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleStatusChange(user.id, user.status === 'Active' ? 'Blocked' : 'Active')}
                        className={`px-3 py-1 rounded-lg transition duration-200 ${
                          user.status === 'Active' 
                            ? 'text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200' 
                            : 'text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200'
                        }`}
                      >
                        {user.status === 'Active' ? 'Block' : 'Activate'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteUser(user.id);
                        }}
                        className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-lg transition duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastUser, filteredUsers.length)}</span> of{' '}
                  <span className="font-medium">{filteredUsers.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: "Total Users", value: users.length, icon: "👥", color: "bg-blue-500" },
          { title: "Active Users", value: users.filter(u => u.status === 'Active').length, icon: "✅", color: "bg-green-500" },
          { title: "Blocked Users", value: users.filter(u => u.status === 'Blocked').length, icon: "🚫", color: "bg-red-500" },
          { title: "Admin Users", value: users.filter(u => u.role === 'Admin').length, icon: "👑", color: "bg-purple-500" },
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

      {/* Add User Modal */}
      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveUser}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleUpdateUser}
        user={selectedUser}
      />
    </div>
  );
}