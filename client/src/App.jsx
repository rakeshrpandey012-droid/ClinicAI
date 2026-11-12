import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Sidebar';
import Queue from './pages/Queue';
import Consultation from './pages/Consultation';
import History from './pages/History';
import Prescription from './pages/Prescription';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/queue" replace />} />
          <Route path="/queue" element={<Queue />} />
          <Route path="/consult/:id" element={<Consultation />} />
          <Route path="/history/:id" element={<History />} />
          <Route path="/rx/:id" element={<Prescription />} />
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/queue" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
