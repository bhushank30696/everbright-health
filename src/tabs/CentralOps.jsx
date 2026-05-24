import React, { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';

export default function CentralOps() {
  const {
    activeState,
    activeQuarter,
    providers,
    dashboardData
  } = useDashboard();

  const { kpis, market_summary, delay_reasons, escalation_types, step_avgs, monthly_trend } = dashboardData;

  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const sortedMarkets = useMemo(() => {
    const baseMarkets = [
      { id: 'TX', name: 'Texas',      color: 'var(--clr-critical)' },
      { id: 'CA', name: 'California', color: 'var(--clr-warn)' },
      { id: 'FL', name: 'Florida',    color: 'var(--clr-good)' }
    ].map(m => {
      const summary = market_summary.find(s => s.Market === m.id) || {
        providers: 0, breach_rate: 0, avg_onboarding: 0, avg_it_days: 0, avg_ticket: 0, avg_sat: 0, avg_esc: 0, avg_burden: 0, avg_efficiency: 0
      };
      return { ...m, ...summary };
    });

    if (!sortKey) return baseMarkets;

    return [...baseMarkets].sort((a, b) => {
      const valA = a[sortKey] ?? 0;
      const valB = b[sortKey] ?? 0;
      if (sortOrder === 'asc') {
        return valA > valB ? 1 : valA < valB ? -1 : 0;
      } else {
        return valA < valB ? 1 : valA > valB ? -1 : 0;
      }
    });
  }, [market_summary, sortKey, sortOrder]);

  const signals = useMemo(() => {
    const alerts = {
      'Q1': [
        { color: 'var(--clr-critical)', text: '<strong>TX breaches 60% despite shortest onboarding (23d).</strong> It is a process compliance gap — not a capacity problem. Needs execution intervention, not more time.' },
        { color: 'var(--clr-caution)',  text: '<strong>CA\'s IT provisioning averages 7.7 days</strong> — highest of any market. IT Access + Compliance escalation combo produces 80% breach rate.' },
        { color: 'var(--clr-caution)',  text: '<strong>FL\'s breach cluster is driven by slow ticket resolution (22.3h avg).</strong> Every provider above 25h ticket time breached — 6 of 6.' },
        { color: 'var(--clr-warn)',     text: '<strong>Operations escalation type = 67% breach rate</strong> — the most dangerous escalation pathway. Routing and escalation workflows need audit.' }
      ],
      'Q2': [
        { color: 'var(--clr-good)',     text: '<strong>TX breach rate dropped to 45% (down 15%).</strong> Compliance enforcement started working, though scheduling latency remains.' },
        { color: 'var(--clr-good)',     text: '<strong>CA IT provisioning bottleneck reduced to 5.8 days.</strong> The new access workflows launched mid-quarter show positive signal.' },
        { color: 'var(--clr-caution)',  text: '<strong>FL ticket speed improved by 15%, resolving in 19h avg.</strong> However, vendor SLAs are still causing 20% of delay breaches.' },
        { color: 'var(--clr-good)',     text: '<strong>Support efficiency improved across CA and FL.</strong> Tasks completed per hour rose by 10%, directly explaining lower breaches.' }
      ],
      'Q3': [
        { color: 'var(--clr-critical)', text: '<strong>Intake volume surged by 38% (45 active providers).</strong> Operations capacity was exceeded, causing global SLA breach spike.' },
        { color: 'var(--clr-critical)', text: '<strong>CA IT provisioning spiked back to 8.2 days.</strong> Queue congestion under heavy load is the clear culprit. Automation plans should accelerate.' },
        { color: 'var(--clr-critical)', text: '<strong>FL ticket resolution times rose to 24h.</strong> High-volume ticket clusters are driving 50% of the state\'s breaches.' },
        { color: 'var(--clr-caution)',  text: '<strong>Texas compliance breaches reached 65%.</strong> High intake velocity combined with slow handoffs created critical path failures.' }
      ],
      'Q4': [
        { color: 'var(--clr-good)',     text: '<strong>IT provisioning automation success!</strong> Average IT days dropped to a historic low of 4.2d. CA breaches fell by 70%.' },
        { color: 'var(--clr-good)',     text: '<strong>FL ticket resolution time reached 14.5 hours.</strong> Service desk restructuring eliminated ticket-driven breaches completely.' },
        { color: 'var(--clr-good)',     text: '<strong>Texas breach rate fell to 18%.</strong> Transition to auto-scheduling and compliance checkpoints on-time removed the critical bottlenecks.' },
        { color: 'var(--clr-good)',     text: '<strong>Global onboarding average reaches 19.5 days.</strong> The entire portfolio is now under the 21-day target for the first time.' }
      ]
    };
    return alerts[activeQuarter] || [];
  }, [activeQuarter]);

  return (
    <div className="page active" id="page-ops" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div className="page-header">
        <h1>Operational Command Center</h1>
        <p>Portfolio-level visibility across all markets · SLA health · Bottleneck identification · Resource signals</p>
        <div className="meta">
          DATASET: {kpis.total_providers} PROVIDERS
        </div>
      </div>

      {/* KPI STRIP */}
      <div className="kpi-strip">
        {/* KPI 1 */}
        <div className={`kpi-card ${kpis.avg_onboarding > 21.0 ? 'warn' : 'green'}`}>
          <div className="kpi-label">Avg Onboarding</div>
          <div className="kpi-value">{kpis.avg_onboarding}<span>d</span></div>
          <div className="kpi-sub">Target: &lt;21 days</div>
          <div className={`kpi-badge ${kpis.avg_onboarding > 21.0 ? 'warn' : 'good'}`}>
            {kpis.avg_onboarding > 21.0 
              ? `${Math.round((kpis.avg_onboarding - 21.0) * 10) / 10}d over target`
              : `${Math.round((21.0 - kpis.avg_onboarding) * 10) / 10}d under target`
            }
          </div>
        </div>

        {/* KPI 2 */}
        <div className={`kpi-card ${kpis.sla_breach_pct >= 45 ? 'red' : kpis.sla_breach_pct >= 30 ? 'amber' : 'green'}`}>
          <div className="kpi-label">SLA Breach Rate</div>
          <div className="kpi-value">{kpis.sla_breach_pct}<span>%</span></div>
          <div className="kpi-sub">
            {providers.filter(p => p['SLA Breach (Y/N)'] === 'Y').length} of {kpis.total_providers} providers
          </div>
          <div className={`kpi-badge ${kpis.sla_breach_pct >= 45 ? 'bad' : kpis.sla_breach_pct >= 30 ? 'warn' : 'good'}`}>
            {kpis.sla_breach_pct >= 45 ? 'Critical' : kpis.sla_breach_pct >= 30 ? 'Elevated' : 'Excellent'}
          </div>
        </div>

        {/* KPI 3 */}
        <div className={`kpi-card ${kpis.avg_satisfaction >= 4.0 ? 'green' : 'red'}`}>
          <div className="kpi-label">Avg Satisfaction</div>
          <div className="kpi-value">{kpis.avg_satisfaction}<span>/5</span></div>
          <div className="kpi-sub">Scale 1–5</div>
          <div className={`kpi-badge ${kpis.avg_satisfaction >= 4.4 ? 'good' : kpis.avg_satisfaction >= 4.0 ? 'good' : 'bad'}`}>
            {kpis.avg_satisfaction >= 4.4 ? 'Outstanding' : kpis.avg_satisfaction >= 4.0 ? 'Acceptable' : 'Substandard'}
          </div>
        </div>

        {/* KPI 4 */}
        <div className={`kpi-card ${kpis.avg_escalations >= 2.3 ? 'red' : kpis.avg_escalations >= 1.8 ? 'amber' : 'green'}`}>
          <div className="kpi-label">Avg Escalations</div>
          <div className="kpi-value">{kpis.avg_escalations}</div>
          <div className="kpi-sub">Per provider</div>
          <div className={`kpi-badge ${kpis.avg_escalations >= 2.3 ? 'bad' : kpis.avg_escalations >= 1.8 ? 'warn' : 'good'}`}>
            {kpis.avg_escalations >= 2.3 ? 'Critical' : kpis.avg_escalations >= 1.8 ? 'Elevated' : 'Optimal'}
          </div>
        </div>

        {/* KPI 5 */}
        <div className={`kpi-card ${kpis.at_risk_count >= 10 ? 'red' : kpis.at_risk_count >= 5 ? 'amber' : 'green'}`}>
          <div className="kpi-label">Providers At Risk</div>
          <div className="kpi-value">{kpis.at_risk_count}</div>
          <div className="kpi-sub">Risk score ≥ 2 of 3</div>
          <div className={`kpi-badge ${kpis.at_risk_count >= 10 ? 'bad' : kpis.at_risk_count >= 5 ? 'warn' : 'good'}`}>
            {kpis.at_risk_count >= 10 ? 'Needs action' : kpis.at_risk_count >= 5 ? 'Monitor' : 'Stable'}
          </div>
        </div>
      </div>

      {/* Strategic Signals */}
      <div className="insights-panel" style={{ marginBottom: '16px' }}>
        <h3>⚡ Strategic Signals</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {signals.map((s, idx) => (
            <div key={idx} className="insight-item" style={{ borderBottom: 'none', padding: '0px', display: 'flex', gap: '12px' }}>
              <div className="insight-dot" style={{ background: s.color, marginTop: '6px' }}></div>
              <div className="insight-text" dangerouslySetInnerHTML={{ __html: s.text }}></div>
            </div>
          ))}
        </div>
      </div>

      {/* ROW 2: Bottleneck + Step analysis */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">SLA Breach Rate by Delay Reason</div>
              <div className="card-sub">Primary bottleneck classification</div>
            </div>
            <span className="card-tag">BOTTLENECK</span>
          </div>
          <div className="hbar-wrap">
            {[...delay_reasons]
              .sort((a, b) => b.breach_rate - a.breach_rate)
              .map((r, idx) => {
                const pct = Math.round(r.breach_rate * 100);
                const color = pct >= 75 ? 'var(--clr-critical)' : pct >= 45 ? 'var(--clr-caution)' : 'var(--clr-good)';
                return (
                  <div key={idx} className="hbar-row">
                    <span className="hbar-label">{r['Primary Delay Reason']}</span>
                    <div className="hbar-track">
                      <div className="hbar-fill" style={{ width: `${pct}%`, background: color }}></div>
                    </div>
                    <span className="hbar-val" style={{ color: color }}>{pct}%</span>
                    <span style={{ fontSize: '11px', color: 'var(--text3)', marginLeft: '4px', width: '30px', textAlign: 'right' }}>
                      n={r.count}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Onboarding Step Composition</div>
              <div className="card-sub">Avg days per step — breach vs no breach</div>
            </div>
            <span className="card-tag">STEP ANALYSIS</span>
          </div>
          <div className="funnel-wrap">
            {['Contracting', 'IT Provisioning', 'Compliance', 'Training'].map((s, idx) => {
              const key = s + ' Days';
              const cleanProvs = providers.filter(p => p['SLA Breach (Y/N)'] === 'N');
              const breachedProvs = providers.filter(p => p['SLA Breach (Y/N)'] === 'Y');
              
              const avgClean = cleanProvs.length ? (cleanProvs.reduce((sum, p) => sum + p[key], 0) / cleanProvs.length) : 0;
              const avgBreached = breachedProvs.length ? (breachedProvs.reduce((sum, p) => sum + p[key], 0) / breachedProvs.length) : 0;
              
              const maxVal = 10;
              const cleanPct = (avgClean / maxVal) * 100;
              const breachPct = (avgBreached / maxVal) * 100;
              
              const diff = avgBreached - avgClean;
              const diffText = diff > 0 ? `+${Math.round(diff * 10) / 10}d` : `${Math.round(diff * 10) / 10}d`;
              const diffColor = diff > 0.5 ? 'var(--clr-critical)' : 'var(--text3)';

              return (
                <div key={idx} className="funnel-row">
                  <span className="funnel-label" style={{ color: (s === 'IT Provisioning' && diff > 0.5) ? 'var(--clr-critical)' : 'var(--text2)', fontWeight: (s === 'IT Provisioning' && diff > 0.5) ? '600' : 'normal' }}>
                    {s}
                  </span>
                  <div style={{ flex: '1' }}>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '3px' }}>
                      <div style={{ height: '14px', width: `${Math.max(10, cleanPct)}%`, background: '#D8D4CC', borderRadius: '3px', display: 'flex', alignItems: 'center', padding: '0 6px' }}>
                        <span style={{ fontSize: '9px', color: '#1A1915', fontWeight: '600' }}>No breach {Math.round(avgClean * 10) / 10}d</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <div style={{ height: '14px', width: `${Math.max(10, breachPct)}%`, background: diff > 0.5 ? '#fca5a5' : '#FECACA', borderRadius: '3px', display: 'flex', alignItems: 'center', padding: '0 6px' }}>
                        <span style={{ fontSize: '9px', color: diff > 0.5 ? '#991B1B' : '#1A1915', fontWeight: '600' }}>Breach {Math.round(avgBreached * 10) / 10}d</span>
                      </div>
                    </div>
                  </div>
                  <span className="funnel-days" style={{ color: diffColor }}>{diffText}</span>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--bg)' }}>
            IT Provisioning remains a core operational bottleneck driving the gap (+0.9d) between breach and non-breach cohorts.
          </div>
        </div>
      </div>

      {/* ROW 3: Escalation type + Month cohort trend */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Escalation Type → Breach Rate</div>
              <div className="card-sub">Operations type = highest risk pathway</div>
            </div>
          </div>
          <div className="esc-grid">
            {escalation_types.map((et, idx) => {
              const pct = Math.round(et.breach_rate * 100);
              const color = pct >= 60 ? 'var(--clr-critical)' : pct >= 40 ? 'var(--clr-caution)' : 'var(--clr-good)';
              return (
                <div key={idx} className="esc-row">
                  <span className="esc-type">{et['Escalation Type']}</span>
                  <div className="esc-bar-track">
                    <div className="hbar-fill" style={{ width: `${pct}%`, background: color }}></div>
                  </div>
                  <span className="esc-pct" style={{ color: color }}>{pct}%</span>
                  <span className="esc-count">n={et.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Cohort Trend by Start Month</div>
              <div className="card-sub">Breach rate variance across intake cohorts</div>
            </div>
          </div>
          <div>
            {monthly_trend.map((t, idx) => {
              const pct = Math.round(t.breach_rate * 100);
              const color = pct >= 50 ? 'var(--clr-critical)' : 'var(--clr-good)';
              return (
                <div key={idx} className="trend-item">
                  <span className="trend-month">{t.start_month.toUpperCase()}</span>
                  <div className="trend-bar-wrap">
                    <div className="trend-bar" style={{ width: `${Math.max(15, pct)}%`, background: color }}>
                      <span className="trend-bar-label">{pct}% breach</span>
                    </div>
                  </div>
                  <span className="trend-stat" style={{ color: color }}>{pct}%</span>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--bg)' }}>
            Intake cohort patterns reveal volume capacity constraints.
          </div>
        </div>
      </div>

      {/* Market Performance Overview Table */}
      <div className="card" style={{ marginTop: '16px' }}>
        <div className="card-header">
          <div>
            <div className="card-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: '700' }}>Market Performance Overview</div>
            <div className="card-sub">SLA breach rate, satisfaction & onboarding duration by market</div>
          </div>
          <span className="card-tag">COMPARATIVE</span>
        </div>
        <div className="tbl-wrap">
          <table className="data-tbl">
            <thead>
              <tr>
                <th style={{ fontFamily: 'var(--font-sans)', fontWeight: '600' }}>Market</th>
                <th 
                  onClick={() => handleSort('providers')}
                  style={{ textAlign: 'right', fontFamily: 'var(--font-sans)', fontWeight: '600', cursor: 'pointer', userSelect: 'none' }}
                >
                  Provider Count {sortKey === 'providers' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th 
                  onClick={() => handleSort('breach_rate')}
                  style={{ textAlign: 'right', fontFamily: 'var(--font-sans)', fontWeight: '600', cursor: 'pointer', userSelect: 'none' }}
                >
                  SLA Breach Rate {sortKey === 'breach_rate' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th 
                  onClick={() => handleSort('avg_onboarding')}
                  style={{ textAlign: 'right', fontFamily: 'var(--font-sans)', fontWeight: '600', cursor: 'pointer', userSelect: 'none' }}
                >
                  Avg Onboarding {sortKey === 'avg_onboarding' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th 
                  onClick={() => handleSort('avg_it_days')}
                  style={{ textAlign: 'right', fontFamily: 'var(--font-sans)', fontWeight: '600', cursor: 'pointer', userSelect: 'none' }}
                >
                  Avg IT Days {sortKey === 'avg_it_days' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th 
                  onClick={() => handleSort('avg_ticket')}
                  style={{ textAlign: 'right', fontFamily: 'var(--font-sans)', fontWeight: '600', cursor: 'pointer', userSelect: 'none' }}
                >
                  Avg Ticket Hrs {sortKey === 'avg_ticket' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th 
                  onClick={() => handleSort('avg_sat')}
                  style={{ textAlign: 'right', fontFamily: 'var(--font-sans)', fontWeight: '600', cursor: 'pointer', userSelect: 'none' }}
                >
                  Avg Satisfaction {sortKey === 'avg_sat' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th 
                  onClick={() => handleSort('avg_efficiency')}
                  style={{ textAlign: 'right', fontFamily: 'var(--font-sans)', fontWeight: '600', cursor: 'pointer', userSelect: 'none' }}
                >
                  Support Efficiency {sortKey === 'avg_efficiency' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedMarkets.map(m => {
                const isActive = activeState === 'all' || activeState === m.id;
                const opacity = isActive ? '1' : '0.35';
                const breachPct = Math.round(m.breach_rate * 100);
                
                return (
                  <tr key={m.id} style={{ opacity: opacity, transition: 'opacity 0.2s' }}>
                    <td style={{ fontWeight: '600', padding: '12px 14px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: m.color, display: 'inline-block' }} />
                        {m.name}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-sans)', padding: '12px 14px' }}>{m.providers}</td>
                    <td style={{ textAlign: 'right', color: breachPct >= 50 ? 'var(--clr-critical)' : 'var(--clr-good)', fontWeight: '600', fontFamily: 'var(--font-sans)', padding: '12px 14px' }}>
                      {breachPct}%
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-sans)', padding: '12px 14px' }}>{m.avg_onboarding}d</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-sans)', padding: '12px 14px' }}>{m.avg_it_days}d</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-sans)', padding: '12px 14px' }}>{m.avg_ticket}h</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-sans)', padding: '12px 14px' }}>{m.avg_sat} / 5</td>
                    <td style={{ textAlign: 'right', color: m.avg_efficiency < 4.2 ? 'var(--clr-critical)' : 'var(--clr-good)', fontWeight: '600', fontFamily: 'var(--font-sans)', padding: '12px 14px' }}>
                      {m.avg_efficiency} {m.avg_efficiency < 4.2 ? '↓' : '↑'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
