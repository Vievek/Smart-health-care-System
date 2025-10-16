import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Layout } from "./components/layout/Layout";
import { Login } from "./components/auth/Login";
import { MedicalRecordsDashboard } from "./components/medical-records/MedicalRecordsDashboard";
import { AppointmentBooking } from "./components/appointments/AppointmentBooking";
import { WardManagement } from "./components/wards/WardManagement";
import { PharmacyDispensing } from "./components/pharmacy/PharmacyDispensing";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/medical-records"
          element={
            <ProtectedRoute>
              <MedicalRecordsDashboard userRole={user?.role} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute>
              <AppointmentBooking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wards"
          element={
            <ProtectedRoute>
              <WardManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pharmacy"
          element={
            <ProtectedRoute>
              <PharmacyDispensing />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/medical-records" />} />
      </Routes>
    </Layout>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;
