import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Calendar, FileText, Bed, Pill, LogOut, User } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Define navigation based on user role
  const getNavigation = () => {
    const baseNav = [
      {
        name: "Medical Records",
        href: "/medical-records",
        icon: FileText,
        roles: ["patient", "doctor", "admin"],
      },
      {
        name: "Appointments",
        href: "/appointments",
        icon: Calendar,
        roles: ["patient", "doctor"],
      },
      {
        name: "Ward Management",
        href: "/wards",
        icon: Bed,
        roles: ["nurse", "ward_clerk", "admin", "patient"],
      },
      {
        name: "Pharmacy",
        href: "/pharmacy",
        icon: Pill,
        roles: ["pharmacist", "admin"],
      },
    ];

    return baseNav.filter(
      (item) => item.roles.includes(user?.role || "") || user?.role === "admin"
    );
  };

  const navigation = getNavigation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // FIXED: Better role-based routing with proper default pages
  React.useEffect(() => {
    const currentPath = location.pathname;

    if (user) {
      // Define default routes for each role
      const defaultRoutes: { [key: string]: string } = {
        patient: "/medical-records",
        doctor: "/appointments",
        nurse: "/wards",
        ward_clerk: "/wards",
        pharmacist: "/pharmacy",
        admin: "/medical-records",
      };

      const userDefaultRoute = defaultRoutes[user.role] || "/medical-records";

      // If user tries to access a route they don't have access to, redirect them
      const navItem = navigation.find((item) => item.href === currentPath);

      // If current path is not in their navigation and not their default route, redirect
      if (!navItem && currentPath !== userDefaultRoute && currentPath !== "/") {
        console.log(
          `Redirecting ${user.role} from ${currentPath} to ${userDefaultRoute}`
        );
        navigate(userDefaultRoute);
      }

      // If user goes to root path, redirect to their default route
      if (currentPath === "/") {
        navigate(userDefaultRoute);
      }
    }
  }, [user, location, navigate, navigation]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold text-gray-800">
              Healthcare System
            </h1>
            <p className="text-sm text-gray-600 mt-1 capitalize">
              {user?.role} Portal
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
};
