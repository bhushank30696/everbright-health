import React from 'react';
import Navbar from './components/Navbar';
import CentralOps from './tabs/CentralOps';
import PracticeLeads from './tabs/PracticeLeads';
import { useDashboard } from './context/DashboardContext';

function DashboardContent() {
  const { activeTab } = useDashboard();

  return (
    <div style={{ padding: '0px 0px 48px' }}>
      {activeTab === 'ops' && <CentralOps />}
      {activeTab === 'leads' && <PracticeLeads />}
    </div>
  );
}

export default function App() {
  return (
    <div className="dashboard-root">
      <Navbar />
      <DashboardContent />
    </div>
  );
}
