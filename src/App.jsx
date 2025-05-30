import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DataEntry from './pages/DataEntry';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import { UserProvider } from './context/UserContext';
import { MeasurementProvider } from './context/MeasurementContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/Auth/LoginForm';
import RegistrationForm from './components/Auth/RegistrationForm';
import Loading from './components/Loading';

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { isAuth, isLoading } = useAuth();

  if (isLoading) {
    console.log('Rendering Loading...');
    return <Loading />;
  }

  console.log('Rendering AppContent - isAuth:', isAuth);

  return (
    <UserProvider>
      <MeasurementProvider>
        <Routes>
          {isAuth ? (
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="data-entry" element={<DataEntry />} />
              <Route path="reports" element={<Reports />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          ) : (
            <Route path="/" element={<UnauthorizedLayout />}>
              <Route index element={<>Контент LoginForm: <LoginForm /></>} />
              <Route path="/registration" element={<>Контент RegistrationForm: <RegistrationForm /></>} />
            </Route>
          )}
          <Route path="*" element={isAuth ? <Navigate to="/" replace /> : <Navigate to="/" replace />} />
        </Routes>
      </MeasurementProvider>
    </UserProvider>
  );
}

function UnauthorizedLayout() {
  console.log('Rendering UnauthorizedLayout...');
  return (
    <div>
      <p>Это UnauthorizedLayout</p>
      <Routes>
        <Route path="/" element={<>Контент LoginForm: <LoginForm /></>} />
        <Route path="/registration" element={<>Контент RegistrationForm: <RegistrationForm /></>} />
      </Routes>
    </div>
  );
}

export default App; 