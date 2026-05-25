import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { RefreshCw, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const {
    activeState,
    setActiveState,
    activeQuarter,
    setActiveQuarter,
    activeTab,
    setActiveTab,
    dashboardData,
    isLive,
    lastSync,
    syncLoading,
    fetchLiveSheet,
    darkMode,
    setDarkMode
  } = useDashboard();

  return (
    <nav className="nav">
      <div className="nav-brand">
        <div className="logo"><div className="logo-inner"></div></div>
        <div>
          <span>Everbright Health</span>
          <small>ONBOARDING INTELLIGENCE</small>
        </div>
      </div>
      <div className="tab-nav">
        <button
          className={`tab-btn ${activeTab === 'charts' ? 'active' : ''}`}
          onClick={() => setActiveTab('charts')}
        >
          ■ Charts
        </button>
        <button
          className={`tab-btn ${activeTab === 'ops' ? 'active' : ''}`}
          onClick={() => setActiveTab('ops')}
        >
          ■ Central Ops
        </button>
        <button
          className={`tab-btn ${activeTab === 'leads' ? 'active' : ''}`}
          onClick={() => setActiveTab('leads')}
        >
          ■ Practice Leads
        </button>
      </div>
      <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Dynamic Sheet Sync Status Pill */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          background: 'var(--surface)', 
          border: '1px solid var(--border)', 
          borderRadius: '20px', 
          padding: '5px 12px', 
          fontSize: '11px',
          height: '28px'
        }}>
          <span style={{ 
            width: '6px', 
            height: '6px', 
            borderRadius: '50%', 
            background: isLive ? 'var(--clr-good)' : 'var(--clr-warn)',
            display: 'inline-block',
            boxShadow: isLive ? '0 0 8px var(--clr-good)' : '0 0 8px var(--clr-warn)'
          }}></span>
          <span style={{ color: isLive ? 'var(--text)' : 'var(--text2)', fontWeight: '500' }}>
            {isLive ? 'Live Sheet' : 'Local Fallback'}
          </span>
          <button 
            onClick={fetchLiveSheet}
            disabled={syncLoading}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text3)',
              padding: '0',
              marginLeft: '4px',
              transition: 'color 0.15s'
            }}
            title={lastSync ? `Last synced: ${lastSync.toLocaleTimeString()}` : 'Sync Spreadsheet'}
            className="sync-btn-icon"
          >
            <RefreshCw 
              size={12} 
              style={{ 
                animation: syncLoading ? 'spin 1s linear infinite' : 'none',
                color: syncLoading ? '#10b981' : 'var(--text3)'
              }} 
            />
          </button>
        </div>

        <div className="global-filter-group">
          <span className="global-filter-label">State</span>
          <select
            id="global-state-filter"
            className="global-filter-select"
            value={activeState}
            onChange={(e) => setActiveState(e.target.value)}
          >
            <option value="all">All States (TX, CA, FL)</option>
            <option value="TX">Texas (TX)</option>
            <option value="CA">California (CA)</option>
            <option value="FL">Florida (FL)</option>
          </select>
        </div>
        <div className="global-filter-group">
          <span className="global-filter-label">Quarter</span>
          <select
            id="global-quarter-filter"
            className="global-filter-select"
            value={activeQuarter}
            onChange={(e) => setActiveQuarter(e.target.value)}
          >
            <option value="Q1">Q1 2025</option>
            <option value="Q2">Q2 2025</option>
            <option value="Q3">Q3 2025</option>
            <option value="Q4">Q4 2025</option>
          </select>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: 'var(--text)',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: '0',
            transition: 'all 0.15s'
          }}
          className="theme-toggle-btn"
          title={darkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
        >
          {darkMode ? <Sun size={14} color="#f59e0b" /> : <Moon size={14} color="var(--text)" />}
        </button>

        {dashboardData.kpis.at_risk_count > 0 && (
          <span className="nav-badge" id="global-at-risk-badge">
            ● {dashboardData.kpis.at_risk_count} AT RISK
          </span>
        )}
      </div>
    </nav>
  );
}
