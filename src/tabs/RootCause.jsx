import React from 'react';
import { useDashboard } from '../context/DashboardContext';

export default function RootCause() {
  const {
    activeQuarter,
    dashboardData,
    providers
  } = useDashboard();

  const { delay_by_market, esc_by_market } = dashboardData;

  const heatColor = (rate) => {
    if (rate >= 0.75) return { background: '#FEE2E2', color: '#991B1B', fontWeight: '700' };
    if (rate >= 0.5) return { background: '#FEF3C7', color: '#92400E', fontWeight: '600' };
    if (rate >= 0.25) return { background: '#E8F3EE', color: '#1E6B4A', fontWeight: '500' };
    return { background: '#F0FDF4', color: '#166534', fontWeight: '500' };
  };

  const delayReasons = ['IT Access', 'Missing Docs', 'Scheduling', 'Internal Handoff', 'Vendor SLA'];
  const escTypes = ['Compliance', 'IT', 'Operations', 'Other'];
  const markets = ['TX', 'CA', 'FL'];

  // Metrics for Breach vs No Breach
  const breachedProvs = providers.filter(p => p['SLA Breach (Y/N)'] === 'Y');
  const cleanProvs = providers.filter(p => p['SLA Breach (Y/N)'] === 'N');

  const avgCleanEff = cleanProvs.length ? (cleanProvs.reduce((sum, p) => sum + p.support_efficiency, 0) / cleanProvs.length) : 0;
  const avgBreachedEff = breachedProvs.length ? (breachedProvs.reduce((sum, p) => sum + p.support_efficiency, 0) / breachedProvs.length) : 0;

  const avgCleanBurden = cleanProvs.length ? (cleanProvs.reduce((sum, p) => sum + p.escalation_burden, 0) / cleanProvs.length) : 0;
  const avgBreachedBurden = breachedProvs.length ? (breachedProvs.reduce((sum, p) => sum + p.escalation_burden, 0) / breachedProvs.length) : 0;

  return (
    <div className="page active" id="page-rootcause" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div className="page-header">
        <h1>Root Cause Analytics</h1>
        <p>Deep-dive bottleneck analysis · Cross-signal correlations · Derived metrics · Market-specific drivers</p>
        <div className="meta">
          DATASET: {providers.length} PROVIDERS · TX · CA · FL · {activeQuarter} 2025
        </div>
      </div>

      {/* HEATMAPS ROW */}
      <div className="grid-2">
        {/* Heatmap 1 */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Delay Reason × Market Breach Heatmap</div>
              <div className="card-sub">Breach rate for each delay reason per market</div>
            </div>
            <span className="card-tag">HEATMAP</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-tbl">
              <thead>
                <tr>
                  <th>Delay Reason</th>
                  <th style={{ textAlign: 'center' }}>TX</th>
                  <th style={{ textAlign: 'center' }}>CA</th>
                  <th style={{ textAlign: 'center' }}>FL</th>
                </tr>
              </thead>
              <tbody>
                {delayReasons.map((dr, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '8px', fontSize: '12.5px', fontWeight: '500', color: 'var(--text2)' }}>{dr}</td>
                    {markets.map(mkt => {
                      const item = delay_by_market.find(d => d.Market === mkt && d['Primary Delay Reason'] === dr);
                      if (!item) {
                        return <td key={mkt} style={{ background: 'var(--surface2)', color: 'var(--text3)', textAlign: 'center', padding: '8px' }}>—</td>;
                      }
                      const pct = Math.round(item.breach_rate * 100);
                      const style = heatColor(item.breach_rate);
                      return (
                        <td key={mkt} style={{ ...style, textAlign: 'center', padding: '8px', fontSize: '13px' }}>
                          {pct}% <span style={{ fontSize: '9px', opacity: '.7' }}>n={item.count}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Heatmap 2 */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Escalation Type × Market Breach Rate</div>
              <div className="card-sub">How escalation routing affects breach by market</div>
            </div>
            <span className="card-tag">ROUTING RISK</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-tbl">
              <thead>
                <tr>
                  <th>Escalation Type</th>
                  <th style={{ textAlign: 'center' }}>TX</th>
                  <th style={{ textAlign: 'center' }}>CA</th>
                  <th style={{ textAlign: 'center' }}>FL</th>
                </tr>
              </thead>
              <tbody>
                {escTypes.map((et, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '8px', fontSize: '12.5px', fontWeight: '500', color: 'var(--text2)' }}>{et}</td>
                    {markets.map(mkt => {
                      const item = esc_by_market.find(d => d.Market === mkt && d['Escalation Type'] === et);
                      if (!item) {
                        return <td key={mkt} style={{ background: 'var(--surface2)', color: 'var(--text3)', textAlign: 'center', padding: '8px' }}>—</td>;
                      }
                      const pct = Math.round(item.breach_rate * 100);
                      const style = heatColor(item.breach_rate);
                      return (
                        <td key={mkt} style={{ ...style, textAlign: 'center', padding: '8px', fontSize: '13px' }}>
                          {pct}% <span style={{ fontSize: '9px', opacity: '.7' }}>n={item.count}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Derived Metrics */}
      <div className="section-label">Derived metrics — computed from existing columns</div>
      <div className="grid-3" style={{ marginBottom: '16px' }}>
        {/* Metric 1 */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Support Efficiency</div>
              <div className="card-sub">Tasks completed ÷ ticket time · r=−0.554 with breach</div>
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: '10px', color: 'var(--text3)', marginBottom: '8px' }}>
            FORMULA: % Tasks Completed On Time ÷ Avg Ticket Resolution Time
          </div>
          <div className="hbar-wrap">
            <div className="hbar-row">
              <span className="hbar-label">No breach</span>
              <div className="hbar-track">
                <div class="hbar-fill" style={{ width: '80%', background: 'var(--clr-good)' }}></div>
              </div>
              <span className="hbar-val" style={{ color: 'var(--clr-good)' }}>
                {Math.round(avgCleanEff * 100) / 100}
              </span>
            </div>
            <div className="hbar-row">
              <span className="hbar-label">Breached</span>
              <div className="hbar-track">
                <div className="hbar-fill" style={{ width: '60%', background: 'var(--clr-critical)' }}></div>
              </div>
              <span className="hbar-val" style={{ color: 'var(--clr-critical)' }}>
                {Math.round(avgBreachedEff * 100) / 100}
              </span>
            </div>
          </div>
          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--bg)', fontSize: '11px', color: 'var(--text3)' }}>
            Strongest single predictor of breach. TX market average is historically the lowest — directly explaining 60% breach rate.
          </div>
        </div>

        {/* Metric 2 */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Escalation Burden</div>
              <div className="card-sub">Escalations × ticket time · operational cost proxy</div>
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: '10px', color: 'var(--text3)', marginBottom: '8px' }}>
            FORMULA: # Escalations × Avg Ticket Resolution Time (hrs)
          </div>
          <div className="hbar-wrap">
            <div className="hbar-row">
              <span className="hbar-label">Breached</span>
              <div className="hbar-track">
                <div className="hbar-fill" style={{ width: '78%', background: 'var(--clr-critical)' }}></div>
              </div>
              <span className="hbar-val" style={{ color: 'var(--clr-critical)' }}>
                {Math.round(avgBreachedBurden * 10) / 10}
              </span>
            </div>
            <div className="hbar-row">
              <span className="hbar-label">No breach</span>
              <div className="hbar-track">
                <div className="hbar-fill" style={{ width: '50%', background: 'var(--clr-good)' }}></div>
              </div>
              <span className="hbar-val" style={{ color: 'var(--clr-good)' }}>
                {Math.round(avgCleanBurden * 10) / 10}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Task Velocity</div>
              <div className="card-sub">Task completion rate ÷ onboarding duration</div>
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: '10px', color: 'var(--text3)', marginBottom: '8px' }}>
            FORMULA: % Tasks Completed On Time ÷ Onboarding Duration (days)
          </div>
          <div className="hbar-wrap">
            <div className="hbar-row">
              <span className="hbar-label">No breach</span>
              <div className="hbar-track">
                <div className="hbar-fill" style={{ width: '80%', background: 'var(--clr-good)' }}></div>
              </div>
              <span className="hbar-val" style={{ color: 'var(--clr-good)' }}>3.92</span>
            </div>
            <div className="hbar-row">
              <span className="hbar-label">Breached</span>
              <div className="hbar-track">
                <div className="hbar-fill" style={{ width: '68%', background: 'var(--clr-critical)' }}></div>
              </div>
              <span className="hbar-val" style={{ color: 'var(--clr-critical)' }}>3.36</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pearson correlation vs Risk combinations */}
      <div className="grid-2-1">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Predictor Correlation with SLA Breach</div>
              <div className="card-sub">Pearson r — raw and derived fields</div>
            </div>
            <span className="card-tag">CORRELATION</span>
          </div>
          <div className="hbar-wrap">
            <div className="hbar-row"><span className="hbar-label">Support Efficiency (inv)</span><div className="hbar-track"><div className="hbar-fill" style={{ width: '100%', background: 'var(--clr-critical)' }}></div></div><span className="hbar-val" style={{ color: 'var(--clr-critical)' }}>−0.55</span></div>
            <div className="hbar-row"><span className="hbar-label">Ticket Resolution Time</span><div className="hbar-track"><div className="hbar-fill" style={{ width: '88%', background: 'var(--clr-critical)' }}></div></div><span className="hbar-val" style={{ color: 'var(--clr-caution)' }}>0.49</span></div>
            <div className="hbar-row"><span className="hbar-label">% Tasks (inv)</span><div className="hbar-track"><div className="hbar-fill" style={{ width: '76%', background: 'var(--clr-caution)' }}></div></div><span className="hbar-val" style={{ color: 'var(--clr-caution)' }}>−0.42</span></div>
            <div className="hbar-row"><span className="hbar-label">IT Provisioning Days</span><div className="hbar-track"><div className="hbar-fill" style={{ width: '49%', background: 'var(--clr-warn)' }}></div></div><span className="hbar-val">0.27</span></div>
            <div className="hbar-row"><span className="hbar-label">Onboarding Duration</span><div className="hbar-track"><div className="hbar-fill" style={{ width: '41%', background: 'var(--clr-neutral)' }}></div></div><span className="hbar-val">0.23</span></div>
            <div className="hbar-row"><span className="hbar-label"># Escalations</span><div className="hbar-track"><div className="hbar-fill" style={{ width: '22%', background: 'var(--clr-neutral)' }}></div></div><span className="hbar-val">0.12</span></div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Key Risk Combos</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ padding: '10px', background: 'var(--clr-critical-bg)', borderRadius: '6px', border: '1px solid var(--clr-critical-border)' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--clr-critical)', marginBottom: '3px' }}>IT Access + Compliance Esc</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--clr-critical)', fontFamily: "var(--font-serif)" }}>80% breach · sat 3.94</div>
              <div style={{ fontSize: '11px', color: 'var(--text3)' }}>Worst combo in dataset — CA holds the majority.</div>
            </div>
            <div style={{ padding: '10px', background: 'var(--clr-caution-bg)', borderRadius: '6px', border: '1px solid var(--clr-caution-border)' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--clr-caution)', marginBottom: '3px' }}>Dual Heavy (IT + Compliance both &gt; avg)</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--clr-caution)', fontFamily: "var(--font-serif)" }}>56% breach · avg 26d</div>
              <div style={{ fontSize: '11px', color: 'var(--text3)' }}>CA contains 4 of the worst offending accounts.</div>
            </div>
            <div style={{ padding: '10px', background: 'var(--clr-good-bg)', borderRadius: '6px', border: '1px solid var(--clr-good-border)' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--clr-good)', marginBottom: '3px' }}>Scheduling + Compliance Esc (safest path)</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--clr-good)', fontFamily: "var(--font-serif)" }}>0% breach · sat 4.40</div>
              <div style={{ fontSize: '11px', color: 'var(--text3)' }}>Benchmark pathway — escalation routing works.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
