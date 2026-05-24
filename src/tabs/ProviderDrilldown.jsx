import React, { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';

export default function ProviderDrilldown() {
  const {
    activeQuarter,
    providers
  } = useDashboard();

  const [sortBy, setSortBy] = useState('risk'); // risk, onboarding, satisfaction, burden
  const [filterMkt, setFilterMkt] = useState('all'); // all, TX, CA, FL

  const processedProviders = useMemo(() => {
    let result = [...providers];
    if (filterMkt !== 'all') {
      result = result.filter(p => p.Market === filterMkt);
    }

    result.sort((a, b) => {
      if (sortBy === 'risk') {
        return b.risk_score - a.risk_score;
      } else if (sortBy === 'onboarding') {
        return b['Onboarding Duration (days)'] - a['Onboarding Duration (days)'];
      } else if (sortBy === 'satisfaction') {
        return a['Satisfaction Score (1-5)'] - b['Satisfaction Score (1-5)'];
      } else if (sortBy === 'burden') {
        return b.escalation_burden - a.escalation_burden;
      }
      return 0;
    });

    return result;
  }, [providers, sortBy, filterMkt]);

  const riskColors = {
    0: 'var(--clr-good)',
    1: 'var(--clr-neutral)',
    2: 'var(--clr-caution)',
    3: 'var(--clr-critical)'
  };

  const riskBadgeClass = (risk) => {
    const map = { 'Breached': 'breached', 'High Risk': 'high-risk', 'Medium Risk': 'medium-risk', 'On Track': 'on-track' };
    return `badge ${map[risk] || 'info'}`;
  };

  return (
    <div className="page active" id="page-providers" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div className="page-header">
        <h1>Provider Drilldown</h1>
        <p>Detailed individual provider investigation · All derived metrics · Step breakdown</p>
        <div className="meta">
          DATASET: {providers.length} PROVIDERS · TX · CA · FL · {activeQuarter} 2025
        </div>
      </div>

      {/* FILTER & SORT CONTROLS */}
      <div className="filters">
        <span className="filter-label">Sort by:</span>
        <button 
          className={`filter-btn ${sortBy === 'risk' ? 'active' : ''}`}
          onClick={() => setSortBy('risk')}
        >
          Risk Score
        </button>
        <button 
          className={`filter-btn ${sortBy === 'onboarding' ? 'active' : ''}`}
          onClick={() => setSortBy('onboarding')}
        >
          Onboarding Days
        </button>
        <button 
          className={`filter-btn ${sortBy === 'satisfaction' ? 'active' : ''}`}
          onClick={() => setSortBy('satisfaction')}
        >
          Satisfaction
        </button>
        <button 
          className={`filter-btn ${sortBy === 'burden' ? 'active' : ''}`}
          onClick={() => setSortBy('burden')}
        >
          Esc Burden
        </button>

        <div className="filter-spacer"></div>

        <button 
          className={`filter-btn ${filterMkt === 'all' ? 'active' : ''}`}
          onClick={() => setFilterMkt('all')}
        >
          All Markets
        </button>
        <button 
          className={`filter-btn ${filterMkt === 'TX' ? 'active' : ''}`}
          onClick={() => setFilterMkt('TX')}
        >
          TX
        </button>
        <button 
          className={`filter-btn ${filterMkt === 'CA' ? 'active' : ''}`}
          onClick={() => setFilterMkt('CA')}
        >
          CA
        </button>
        <button 
          className={`filter-btn ${filterMkt === 'FL' ? 'active' : ''}`}
          onClick={() => setFilterMkt('FL')}
        >
          FL
        </button>
      </div>

      {/* PROVIDERS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
        {processedProviders.map(p => {
          const total = p['Contracting Days'] + p['IT Provisioning Days'] + p['Compliance Days'] + p['Training Days'];
          const steps = [
            { label: 'C', days: p['Contracting Days'],          color: 'var(--clr-good)' },
            { label: 'IT', days: p['IT Provisioning Days'],     color: 'var(--clr-critical)' },
            { label: 'Co', days: p['Compliance Days'],  color: 'var(--clr-warn)' },
            { label: 'T',  days: p['Training Days'],     color: 'var(--clr-caution)' }
          ];

          return (
            <div 
              key={p['Provider ID']} 
              className="card" 
              style={{ padding: '16px', borderTop: `3px solid ${riskColors[p.risk_score] || 'var(--border)'}`, background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>
                    {p['Provider ID']}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)' }}>
                    {p.Market} Market · Started {p['Start Date'] || '—'}
                  </div>
                </div>
                <span className={riskBadgeClass(p.sla_risk)}>
                  ● {p.sla_risk}
                </span>
              </div>

              {/* Step share progress bars */}
              <div style={{ display: 'flex', marginBottom: '10px', height: '8px', borderRadius: '4px', overflow: 'hidden', gap: '1px' }}>
                {steps.map((s, idx) => (
                  <div 
                    key={idx} 
                    style={{ flex: s.days / total, background: s.color, opacity: '0.85' }} 
                    title={`${s.label}: ${s.days}d`}
                  ></div>
                ))}
              </div>

              {/* Stats box */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px', marginBottom: '10px' }}>
                <div style={{ background: 'var(--surface2)', borderRadius: '4px', padding: '6px 8px' }}>
                  <div style={{ color: 'var(--text3)' }}>Onboarding</div>
                  <div style={{ fontWeight: '600', color: 'var(--text)' }}>{p['Onboarding Duration (days)']}d</div>
                </div>
                <div style={{ background: 'var(--surface2)', borderRadius: '4px', padding: '6px 8px' }}>
                  <div style={{ color: 'var(--text3)' }}>Ticket time</div>
                  <div style={{ fontWeight: '600', color: p['Avg Ticket Resolution Time (hrs)'] > 25 ? 'var(--clr-critical)' : 'var(--text)' }}>
                    {p['Avg Ticket Resolution Time (hrs)']}h
                  </div>
                </div>
                <div style={{ background: 'var(--surface2)', borderRadius: '4px', padding: '6px 8px' }}>
                  <div style={{ color: 'var(--text3)' }}>Escalations</div>
                  <div style={{ fontWeight: '600', color: 'var(--text)' }}>{p['# Escalations'] !== '' ? p['# Escalations'] : '—'}</div>
                </div>
                <div style={{ background: 'var(--surface2)', borderRadius: '4px', padding: '6px 8px' }}>
                  <div style={{ color: 'var(--text3)' }}>IT vs mkt</div>
                  <div style={{ fontWeight: '600', color: p.it_vs_mkt > 1 ? 'var(--clr-critical)' : p.it_vs_mkt < -1 ? 'var(--clr-good)' : 'var(--text)' }}>
                    {p.it_vs_mkt > 0 ? '+' : ''}{p.it_vs_mkt}d
                  </div>
                </div>
              </div>

              {/* Satisfaction rating */}
              <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>Satisfaction:</span>
                <span style={{ display: 'inline-flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <span 
                      key={i} 
                      style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '1px', 
                        background: i <= Math.round(p['Satisfaction Score (1-5)']) ? 'var(--accent)' : 'var(--border)' 
                      }}
                    ></span>
                  ))}
                </span>
                <span style={{ color: 'var(--text)', fontWeight: '500', marginLeft: '2px' }}>{p['Satisfaction Score (1-5)']}</span>
              </div>

              <div style={{ fontSize: '11px', marginBottom: '8px', color: 'var(--text)' }}>
                <span style={{ color: 'var(--text3)' }}>Delay:</span> {p['Primary Delay Reason']} · <span style={{ color: 'var(--text3)' }}>Esc:</span> {p['Escalation Type']}
              </div>

              <div style={{ background: '#22cdff1a', borderRadius: '4px', padding: '6px 8px', fontSize: '11px', color: '#22cdff', fontWeight: '500' }}>
                {p.next_action}
              </div>

              <div style={{ display: 'flex', gap: '4px', marginTop: '8px', fontSize: '10px', color: 'var(--text3)' }}>
                <span style={{ background: 'var(--surface2)', padding: '2px 5px', borderRadius: '3px' }}>Burden: {p.escalation_burden}</span>
                <span style={{ background: 'var(--surface2)', padding: '2px 5px', borderRadius: '3px' }}>Efficiency: {p.support_efficiency || '—'}</span>
                <span style={{ background: 'var(--surface2)', padding: '2px 5px', borderRadius: '3px' }}>IT share: {p.it_share}%</span>
              </div>
            </div>
          )})}
      </div>
    </div>
  );
}
