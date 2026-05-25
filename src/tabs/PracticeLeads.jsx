import React, { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { 
  ArrowLeft, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  User, 
  Check, 
  Sliders,
  AlertCircle
} from 'lucide-react';

export default function PracticeLeads() {
  const {
    providers,
    selectedProviderId,
    setSelectedProviderId,
    activeQuarter
  } = useDashboard();

  // Local view filters
  const [activeFilter, setActiveFilter] = useState('all'); // all, breached, onboarding, completed
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('risk'); // risk, completion, duration, name
  const [sortAsc, setSortAsc] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // grid, list

  // Status-based provider counts
  const counts = useMemo(() => {
    return {
      all: providers.length,
      breached: providers.filter(p => p['SLA Breach (Y/N)'] === 'Y').length,
      onboarding: providers.filter(p => p['SLA Breach (Y/N)'] === 'N' && p.risk_score >= 1).length,
      completed: providers.filter(p => p['SLA Breach (Y/N)'] === 'N' && p.risk_score === 0).length,
    };
  }, [providers]);

  // Filtered and sorted providers
  const processedProviders = useMemo(() => {
    let result = [...providers];

    // Status pill filter
    if (activeFilter === 'breached') {
      result = result.filter(p => p['SLA Breach (Y/N)'] === 'Y');
    } else if (activeFilter === 'onboarding') {
      result = result.filter(p => p['SLA Breach (Y/N)'] === 'N' && p.risk_score >= 1);
    } else if (activeFilter === 'completed') {
      result = result.filter(p => p['SLA Breach (Y/N)'] === 'N' && p.risk_score === 0);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p['Provider ID'].toLowerCase().includes(q) ||
        p.ProviderName.toLowerCase().includes(q) ||
        p.Market.toLowerCase().includes(q) ||
        p['Primary Delay Reason'].toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      let valA, valB;
      if (sortBy === 'risk') {
        valA = a.calculated_risk_index;
        valB = b.calculated_risk_index;
      } else if (sortBy === 'completion') {
        valA = a['% Tasks Completed On Time'] || 0;
        valB = b['% Tasks Completed On Time'] || 0;
      } else if (sortBy === 'duration') {
        valA = a['Onboarding Duration (days)'];
        valB = b['Onboarding Duration (days)'];
      } else if (sortBy === 'name') {
        valA = a.ProviderName;
        valB = b.ProviderName;
      }

      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else {
        return sortAsc ? valA - valB : valB - valA;
      }
    });

    return result;
  }, [providers, activeFilter, searchQuery, sortBy, sortAsc]);

  // Find currently selected provider details
  const selectedProvider = useMemo(() => {
    return providers.find(p => p['Provider ID'] === selectedProviderId);
  }, [providers, selectedProviderId]);

  // Risk styling helpers
  const getRiskDetails = (score) => {
    if (score >= 70) return { label: 'Critical',     class: 'critical', text: 'var(--clr-critical)', bg: 'var(--clr-critical-bg)', border: 'var(--clr-critical-border)' };
    if (score >= 40) return { label: 'Medium Risk',  class: 'warn',     text: 'var(--clr-warn)',     bg: 'var(--clr-warn-bg)',     border: 'var(--clr-warn-border)' };
    return              { label: 'Low Risk',     class: 'good',     text: 'var(--clr-good)',     bg: 'var(--clr-good-bg)',     border: 'var(--clr-good-border)' };
  };

  const handleSort = (type) => {
    if (sortBy === type) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(type);
      setSortAsc(type === 'name' ? true : false); // Default desc for numeric, asc for name
    }
  };

  // RENDER DETAILED VIEW
  if (selectedProviderId && selectedProvider) {
    const p = selectedProvider;
    const risk = getRiskDetails(p.calculated_risk_index);
    const isBreached = p['SLA Breach (Y/N)'] === 'Y';

    // Risk factors check thresholds
    const isItDelay = p['Primary Delay Reason'] === 'IT Access' || p['IT Provisioning Days'] > 7;
    const isTicketSlow = p['Avg Ticket Resolution Time (hrs)'] > 22;
    const isTaskLow = p['% Tasks Completed On Time'] < 80;
    const isEscHigh = p['# Escalations'] >= 3;

    return (
      <div className="page active" id="page-leads-detail" style={{ animation: 'fadeIn 0.25s ease-out' }}>
        {/* Detail Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={() => setSelectedProviderId(null)}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                borderRadius: '8px',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              className="back-btn"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 style={{ fontFamily: "var(--font-serif)", fontSize: '32px', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {p.ProviderName}
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '2px' }}>
                {p.Market} Market · Provider ID: {p['Provider ID']}
              </p>
            </div>
          </div>
          <span 
            className="risk-pill" 
            style={{
              background: risk.bg,
              border: `1px solid ${risk.border}`,
              color: risk.text,
              padding: '6px 14px',
              borderRadius: '99px',
              fontWeight: '700',
              fontFamily: "var(--font-mono)",
              fontSize: '14px'
            }}
          >
            {p.calculated_risk_index} {risk.label}
          </span>
        </div>

        {/* SLA Breach Alert Banner */}
        {isBreached && (
          <div 
            style={{
              background: 'var(--clr-critical-bg)',
              border: '1px solid var(--clr-critical-border)',
              borderRadius: '10px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              marginBottom: '20px'
            }}
          >
            <AlertCircle size={18} color="var(--clr-critical)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ color: 'var(--clr-critical)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                SLA Breach
              </div>
              <div style={{ color: 'var(--clr-critical)', fontSize: '13px', marginTop: '4px', lineHeight: '1.5', opacity: 0.85 }}>
                This provider breached SLA. Onboarding took <strong>{p['Onboarding Duration (days)']} days</strong> (threshold ~21 days).
              </div>
            </div>
          </div>
        )}

        {/* KPI Strip */}
        <div className="kpi-strip" style={{ marginBottom: '20px', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="kpi-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px' }}>
            <div className="kpi-label" style={{ color: 'var(--text3)' }}>Task Completion</div>
            <div className="kpi-value" style={{ color: 'var(--text)', fontSize: '36px' }}>{p['% Tasks Completed On Time']}%</div>
          </div>
          <div className="kpi-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px' }}>
            <div className="kpi-label" style={{ color: 'var(--text3)' }}>Escalations</div>
            <div className="kpi-value" style={{ color: 'var(--text)', fontSize: '36px' }}>{p['# Escalations'] || 0}</div>
          </div>
          <div className="kpi-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px' }}>
            <div className="kpi-label" style={{ color: 'var(--text3)' }}>Onboarding Duration</div>
            <div className="kpi-value" style={{ color: 'var(--text)', fontSize: '36px' }}>{p['Onboarding Duration (days)']}<span>d</span></div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>Started {p['Start Date']}</div>
          </div>
          <div className="kpi-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px' }}>
            <div className="kpi-label" style={{ color: 'var(--text3)' }}>Satisfaction Score</div>
            <div className="kpi-value" style={{ color: 'var(--text)', fontSize: '36px' }}>{p['Satisfaction Score (1-5)'] || '—'}<span>/5.0</span></div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>Out of 5.0</div>
          </div>
        </div>

        {/* ── Onboarding Pipeline Breakdown ── */}
        <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', marginBottom: '20px', padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div className="card-title" style={{ color: 'var(--text)', fontSize: '14px' }}>Onboarding Pipeline Breakdown</div>
            <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Total: {p['Onboarding Duration (days)']} days</span>
          </div>
          {/* Segmented bar */}
          {(() => {
            const total = (p['Contracting Days'] || 0) + (p['IT Provisioning Days'] || 0) + (p['Compliance Days'] || 0) + (p['Training Days'] || 0);
            const steps = [
              { label: 'Contracting',  key: 'Contracting Days',          color: 'var(--clr-good)',     days: p['Contracting Days'] || 0 },
              { label: 'IT Provisioning', key: 'IT Provisioning Days',   color: 'var(--clr-critical)', days: p['IT Provisioning Days'] || 0 },
              { label: 'Compliance',  key: 'Compliance Days',            color: 'var(--clr-warn)',     days: p['Compliance Days'] || 0 },
              { label: 'Training',    key: 'Training Days',              color: 'var(--clr-caution)',  days: p['Training Days'] || 0 },
            ];
            return (
              <>
                <div style={{ display: 'flex', height: '10px', borderRadius: '6px', overflow: 'hidden', gap: '2px', marginBottom: '12px' }}>
                  {steps.map((s, i) => (
                    <div
                      key={i}
                      style={{ flex: s.days / (total || 1), background: s.color, opacity: 0.88, minWidth: s.days > 0 ? '4px' : '0' }}
                      title={`${s.label}: ${s.days}d`}
                    />
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
                  {steps.map((s, i) => (
                    <div key={i} style={{ background: 'var(--surface2)', borderRadius: '6px', padding: '8px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: s.color, flexShrink: 0 }} />
                        <span style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</span>
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text)', fontFamily: 'var(--font-serif)' }}>{s.days}<span style={{ fontSize: '11px', fontWeight: '400', color: 'var(--text3)' }}>d</span></div>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>

        {/* ── Derived Intelligence Metrics ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
          {/* Ticket Time */}
          <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Avg Ticket Time</div>
            <div style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'var(--font-serif)', color: p['Avg Ticket Resolution Time (hrs)'] > 25 ? 'var(--clr-critical)' : 'var(--text)' }}>
              {p['Avg Ticket Resolution Time (hrs)']}<span style={{ fontSize: '12px', fontWeight: '400', color: 'var(--text3)' }}>h</span>
            </div>
            <div style={{ fontSize: '10px', color: p['Avg Ticket Resolution Time (hrs)'] > 25 ? 'var(--clr-critical)' : 'var(--clr-good)', marginTop: '4px', fontWeight: '500' }}>
              {p['Avg Ticket Resolution Time (hrs)'] > 25 ? '↑ Above 22h threshold' : '✓ Within threshold'}
            </div>
          </div>
          {/* IT vs Market */}
          <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>IT vs Market Avg</div>
            <div style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'var(--font-serif)', color: p.it_vs_mkt > 1 ? 'var(--clr-critical)' : p.it_vs_mkt < -1 ? 'var(--clr-good)' : 'var(--text)' }}>
              {p.it_vs_mkt > 0 ? '+' : ''}{p.it_vs_mkt}<span style={{ fontSize: '12px', fontWeight: '400', color: 'var(--text3)' }}>d</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '4px' }}>Δ from {p.Market} market median</div>
          </div>
          {/* Escalation Burden */}
          <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Esc Burden Score</div>
            <div style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'var(--font-serif)', color: 'var(--text)' }}>{p.escalation_burden || '—'}</div>
            <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '4px' }}>Escalations × ticket time</div>
          </div>
          {/* Support Efficiency */}
          <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Support Efficiency</div>
            <div style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'var(--font-serif)', color: 'var(--text)' }}>{p.support_efficiency || '—'}</div>
            <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '4px' }}>Tasks done ÷ ticket time</div>
          </div>
        </div>

        {/* ── Context Chips row ── */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '500' }}>Context:</span>
          <span style={{ background: 'var(--clr-caution-bg)', color: 'var(--clr-caution)', border: '1px solid var(--clr-caution-border)', borderRadius: '99px', padding: '3px 12px', fontSize: '11px', fontWeight: '600' }}>
            Delay: {p['Primary Delay Reason'] || '—'}
          </span>
          <span style={{ background: 'var(--clr-warn-bg)', color: 'var(--clr-warn)', border: '1px solid var(--clr-warn-border)', borderRadius: '99px', padding: '3px 12px', fontSize: '11px', fontWeight: '600' }}>
            Esc Type: {p['Escalation Type'] || '—'}
          </span>
          <span style={{ background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)', borderRadius: '99px', padding: '3px 12px', fontSize: '11px', fontWeight: '500' }}>
            IT Share: {p.it_share || '—'}%
          </span>
          {/* Satisfaction pips */}
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Satisfaction</span>
            <span style={{ display: 'inline-flex', gap: '3px' }}>
              {[1,2,3,4,5].map(i => (
                <span key={i} style={{ width: '10px', height: '10px', borderRadius: '2px', background: i <= Math.round(p['Satisfaction Score (1-5)'] || 0) ? 'var(--accent)' : 'var(--border)', transition: 'background 0.2s' }} />
              ))}
            </span>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)' }}>{p['Satisfaction Score (1-5)'] || '—'}/5</span>
          </span>
        </div>

        {/* ── Next Action Recommendation ── */}
        {p.next_action && (
          <div style={{ background: 'var(--clr-warn-bg)', border: '1px solid var(--clr-warn-border)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '16px' }}>→</span>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--clr-warn)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>Recommended Next Action</div>
              <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '500' }}>{p.next_action}</div>
            </div>
          </div>
        )}

        {/* Risk Factors Panel */}
        <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', marginBottom: '20px', padding: '24px' }}>
          <div className="card-header" style={{ marginBottom: '20px' }}>
            <div className="card-title" style={{ color: 'var(--text)', fontSize: '15px' }}>Risk Factors</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Factor 1 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: '500', color: 'var(--text)', fontSize: '13px' }}>IT Access Delay</div>
                <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>First breach predictor when combined with slow tickets</div>
              </div>
              <span style={{
                background: isItDelay ? 'var(--clr-critical-bg)' : 'var(--clr-good-bg)',
                color: isItDelay ? 'var(--clr-critical)' : 'var(--clr-good)',
                border: `1px solid ${isItDelay ? 'var(--clr-critical-border)' : 'var(--clr-good-border)'}`,
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                {isItDelay ? '✓ Yes' : 'No'}
              </span>
            </div>

            {/* Factor 2 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: '500', color: 'var(--text)', fontSize: '13px' }}>Ticket Resolution Time</div>
                <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>{p['Avg Ticket Resolution Time (hrs)']}h (threshold &gt; 22h = slow)</div>
              </div>
              <span style={{
                background: isTicketSlow ? 'var(--clr-critical-bg)' : 'var(--clr-good-bg)',
                color: isTicketSlow ? 'var(--clr-critical)' : 'var(--clr-good)',
                border: `1px solid ${isTicketSlow ? 'var(--clr-critical-border)' : 'var(--clr-good-border)'}`,
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                {isTicketSlow ? 'Slow' : 'On Track'}
              </span>
            </div>

            {/* Factor 3 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: '500', color: 'var(--text)', fontSize: '13px' }}>Task Completion Rate</div>
                <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>{p['% Tasks Completed On Time']}% (threshold &lt; 80% = low)</div>
              </div>
              <span style={{
                background: isTaskLow ? 'var(--clr-caution-bg)' : 'var(--clr-good-bg)',
                color: isTaskLow ? 'var(--clr-caution)' : 'var(--clr-good)',
                border: `1px solid ${isTaskLow ? 'var(--clr-caution-border)' : 'var(--clr-good-border)'}`,
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                {isTaskLow ? 'Low' : 'Excellent'}
              </span>
            </div>

            {/* Factor 4 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '500', color: 'var(--text)', fontSize: '13px' }}>Escalation Count</div>
                <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>{p['# Escalations'] || 0} (threshold 3+ = high)</div>
              </div>
              <span style={{
                background: isEscHigh ? 'var(--clr-critical-bg)' : 'var(--clr-good-bg)',
                color: isEscHigh ? 'var(--clr-critical)' : 'var(--clr-good)',
                border: `1px solid ${isEscHigh ? 'var(--clr-critical-border)' : 'var(--clr-good-border)'}`,
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                {isEscHigh ? 'High' : 'On Track'}
              </span>
            </div>
          </div>
        </div>

        {/* Tasks + Escalations Split Workspace */}
        <div className="grid-2" style={{ gap: '20px' }}>
          {/* Tasks Progress Panel */}
          <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '24px' }}>
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <div className="card-title" style={{ color: 'var(--text)', fontSize: '14px' }}>Tasks</div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text3)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <span>Overall Progress</span>
                <span>{p['% Tasks Completed On Time'] >= 85 ? '2/3' : '1/3'}</span>
              </div>
              <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${p['% Tasks Completed On Time']}%`, 
                    background: 'var(--clr-good)', 
                    borderRadius: '99px' 
                  }}
                ></div>
              </div>
            </div>

            {/* Task Checklist items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <Clock size={16} color="#f59e0b" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500', color: 'var(--text)', fontSize: '13px' }}>IT Access Setup</div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>it-access · Due 1/5/2025</div>
                </div>
                <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: '500' }}>In-Progress</span>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <CheckCircle size={16} color="var(--clr-good)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500', color: 'var(--text)', fontSize: '13px' }}>Documentation Review</div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>documentation · Due 25/4/2025</div>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--clr-good)', fontWeight: '500' }}>Completed</span>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <Clock size={16} color="#8c8a84" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500', color: 'var(--text2)', fontSize: '13px' }}>Training Session</div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>training · Due 8/5/2025</div>
                </div>
                <span style={{ fontSize: '11px', color: '#8c8a84', fontWeight: '500' }}>Pending</span>
              </div>
            </div>
          </div>

          {/* Escalations Center */}
          <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '24px' }}>
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <div className="card-title" style={{ color: 'var(--text)', fontSize: '14px' }}>Escalations</div>
            </div>
            {p['# Escalations'] > 0 ? (
              <div 
                style={{ 
                  background: 'var(--clr-critical-bg)',
                  border: '1px solid var(--clr-critical-border)',
                  borderRadius: '6px', 
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}
              >
                <div>
                  <div style={{ color: 'var(--clr-critical)', fontWeight: '500', fontSize: '13px' }}>
                    IT Access provisioning delayed by {p['IT Provisioning Days'] > 6 ? Math.round(p['IT Provisioning Days'] - 4) : 2} days
                  </div>
                  <div style={{ color: 'var(--text3)', fontSize: '11px', marginTop: '6px' }}>
                    {p['Start Date']} · Type: {p['Escalation Type'] || '—'}
                  </div>
                </div>
                <span style={{ background: 'var(--clr-critical)', color: '#fff', fontSize: '9px', fontWeight: '700', padding: '2px 6px', borderRadius: '3px', letterSpacing: '0.04em' }}>
                  HIGH
                </span>
              </div>
            ) : (
              <div style={{ color: 'var(--text3)', fontSize: '12px', fontStyle: 'italic', padding: '12px 0' }}>
                No active escalations recorded for this provider in {activeQuarter}.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // RENDER GRID LIST VIEW (Image 2)
  return (
    <div className="page active" id="page-leads" style={{ animation: 'fadeIn 0.25s ease-out' }}>
      {/* Title & Top Right Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: '28px', fontWeight: '700', color: 'var(--text)' }}>
            Practice Lead Dashboard
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '2px' }}>
            Manage and monitor your provider pool
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Grid/List View Toggle */}
          <div style={{ display: 'flex', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '2px' }}>
            <button 
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? 'var(--surface)' : 'transparent',
                border: 'none',
                color: 'var(--text)',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              Grid
            </button>
            <button 
              onClick={() => setViewMode('list')}
              style={{
                background: viewMode === 'list' ? 'var(--surface)' : 'transparent',
                border: 'none',
                color: 'var(--text)',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Search Box Input (Image 2 style) */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <input 
          type="text" 
          placeholder="Search by Provider ID, market, or delay reason..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '12px 16px 12px 42px',
            color: 'var(--text)',
            fontSize: '13px',
            fontFamily: "var(--font-sans)",
            outline: 'none',
            transition: 'border-color 0.15s'
          }}
          className="lead-search-box"
        />
        <Search 
          size={16} 
          color="var(--text3)" 
          style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} 
        />
      </div>

      {/* Pill Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button 
          className={`filter-pill-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All Providers ({counts.all})
        </button>
        <button 
          className={`filter-pill-btn ${activeFilter === 'breached' ? 'active' : ''}`}
          onClick={() => setActiveFilter('breached')}
        >
          Breached ({counts.breached})
        </button>
        <button 
          className={`filter-pill-btn ${activeFilter === 'onboarding' ? 'active' : ''}`}
          onClick={() => setActiveFilter('onboarding')}
        >
          Onboarding ({counts.onboarding})
        </button>
        <button 
          className={`filter-pill-btn ${activeFilter === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveFilter('completed')}
        >
          Completed ({counts.completed})
        </button>
      </div>

      {/* Sort Options Strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', fontSize: '12px' }}>
        <span style={{ color: 'var(--text3)', fontWeight: '500' }}>Sort by:</span>
        <button 
          className={`sort-pill-btn ${sortBy === 'risk' ? 'active' : ''}`}
          onClick={() => handleSort('risk')}
        >
          Risk {sortBy === 'risk' && (sortAsc ? '↑' : '↓')}
        </button>
        <button 
          className={`sort-pill-btn ${sortBy === 'completion' ? 'active' : ''}`}
          onClick={() => handleSort('completion')}
        >
          Completion {sortBy === 'completion' && (sortAsc ? '↑' : '↓')}
        </button>
        <button 
          className={`sort-pill-btn ${sortBy === 'duration' ? 'active' : ''}`}
          onClick={() => handleSort('duration')}
        >
          Duration {sortBy === 'duration' && (sortAsc ? '↑' : '↓')}
        </button>
        <button 
          className={`sort-pill-btn ${sortBy === 'name' ? 'active' : ''}`}
          onClick={() => handleSort('name')}
        >
          ID {sortBy === 'name' && (sortAsc ? '↑' : '↓')}
        </button>
      </div>

      {/* Showing count text */}
      <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '16px', fontFamily: "var(--font-mono)" }}>
        Showing {processedProviders.length} of {counts.all} providers
      </div>

      {/* Providers Grid / List View */}
      {viewMode === 'grid' ? (
        <div className="provider-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {processedProviders.map(p => {
            const risk = getRiskDetails(p.calculated_risk_index);
            const hasSlowTicket = p['Avg Ticket Resolution Time (hrs)'] > 22;
            
            return (
              <div 
                key={p['Provider ID']}
                onClick={() => setSelectedProviderId(p['Provider ID'])}
                className="workbench-card"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '18px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  position: 'relative'
                }}
              >
                {/* Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>
                      {p.ProviderName}
                    </h3>
                    <span style={{ fontSize: '11px', color: 'var(--text3)', display: 'block', marginTop: '2px' }}>
                      {p.Market} Market
                    </span>
                  </div>
                  
                  {/* Risk Badge */}
                  <span 
                    style={{
                      background: risk.bg,
                      border: `1px solid ${risk.border}`,
                      color: risk.text,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      fontFamily: "var(--font-mono)"
                    }}
                  >
                    {p.calculated_risk_index} {risk.label.split(' ')[0]}
                  </span>
                </div>

                {/* Progress Rows Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  {/* Task completion row */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text3)', marginBottom: '4px' }}>
                      <span>Task Completion</span>
                      <span style={{ color: 'var(--text)', fontWeight: '500' }}>{p['% Tasks Completed On Time']}%</span>
                    </div>
                    <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${p['% Tasks Completed On Time']}%`, background: 'var(--clr-good)', borderRadius: '2px' }}></div>
                    </div>
                  </div>

                  {/* Escalations row */}
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text3)', marginBottom: '2px' }}>Escalations</div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>{p['# Escalations'] || 0}</div>
                  </div>

                  {/* Onboarding duration */}
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text3)', marginBottom: '2px' }}>Duration</div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>{p['Onboarding Duration (days)']}d</div>
                  </div>

                  {/* Satisfaction */}
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text3)', marginBottom: '2px' }}>Satisfaction</div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>{p['Satisfaction Score (1-5)'] || '—'}</div>
                  </div>
                </div>

                {/* Delay Capsules under card */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                  <span className="delay-capsule">{p['Primary Delay Reason']}</span>
                  {hasSlowTicket && <span className="delay-capsule" style={{ color: '#f59e0b' }}>Slow Ticket Resolution</span>}
                </div>
              </div>
            );
          })}

          {processedProviders.length === 0 && (
            <div style={{ gridColumn: 'span 3', textAlign: 'center', color: 'var(--text3)', padding: '40px 0', fontSize: '13px', border: '1px dashed var(--border)', borderRadius: '8px' }}>
              No providers found matching your active filter criteria.
            </div>
          )}
        </div>
      ) : (
        <div className="tbl-wrap">
          <table className="data-tbl">
            <thead>
              <tr>
                <th style={{ fontFamily: 'var(--font-sans)', fontWeight: '600' }}>Provider</th>
                <th style={{ fontFamily: 'var(--font-sans)', fontWeight: '600' }}>Market</th>
                <th style={{ textAlign: 'center', fontFamily: 'var(--font-sans)', fontWeight: '600' }}>Risk Score</th>
                <th style={{ fontFamily: 'var(--font-sans)', fontWeight: '600' }}>Task Completion</th>
                <th style={{ textAlign: 'center', fontFamily: 'var(--font-sans)', fontWeight: '600' }}>Escalations</th>
                <th style={{ textAlign: 'center', fontFamily: 'var(--font-sans)', fontWeight: '600' }}>Duration</th>
                <th style={{ textAlign: 'center', fontFamily: 'var(--font-sans)', fontWeight: '600' }}>Satisfaction</th>
                <th style={{ fontFamily: 'var(--font-sans)', fontWeight: '600' }}>Primary Delay Reason</th>
              </tr>
            </thead>
            <tbody>
              {processedProviders.map(p => {
                const risk = getRiskDetails(p.calculated_risk_index);
                const hasSlowTicket = p['Avg Ticket Resolution Time (hrs)'] > 22;
                
                return (
                  <tr 
                    key={p['Provider ID']} 
                    onClick={() => setSelectedProviderId(p['Provider ID'])}
                    style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                  >
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--text)' }}>{p.ProviderName}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '2px' }}>ID: {p['Provider ID']}</div>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text2)' }}>{p.Market}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <span 
                        style={{
                          background: risk.bg,
                          border: `1px solid ${risk.border}`,
                          color: risk.text,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          fontFamily: "var(--font-mono)",
                          display: 'inline-block'
                        }}
                      >
                        {p.calculated_risk_index} {risk.label.split(' ')[0]}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', width: '160px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: '1', height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${p['% Tasks Completed On Time']}%`, background: 'var(--clr-good)', borderRadius: '2px' }}></div>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text)', fontWeight: '500', width: '32px', textAlign: 'right' }}>
                          {p['% Tasks Completed On Time']}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', color: 'var(--text2)' }}>{p['# Escalations'] || 0}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', color: 'var(--text2)' }}>{p['Onboarding Duration (days)']}d</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', color: 'var(--text2)' }}>{p['Satisfaction Score (1-5)'] || '—'}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <span className="delay-capsule" style={{ margin: '0' }}>{p['Primary Delay Reason']}</span>
                        {hasSlowTicket && <span className="delay-capsule" style={{ color: '#f59e0b', margin: '0' }}>Slow Ticket</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {processedProviders.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text3)', padding: '40px 0', fontSize: '13px' }}>
                    No providers found matching your active filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
