import React from "react";
import { Routes, Route, NavLink, Outlet, Navigate } from "react-router-dom";
import { RealTimeProvider } from "../context/RealTimeContext";
import Dashboard from "./DashboardNew";
import Users from "./Users";
import Jobs from "./Jobs";
import Disputes from "./Disputes";
import Notifications from "./Notifications";
import Reports from "./Reports";
import Login from "./Login";

function Layout({ onLogout }) {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-2xl p-8 flex flex-col">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-12 tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
            🚀 SmartFix
          </span>
        </h1>
        <nav className="space-y-2">
          {[
            { to: "/dashboard", text: "Dashboard", icon: "📊" },
            { to: "/users", text: "Users", icon: "👥" },
            { to: "/jobs", text: "Jobs", icon: "🛠️" },
            { to: "/disputes", text: "Disputes", icon: "⚖️" },
            { to: "/notifications", text: "Notifications", icon: "🔔" },
            { to: "/reports", text: "Reports", icon: "📑" },
          ].map((link, index) => (
            <NavLink
              key={index}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center py-3 px-4 rounded-lg transition-all duration-200 font-medium text-lg ${
                  isActive
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
                }`
              }
              end
            >
              <span className="mr-3 text-xl">{link.icon}</span>
              {link.text}
            </NavLink>
          ))}
        </nav>
        
        {/* Logout Button */}
        <div className="mt-auto pt-8">
          <button
            onClick={handleLogout}
            className="w-full flex items-center py-3 px-4 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-all duration-200 font-medium"
          >
            <span className="mr-3 text-xl">🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <RealTimeProvider>
      <Routes>
        <Route element={<Layout onLogout={() => setIsAuthenticated(false)} />}>
          <Route index element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/disputes" element={<Disputes />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </RealTimeProvider>
  );
}