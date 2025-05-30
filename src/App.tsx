import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DataEntry from './pages/DataEntry';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import { UserProvider } from './context/UserContext';
import { MeasurementProvider } from './context/MeasurementContext';

function App() {
  return (
    <UserProvider>
      <MeasurementProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="data-entry" element={<DataEntry />} />
            <Route path="reports" element={<Reports />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </MeasurementProvider>
    </UserProvider>
  );
}

export default App;