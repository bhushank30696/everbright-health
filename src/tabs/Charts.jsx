import React, { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import {
  ChevronDown,
  ChevronUp,
  Info,
  Calendar,
  MapPin,
  Activity,
  HelpCircle,
  AlertTriangle,
  Smile,
  Clock,
  ClipboardList
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';

// Custom Tooltip component for consistent OKLCH styling across light/dark themes
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '12px 16px',
        boxShadow: 'var(--shadow)',
        backdropFilter: 'blur(8px)'
      }}>
        <p style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '8px', fontSize: '12px', fontFamily: 'var(--font-sans)' }}>
          {label}
        </p>
        {payload.map((item, idx) => (
          <p key={idx} style={{ color: item.color || 'var(--text)', fontSize: '11px', margin: '4px 0', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.color, display: 'inline-block' }} />
            <span style={{ fontWeight: '500', color: 'var(--text2)' }}>{item.name}:</span>
            <span style={{ fontWeight: '600', color: 'var(--text)' }}>
              {item.value}
              {item.name.includes('Rate') || item.name.includes('Completion') || item.name.includes('breach') || item.name.includes('Breach') ? '%' : 
               item.name.includes('Duration') || item.name.includes('Days') || item.name.includes('Stage') || item.name.includes('onboarding') || item.name.includes('Days') || item.name.includes('Stage') ? 'd' : 
               item.name.includes('Time') || item.name.includes('Ticket') ? 'h' : ''}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Donut colors
const PIE_COLORS = [
  'var(--accent)',
  'var(--clr-good)',
  'oklch(0.65 0.18 200.0)', // TX Blue
  'oklch(0.55 0.12 280.0)', // CA Purple
  'var(--clr-caution)',
  'var(--clr-critical)'
];

export default function Charts() {
  const { activeState, activeQuarter, dashboardData, providers, allProvidersInQuarter } = useDashboard();
  const { kpis } = dashboardData;

  // Sub-tabs navigation state
  const [activeSubTab, setActiveSubTab] = useState('insights');

  // Interactive View Toggles
  const [trendViewMode, setTrendViewMode] = useState('provider'); // 'provider' | 'market'

  // Insight Cards Expand/Collapse states
  const [expandedInsights, setExpandedInsights] = useState({
    compounding: true,
    satisfaction: true,
    process: true
  });

  const toggleInsight = (key) => {
    setExpandedInsights(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // ==========================================
  // TAB 1: STRATEGIC CASE STUDY INSIGHTS (3 CHARTS)
  // ==========================================

  // Chart 1: IT Access Delay & Ticket Speed Impact
  const insightsChart1Data = useMemo(() => {
    const categories = [
      { name: 'All Others, Fast Ticket (≤22h)', delay: false, slow: false },
      { name: 'All Others, Slow Ticket (>22h)', delay: false, slow: true },
      { name: 'IT Access, Fast Ticket (≤22h)', delay: true, slow: false },
      { name: 'IT Access + Slow Ticket (>22h)', delay: true, slow: true }
    ];
    return categories.map(cat => {
      const filtered = allProvidersInQuarter.filter(p => {
        const isIT = p['Primary Delay Reason'] === 'IT Access';
        const isSlow = p['Avg Ticket Resolution Time (hrs)'] > 22;
        return isIT === cat.delay && isSlow === cat.slow;
      });
      const total = filtered.length;
      const breached = filtered.filter(p => p['SLA Breach (Y/N)'] === 'Y').length;
      const rate = total ? Math.round((breached / total) * 100) : 0;
      return {
        name: cat.name,
        'Breach Rate': rate,
        'Cases': total
      };
    });
  }, [allProvidersInQuarter]);

  // Chart 2: Low Task Completion & High Escalation Impact on Satisfaction
  const insightsChart2Data = useMemo(() => {
    const conditions = [
      { name: 'Neither Flag Present', hasFlag: false },
      { name: 'One or Both Flags Present', hasFlag: true }
    ];
    return conditions.map(cond => {
      const filtered = allProvidersInQuarter.filter(p => {
        const lowComplete = p['% Tasks Completed On Time'] < 80;
        const highEsc = p['# Escalations'] >= 3;
        const isFlagged = lowComplete || highEsc;
        return isFlagged === cond.hasFlag;
      });
      const total = filtered.length;
      const breached = filtered.filter(p => p['SLA Breach (Y/N)'] === 'Y').length;
      const avgSat = total ? Math.round((filtered.reduce((sum, p) => sum + p['Satisfaction Score (1-5)'], 0) / total) * 100) / 100 : 0;
      const breachRate = total ? Math.round((breached / total) * 100) : 0;
      return {
        name: cond.name,
        'Avg Satisfaction': avgSat,
        'SLA Breach Rate': breachRate,
        'Cases': total
      };
    });
  }, [allProvidersInQuarter]);

  // Chart 3: TX Market Process Handoff Bottleneck (Histogram-similar stacked stages chart with Breach tag)
  const insightsChart3Data = useMemo(() => {
    const txProvs = allProvidersInQuarter.filter(p => p.Market === 'TX');
    return txProvs.map(p => ({
      name: p['Provider ID'] + (p['SLA Breach (Y/N)'] === 'Y' ? ' ⚠️' : ' ✓'),
      'Contracting': p['Contracting Days'] || 0,
      'IT Provisioning': p['IT Provisioning Days'] || 0,
      'Compliance': p['Compliance Days'] || 0,
      'Training': p['Training Days'] || 0,
      'Total Days': p['Onboarding Duration (days)'],
      'SLA Breach': p['SLA Breach (Y/N)'] === 'Y' ? 'Breached' : 'On Track',
      'Delay Reason': p['Primary Delay Reason']
    })).sort((a, b) => b['Total Days'] - a['Total Days']);
  }, [allProvidersInQuarter]);


  // ==========================================
  // TAB 2: MARKET DIAGNOSTICS (7 CHARTS)
  // ==========================================
  const marketChartsData = useMemo(() => {
    const markets = ['CA', 'FL', 'TX'];
    return markets.map(m => {
      const mktProvs = allProvidersInQuarter.filter(p => p.Market === m);
      const total = mktProvs.length;
      if (!total) return { market: m, onboarding: 0, sat: 0, ticket: 0, task: 0, escalations: 0, breached: 0, onTrack: 0 };
      
      const avgOnboarding = mktProvs.reduce((sum, p) => sum + p['Onboarding Duration (days)'], 0) / total;
      const avgSat = mktProvs.reduce((sum, p) => sum + p['Satisfaction Score (1-5)'], 0) / total;
      const avgTicket = mktProvs.reduce((sum, p) => sum + p['Avg Ticket Resolution Time (hrs)'], 0) / total;
      const avgTask = mktProvs.reduce((sum, p) => sum + (p['% Tasks Completed On Time'] || 0), 0) / total;
      const totalEsc = mktProvs.reduce((sum, p) => sum + (p['# Escalations'] || 0), 0);
      const breached = mktProvs.filter(p => p['SLA Breach (Y/N)'] === 'Y').length;
      const onTrack = total - breached;
      
      // Average stages
      const contracting = mktProvs.reduce((sum, p) => sum + (p['Contracting Days'] || 0), 0) / total;
      const it = mktProvs.reduce((sum, p) => sum + (p['IT Provisioning Days'] || 0), 0) / total;
      const compliance = mktProvs.reduce((sum, p) => sum + (p['Compliance Days'] || 0), 0) / total;
      const training = mktProvs.reduce((sum, p) => sum + (p['Training Days'] || 0), 0) / total;

      return {
        market: m,
        'Avg Onboarding Duration': Math.round(avgOnboarding * 10) / 10,
        'Avg Satisfaction Score': Math.round(avgSat * 100) / 100,
        'Avg Ticket Resolution Time': Math.round(avgTicket * 10) / 10,
        'Task Completion Rate': Math.round(avgTask * 10) / 10,
        'Total Escalations': totalEsc,
        'Breached': breached,
        'On Track': onTrack,
        'Contracting Stage': Math.round(contracting * 10) / 10,
        'IT Provisioning Stage': Math.round(it * 10) / 10,
        'Compliance Stage': Math.round(compliance * 10) / 10,
        'Training Stage': Math.round(training * 10) / 10
      };
    });
  }, [allProvidersInQuarter]);


  // ==========================================
  // TAB 3: OPERATIONAL ROOT CAUSE (6 CHARTS)
  // ==========================================
  const rootCauseChartsData = useMemo(() => {
    const delays = ['IT Access', 'Internal Handoff', 'Missing Docs', 'Scheduling', 'Vendor SLA'];
    
    // 1. Primary Delay Reasons Donut
    const delayData = delays.map(d => {
      const count = providers.filter(p => p['Primary Delay Reason'] === d).length;
      const breached = providers.filter(p => p['Primary Delay Reason'] === d && p['SLA Breach (Y/N)'] === 'Y').length;
      const rate = count ? Math.round((breached / count) * 100) : 0;
      return { name: d, value: count, 'Breach Rate': rate };
    }).filter(d => d.value > 0);

    // 2. Distribution of Escalation Types Donut
    const escTypes = ['Compliance', 'IT', 'Operations', 'Other'];
    const escData = escTypes.map(e => {
      const count = providers.filter(p => p['Escalation Type'] === e).length;
      const breached = providers.filter(p => p['Escalation Type'] === e && p['SLA Breach (Y/N)'] === 'Y').length;
      const rate = count ? Math.round((breached / count) * 100) : 0;
      return { name: e, value: count, 'Breach Rate': rate };
    }).filter(e => e.value > 0);

    // 3. Primary Delay Reason by Market
    const markets = ['CA', 'FL', 'TX'];
    const delayByMktData = delays.map(d => {
      const row = { name: d };
      markets.forEach(m => {
        row[m] = providers.filter(p => p['Primary Delay Reason'] === d && p.Market === m).length;
      });
      return row;
    });

    // 4. SLA Breach vs Average Ticket Resolution Time
    const breachTicketData = [
      {
        name: 'On Track',
        'Avg Ticket Time': providers.filter(p => p['SLA Breach (Y/N)'] === 'N').length
          ? Math.round((providers.filter(p => p['SLA Breach (Y/N)'] === 'N').reduce((sum, p) => sum + p['Avg Ticket Resolution Time (hrs)'], 0) / providers.filter(p => p['SLA Breach (Y/N)'] === 'N').length) * 10) / 10
          : 0
      },
      {
        name: 'SLA Breach',
        'Avg Ticket Time': providers.filter(p => p['SLA Breach (Y/N)'] === 'Y').length
          ? Math.round((providers.filter(p => p['SLA Breach (Y/N)'] === 'Y').reduce((sum, p) => sum + p['Avg Ticket Resolution Time (hrs)'], 0) / providers.filter(p => p['SLA Breach (Y/N)'] === 'Y').length) * 10) / 10
          : 0
      }
    ];

    // 5. Market vs SLA Breach vs Onboarding Days
    const mktBreachDurationData = markets.map(m => {
      const mProvs = providers.filter(p => p.Market === m);
      const onTrackProvs = mProvs.filter(p => p['SLA Breach (Y/N)'] === 'N');
      const breachedProvs = mProvs.filter(p => p['SLA Breach (Y/N)'] === 'Y');
      return {
        market: m,
        'On Track': onTrackProvs.length ? Math.round((onTrackProvs.reduce((sum, p) => sum + p['Onboarding Duration (days)'], 0) / onTrackProvs.length) * 10) / 10 : 0,
        'SLA Breach': breachedProvs.length ? Math.round((breachedProvs.reduce((sum, p) => sum + p['Onboarding Duration (days)'], 0) / breachedProvs.length) * 10) / 10 : 0
      };
    });

    // 6. Primary Delay Reason vs SLA Breach Rate
    const delayBreachRateData = delays.map(d => {
      const dProvs = providers.filter(p => p['Primary Delay Reason'] === d);
      const breached = dProvs.filter(p => p['SLA Breach (Y/N)'] === 'Y').length;
      return {
        name: d,
        'Breach Rate': dProvs.length ? Math.round((breached / dProvs.length) * 100) : 0,
        'Cases': dProvs.length
      };
    }).sort((a, b) => b['Breach Rate'] - a['Breach Rate']);

    return { delayData, escData, delayByMktData, breachTicketData, mktBreachDurationData, delayBreachRateData };
  }, [providers]);


  // ==========================================
  // TAB 5: CHRONOLOGICAL TRENDS (4 CHARTS)
  // ==========================================
  const chronologicalProviders = useMemo(() => {
    return [...providers]
      .sort((a, b) => a['Provider ID'].localeCompare(b['Provider ID']))
      .map(p => ({
        id: p['Provider ID'],
        name: p.ProviderName,
        'Onboarding Days': p['Onboarding Duration (days)'],
        'IT Days': p['IT Provisioning Days']
      }));
  }, [providers]);

  const monthlyTrendsData = useMemo(() => {
    const { monthly_trend } = dashboardData;
    return monthly_trend.map(t => ({
      month: t.start_month.toUpperCase(),
      'SLA Breach Rate (%)': Math.round(t.breach_rate * 100),
      'Avg Onboarding Days': t.avg_onboarding
    }));
  }, [dashboardData]);

  const marketMonthlyTrendsData = useMemo(() => {
    const activeMonths = activeQuarter === 'Q2' ? ['APR', 'MAY', 'JUN'] :
                         activeQuarter === 'Q3' ? ['JUL', 'AUG', 'SEP'] :
                         activeQuarter === 'Q4' ? ['OCT', 'NOV', 'DEC'] : ['JAN', 'FEB', 'MAR'];

    return activeMonths.map(m => {
      const row = { month: m };
      ['CA', 'FL', 'TX'].forEach(mkt => {
        const filtered = allProvidersInQuarter.filter(p => {
          const mktMatch = p.Market === mkt;
          const dateStr = p['Start Date'] || '';
          const monthMatch = dateStr.toUpperCase().startsWith(m.slice(0, 3));
          return mktMatch && monthMatch;
        });
        const total = filtered.length;
        const avg = total ? Math.round((filtered.reduce((sum, p) => sum + p['Onboarding Duration (days)'], 0) / total) * 10) / 10 : 0;
        row[mkt] = avg;
      });
      return row;
    });
  }, [allProvidersInQuarter, activeQuarter]);


  return (
    <div className="page active" id="page-charts" style={{ animation: 'fadeIn 0.25s ease-out', padding: '24px 28px' }}>
      {/* Title Header */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>
          Portfolio Insights & Analytics
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '2px', fontFamily: 'var(--font-sans)' }}>
          Interactive BI Workspace · Replication of Google Sheet Analytical Visualizations
        </p>
        <div className="meta" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', marginTop: '6px', color: 'var(--accent)' }}>
          CURRENT DATASET COHORT: {kpis.total_providers} PROVIDERS · {activeQuarter} 2025 · FILTER: {activeState.toUpperCase()}
        </div>
      </div>

      {/* BI Navigation Sub-Tabs */}
      <div className="charts-sub-nav">
        <button
          className={`charts-sub-btn ${activeSubTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('insights')}
        >
          🔍 Strategic Insights
        </button>
        <button
          className={`charts-sub-btn ${activeSubTab === 'market' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('market')}
        >
          📊 Market Diagnostics
        </button>
        <button
          className={`charts-sub-btn ${activeSubTab === 'rootcause' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('rootcause')}
        >
          💡 Operational Root Cause
        </button>
        <button
          className={`charts-sub-btn ${activeSubTab === 'trends' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('trends')}
        >
          📈 Chronological Trends
        </button>
      </div>

      {/* ======================================================== */}
      {/* SUB-TAB 1: CASE STUDY STRATEGIC INSIGHTS (SIDE-BY-SIDE ALIGNED ROWS) */}
      {/* ======================================================== */}
      {activeSubTab === 'insights' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', animation: 'fadeIn 0.2s ease-out' }}>
          
          {/* ROW 1: IT ACCESS DELAY & TICKET SPEED COMPOUNDING IMPACT */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 450px) 1fr', gap: '30px', alignItems: 'start' }} className="insights-split">
            {/* Left Card: Insight with Collapsible Questions */}
            <div className="insight-text-card" style={{ margin: 0 }}>
              <div className="insight-text-header" onClick={() => toggleInsight('compounding')} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '10px' }}>
                <span className="insight-text-title" style={{ fontSize: '14px', fontWeight: '700' }}>
                  <AlertTriangle size={15} color="var(--clr-critical)" />
                  IT Access Delay & Support Speed
                </span>
                {expandedInsights.compounding ? <ChevronUp size={16} color="var(--text3)" /> : <ChevronDown size={16} color="var(--text3)" />}
              </div>
              
              {expandedInsights.compounding && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <p style={{ fontSize: '11.5px', color: 'var(--text)', lineHeight: '1.5' }}>
                    <strong>Case Study Narrative:</strong> Every single provider with a ticket resolution time above 25 hours breached SLA — 6 of 6. Actionable intervention target: fix IT speed and you fix the majority of breaches.
                  </p>
                  
                  <div style={{ background: 'var(--surface)', borderRadius: '6px', padding: '12px', borderLeft: '3px solid var(--accent)' }}>
                    <h4 style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text)', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <HelpCircle size={10} color="var(--accent)" /> What question does this answer?
                    </h4>
                    <p style={{ fontSize: '10.5px', color: 'var(--text2)', lineHeight: '1.4' }}>
                      How do IT Access delays and ticket resolution speed interact to cause SLA failures?
                    </p>
                  </div>

                  <div style={{ background: 'var(--surface)', borderRadius: '6px', padding: '12px', borderLeft: '3px solid var(--clr-good)' }}>
                    <h4 style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text)', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Activity size={10} color="var(--clr-good)" /> How does this help?
                    </h4>
                    <p style={{ fontSize: '10.5px', color: 'var(--text2)', lineHeight: '1.4' }}>
                      Identifies compounding risk. It proves that support bottlenecking (slow tickets) and system access delays (IT Access) compound to guarantee SLA breach (80%+). It focuses primary interventions on **IT Access delays** to immediately mitigate breaches.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Chart: SLA Breach Rate bar chart */}
            <div className="chart-card-premium" style={{ height: '100%', justifyContent: 'center' }}>
              <div className="card-header" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>IT Access Delay & Ticket Speed Compounding Impact</h3>
                  <small style={{ color: 'var(--text3)', fontSize: '11px' }}>SLA breach rate by IT Access flag + ticket resolution speed (&gt;22h = slow)</small>
                </div>
                <span className="card-tag" style={{ background: 'var(--clr-critical-bg)', color: 'var(--clr-critical)', border: '1px solid var(--clr-critical-border)' }}>CRITICAL PATH</span>
              </div>
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer>
                  <BarChart data={insightsChart1Data} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" stroke="var(--text3)" fontSize={10} domain={[0, 100]} unit="%" />
                    <YAxis dataKey="name" type="category" stroke="var(--text)" fontSize={10} tickLine={false} width={160} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="Breach Rate" fill="var(--accent)" radius={[0, 4, 4, 0]} barSize={16}>
                      {insightsChart1Data.map((entry, idx) => {
                        const colors = ['var(--clr-good)', 'var(--clr-caution)', 'var(--clr-warn)', 'var(--clr-critical)'];
                        return <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ROW 2: LOW TASK COMPLETION & HIGH ESCALATION IMPACT ON SATISFACTION */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 450px) 1fr', gap: '30px', alignItems: 'start' }} className="insights-split">
            {/* Left Card: Insight with Collapsible Questions */}
            <div className="insight-text-card" style={{ margin: 0 }}>
              <div className="insight-text-header" onClick={() => toggleInsight('satisfaction')} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '10px' }}>
                <span className="insight-text-title" style={{ fontSize: '14px', fontWeight: '700' }}>
                  <AlertTriangle size={15} color="var(--clr-caution)" />
                  Task Completion & Experience Impact
                </span>
                {expandedInsights.satisfaction ? <ChevronUp size={16} color="var(--text3)" /> : <ChevronDown size={16} color="var(--text3)" />}
              </div>
              
              {expandedInsights.satisfaction && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <p style={{ fontSize: '11.5px', color: 'var(--text)', lineHeight: '1.5' }}>
                    <strong>Case Study Narrative:</strong> These two signals together predict the worst provider experience. When a provider has both low task completion (&lt;80%) and 3+ escalations, satisfaction drops to 4.05 — and 100% of those providers either breached or came close. The critical insight: task completion rate is the leading indicator, escalations are the lagging one. By the time a provider hits 3 escalations, satisfaction is already damaged. The dashboard should flag providers below 80% task completion before escalations pile up.
                  </p>
                  
                  <div style={{ background: 'var(--surface)', borderRadius: '6px', padding: '12px', borderLeft: '3px solid var(--accent)' }}>
                    <h4 style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text)', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <HelpCircle size={10} color="var(--accent)" /> What question does this answer?
                    </h4>
                    <p style={{ fontSize: '10.5px', color: 'var(--text2)', lineHeight: '1.4' }}>
                      When does a provider's onboarding experience completely collapse? Is task completion speed or escalation volume a better leading indicator of satisfaction?
                    </p>
                  </div>

                  <div style={{ background: 'var(--surface)', borderRadius: '6px', padding: '12px', borderLeft: '3px solid var(--clr-good)' }}>
                    <h4 style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text)', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Activity size={10} color="var(--clr-good)" /> How does this help?
                    </h4>
                    <p style={{ fontSize: '10.5px', color: 'var(--text2)', lineHeight: '1.4' }}>
                      Proves satisfaction is a lagging indicator highly sensitive to friction. It shows that practice leads must flag and intervene when task completion drops below 80%, *before* escalations accumulate and satisfaction collapse occurs.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Chart: Satisfaction & Breach bar chart */}
            <div className="chart-card-premium" style={{ height: '100%', justifyContent: 'center' }}>
              <div className="card-header" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Task Completion & Escalation Satisfaction Collapse</h3>
                  <small style={{ color: 'var(--text3)', fontSize: '11px' }}>Average satisfaction & breach rate by condition (low completion &lt;80% + high escalations 3+)</small>
                </div>
                <span className="card-tag" style={{ background: 'var(--clr-good-bg)', color: 'var(--clr-good)', border: '1px solid var(--clr-good-border)' }}>SATISFACTION</span>
              </div>
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer>
                  <BarChart data={insightsChart2Data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text3)" fontSize={10} tickLine={false} />
                    <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    <Bar dataKey="Avg Satisfaction" fill="var(--clr-good)" name="Average Satisfaction (1-5)" radius={[4, 4, 0, 0]} barSize={16} />
                    <Bar dataKey="SLA Breach Rate" fill="var(--clr-critical)" name="SLA Breach Rate (%)" radius={[4, 4, 0, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ROW 3: TEXAS MARKET PROCESS HANDOFF BOTTLENECK */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 450px) 1fr', gap: '30px', alignItems: 'start' }} className="insights-split">
            {/* Left Card: Insight with Collapsible Questions */}
            <div className="insight-text-card" style={{ margin: 0 }}>
              <div className="insight-text-header" onClick={() => toggleInsight('process')} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '10px' }}>
                <span className="insight-text-title" style={{ fontSize: '14px', fontWeight: '700' }}>
                  <AlertTriangle size={15} color="var(--clr-caution)" />
                  Texas Handoff & Stage Bottleneck
                </span>
                {expandedInsights.process ? <ChevronUp size={16} color="var(--text3)" /> : <ChevronDown size={16} color="var(--text3)" />}
              </div>
              
              {expandedInsights.process && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <p style={{ fontSize: '11.5px', color: 'var(--text)', lineHeight: '1.5' }}>
                    <strong>Case Study Narrative:</strong> TX has the highest breach rate (60%) despite the shortest average onboarding (23.0 days vs 24.1 for CA). This rules out TX being slow. The breach is happening faster — which means it's a process compliance and handoff problem, not a throughput one. P027 breached SLA in just 18 days — the shortest onboarding in the dataset. P025 breached in 20 days. This is not about duration. TX needs process discipline intervention, not more time.
                  </p>
                  
                  <div style={{ background: 'var(--surface)', borderRadius: '6px', padding: '12px', borderLeft: '3px solid var(--accent)' }}>
                    <h4 style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text)', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <HelpCircle size={10} color="var(--accent)" /> What question does this answer?
                    </h4>
                    <p style={{ fontSize: '10.5px', color: 'var(--text2)', lineHeight: '1.4' }}>
                      Why is the Texas market experiencing a high 60% breach rate despite having the fastest average onboarding time (23 days) in the entire dataset?
                    </p>
                  </div>

                  <div style={{ background: 'var(--surface)', borderRadius: '6px', padding: '12px', borderLeft: '3px solid var(--clr-good)' }}>
                    <h4 style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text)', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Activity size={10} color="var(--clr-good)" /> How does this help?
                    </h4>
                    <p style={{ fontSize: '10.5px', color: 'var(--text2)', lineHeight: '1.4' }}>
                      Proves Texas suffers from process execution bottlenecks rather than capacity. Stacked column analysis below allows practice leads to compare the exact stages where drag accumulated, directing TX leaders to optimize contracting and IT provisioning workflows.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Chart: Texas stacked stages bar chart */}
            <div className="chart-card-premium" style={{ height: '100%', justifyContent: 'center' }}>
              <div className="card-header" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Texas Onboarding Duration & Stage Bottleneck</h3>
                  <small style={{ color: 'var(--text3)', fontSize: '11px' }}>Stacked stage days for TX providers (⚠️ = Breached, ✓ = On Track)</small>
                </div>
                <span className="card-tag">TX PORTFOLIO</span>
              </div>
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer>
                  <BarChart data={insightsChart3Data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text3)" fontSize={10} tickLine={false} />
                    <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} unit="d" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    <Bar dataKey="Contracting" stackId="TX" fill="var(--accent)" name="Contracting" />
                    <Bar dataKey="IT Provisioning" stackId="TX" fill="var(--clr-caution)" name="IT Provisioning" />
                    <Bar dataKey="Compliance" stackId="TX" fill="var(--clr-good)" name="Compliance" />
                    <Bar dataKey="Training" stackId="TX" fill="oklch(0.65 0.18 200.0)" name="Training" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 2: MARKET DIAGNOSTICS */}
      {/* ======================================================== */}
      {activeSubTab === 'market' && (
        <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
            
            {/* Chart 4: Average Onboarding Duration by Market */}
            <div className="chart-card-premium">
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Average Onboarding Duration by Market</h3>
                <small style={{ color: 'var(--text3)', fontSize: '11px' }}>Average onboarding speed in days</small>
              </div>
              <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer>
                  <BarChart data={marketChartsData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="market" stroke="var(--text3)" fontSize={10} tickLine={false} />
                    <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} unit="d" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="Avg Onboarding Duration" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={24}>
                      {marketChartsData.map((entry, idx) => {
                        const colors = ['var(--accent)', 'oklch(0.55 0.15 140.0)', 'oklch(0.65 0.18 200.0)'];
                        return <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 5: Average Satisfaction Score by Market */}
            <div className="chart-card-premium">
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Average Satisfaction Score by Market</h3>
                <small style={{ color: 'var(--text3)', fontSize: '11px' }}>Satisfaction scale (1-5)</small>
              </div>
              <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer>
                  <BarChart data={marketChartsData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="market" stroke="var(--text3)" fontSize={10} tickLine={false} />
                    <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} domain={[1, 5]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="Avg Satisfaction Score" fill="var(--clr-good)" radius={[4, 4, 0, 0]} barSize={24}>
                      {marketChartsData.map((entry, idx) => {
                        const colors = ['var(--clr-good)', 'oklch(0.55 0.15 140.0)', 'oklch(0.65 0.18 200.0)'];
                        return <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 6: Average Ticket Resolution Time by Market */}
            <div className="chart-card-premium">
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Average Ticket Resolution Time by Market</h3>
                <small style={{ color: 'var(--text3)', fontSize: '11px' }}>Support resolution speed in hours</small>
              </div>
              <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer>
                  <BarChart data={marketChartsData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="market" stroke="var(--text3)" fontSize={10} tickLine={false} />
                    <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} unit="h" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="Avg Ticket Resolution Time" fill="var(--clr-caution)" radius={[4, 4, 0, 0]} barSize={24}>
                      {marketChartsData.map((entry, idx) => {
                        const colors = ['var(--clr-caution)', 'oklch(0.55 0.15 140.0)', 'oklch(0.65 0.18 200.0)'];
                        return <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 7: Market vs Task Completion Rate */}
            <div className="chart-card-premium">
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Market vs Task Completion Rate</h3>
                <small style={{ color: 'var(--text3)', fontSize: '11px' }}>Average percent of tasks completed on-time</small>
              </div>
              <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer>
                  <BarChart data={marketChartsData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="market" stroke="var(--text3)" fontSize={10} tickLine={false} />
                    <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} unit="%" domain={[50, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="Task Completion Rate" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={24}>
                      {marketChartsData.map((entry, idx) => {
                        const colors = ['var(--accent)', 'oklch(0.55 0.15 140.0)', 'oklch(0.65 0.18 200.0)'];
                        return <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 8: Total Escalations by Market */}
            <div className="chart-card-premium">
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Total Escalations by Market</h3>
                <small style={{ color: 'var(--text3)', fontSize: '11px' }}>Sum of escalations across markets</small>
              </div>
              <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer>
                  <BarChart data={marketChartsData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="market" stroke="var(--text3)" fontSize={10} tickLine={false} />
                    <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="Total Escalations" fill="var(--clr-critical)" radius={[4, 4, 0, 0]} barSize={24}>
                      {marketChartsData.map((entry, idx) => {
                        const colors = ['var(--clr-critical)', 'oklch(0.55 0.15 140.0)', 'oklch(0.65 0.18 200.0)'];
                        return <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 9: SLA Breach Counts by Market */}
            <div className="chart-card-premium">
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>SLA Breach by Market</h3>
                <small style={{ color: 'var(--text3)', fontSize: '11px' }}>SLA breach count (Breached vs On Track) by Market</small>
              </div>
              <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer>
                  <BarChart data={marketChartsData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="market" stroke="var(--text3)" fontSize={10} tickLine={false} />
                    <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    <Bar dataKey="On Track" fill="var(--clr-good)" name="On Track" stackId="breach" barSize={24} />
                    <Bar dataKey="Breached" fill="var(--clr-critical)" name="Breached" stackId="breach" radius={[4, 4, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 10: Onboarding Stages by Market */}
            <div className="chart-card-premium" style={{ gridColumn: '1 / -1' }}>
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Onboarding Stages by Market</h3>
                <small style={{ color: 'var(--text3)', fontSize: '11px' }}>Average duration in days across stages for CA, FL, TX</small>
              </div>
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <BarChart data={marketChartsData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="market" stroke="var(--text3)" fontSize={10} tickLine={false} />
                    <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} unit="d" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    <Bar dataKey="Contracting Stage" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={12} />
                    <Bar dataKey="IT Provisioning Stage" fill="var(--clr-caution)" radius={[4, 4, 0, 0]} barSize={12} />
                    <Bar dataKey="Compliance Stage" fill="var(--clr-good)" radius={[4, 4, 0, 0]} barSize={12} />
                    <Bar dataKey="Training Stage" fill="oklch(0.65 0.18 200.0)" radius={[4, 4, 0, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 3: OPERATIONAL ROOT CAUSE */}
      {/* ======================================================== */}
      {activeSubTab === 'rootcause' && (
        <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
            
            {/* Chart 11: Primary Delay Reasons */}
            <div className="chart-card-premium">
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Primary Delay Reasons</h3>
                <small style={{ color: 'var(--text3)', fontSize: '11px' }}>Volume of onboarding delay reasons</small>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180 }}>
                <div style={{ width: '50%', height: '100%' }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={rootCauseChartsData.delayData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {rootCauseChartsData.delayData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ width: '50%', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px' }}>
                  {rootCauseChartsData.delayData.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: PIE_COLORS[idx % PIE_COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontWeight: '500', color: 'var(--text)' }}>{item.name} (n={item.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chart 12: Distribution of Escalation Types */}
            <div className="chart-card-premium">
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Distribution of Escalation Types</h3>
                <small style={{ color: 'var(--text3)', fontSize: '11px' }}>Operational escalations by department</small>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180 }}>
                <div style={{ width: '50%', height: '100%' }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={rootCauseChartsData.escData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {rootCauseChartsData.escData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[(index + 2) % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ width: '50%', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px' }}>
                  {rootCauseChartsData.escData.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: PIE_COLORS[(idx + 2) % PIE_COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontWeight: '500', color: 'var(--text)' }}>{item.name} (n={item.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chart 13: Primary Delay Reason vs Market */}
            <div className="chart-card-premium">
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Primary Delay Reason vs Market</h3>
                <small style={{ color: 'var(--text3)', fontSize: '11px' }}>Handoff bottleneck distribution across CA, FL, TX</small>
              </div>
              <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer>
                  <BarChart data={rootCauseChartsData.delayByMktData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text3)" fontSize={9} tickLine={false} />
                    <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    <Bar dataKey="CA" fill="var(--accent)" name="CA" radius={[4, 4, 0, 0]} barSize={10} />
                    <Bar dataKey="FL" fill="var(--clr-good)" name="FL" radius={[4, 4, 0, 0]} barSize={10} />
                    <Bar dataKey="TX" fill="oklch(0.65 0.18 200.0)" name="TX" radius={[4, 4, 0, 0]} barSize={10} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 14: SLA Breach vs Average Ticket Resolution Time */}
            <div className="chart-card-premium">
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>SLA Breach vs Avg Ticket Resolution Time</h3>
                <small style={{ color: 'var(--text3)', fontSize: '11px' }}>Support resolution speeds for Breached vs On Track cohorts</small>
              </div>
              <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer>
                  <BarChart data={rootCauseChartsData.breachTicketData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text3)" fontSize={10} tickLine={false} />
                    <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} unit="h" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="Avg Ticket Time" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={24}>
                      {rootCauseChartsData.breachTicketData.map((entry, idx) => {
                        const fill = entry.name === 'SLA Breach' ? 'var(--clr-critical)' : 'var(--clr-good)';
                        return <Cell key={`cell-${idx}`} fill={fill} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 15: Market vs SLA Breach vs Onboarding Days */}
            <div className="chart-card-premium">
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Market vs SLA Breach vs Onboarding Days</h3>
                <small style={{ color: 'var(--text3)', fontSize: '11px' }}>Average onboarding days by cohort across markets</small>
              </div>
              <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer>
                  <BarChart data={rootCauseChartsData.mktBreachDurationData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="market" stroke="var(--text3)" fontSize={10} tickLine={false} />
                    <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} unit="d" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    <Bar dataKey="On Track" fill="var(--clr-good)" name="On Track" radius={[4, 4, 0, 0]} barSize={12} />
                    <Bar dataKey="SLA Breach" fill="var(--clr-critical)" name="SLA Breach" radius={[4, 4, 0, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 16: Primary Delay Reason vs SLA Breach Rate */}
            <div className="chart-card-premium">
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Delay Reason vs SLA Breach Rate</h3>
                <small style={{ color: 'var(--text3)', fontSize: '11px' }}>The actual SLA failure rate associated with each specific delay type</small>
              </div>
              <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer>
                  <BarChart data={rootCauseChartsData.delayBreachRateData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text3)" fontSize={9} tickLine={false} />
                    <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} unit="%" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="Breach Rate" fill="var(--clr-critical)" radius={[4, 4, 0, 0]} barSize={16}>
                      {rootCauseChartsData.delayBreachRateData.map((entry, idx) => {
                        const colors = ['var(--clr-critical)', 'var(--clr-warn)', 'var(--clr-caution)', 'var(--clr-neutral)', 'var(--clr-neutral)'];
                        return <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 4: CHRONOLOGICAL TRENDS (WITH provider-wise vs market-wise toggle) */}
      {/* ======================================================== */}
      {activeSubTab === 'trends' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.2s ease-out' }}>
          
          {/* Main Toggle Chart: Provider-Wise vs Market-Wise */}
          <div className="chart-card-premium">
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ClipboardList size={16} color="var(--accent)" />
                  Chronological Onboarding Speed & Trend Diagnostics
                </h3>
                <small style={{ color: 'var(--text3)', fontSize: '11px' }}>
                  {trendViewMode === 'provider' ? 'Individual timeline tracking every provider chronologically' : 'Multi-market chronological monthly trend tracking averages'}
                </small>
              </div>
              
              {/* Toggle Switcher */}
              <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '2px' }}>
                <button
                  onClick={() => setTrendViewMode('provider')}
                  style={{
                    background: trendViewMode === 'provider' ? 'var(--surface2)' : 'none',
                    border: 'none',
                    borderRadius: '4px',
                    color: trendViewMode === 'provider' ? 'var(--accent)' : 'var(--text3)',
                    padding: '4px 12px',
                    fontSize: '11px',
                    fontWeight: trendViewMode === 'provider' ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  Provider-Wise
                </button>
                <button
                  onClick={() => setTrendViewMode('market')}
                  style={{
                    background: trendViewMode === 'market' ? 'var(--surface2)' : 'none',
                    border: 'none',
                    borderRadius: '4px',
                    color: trendViewMode === 'market' ? 'var(--accent)' : 'var(--text3)',
                    padding: '4px 12px',
                    fontSize: '11px',
                    fontWeight: trendViewMode === 'market' ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  Market-Wise
                </button>
              </div>
            </div>

            {/* Conditional Rendering of Provider-Wise or Market-Wise Trend */}
            <div style={{ width: '100%', height: 260 }}>
              {trendViewMode === 'provider' ? (
                <ResponsiveContainer>
                  <AreaChart data={chronologicalProviders} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="areaOnboardingProvider" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="id" stroke="var(--text3)" fontSize={9} tickLine={false} />
                    <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} unit="d" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="Onboarding Days" stroke="var(--accent)" strokeWidth={2} fillOpacity={1} fill="url(#areaOnboardingProvider)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer>
                  <LineChart data={marketMonthlyTrendsData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="month" stroke="var(--text3)" fontSize={9} tickLine={false} />
                    <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} unit="d" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="CA" stroke="var(--accent)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="FL" stroke="var(--clr-good)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="TX" stroke="oklch(0.65 0.18 200.0)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Bottom Grid for monthly KPI trends */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
            
            {/* Chart 21: SLA Breach Rate Trend by Month */}
            <div className="chart-card-premium">
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>SLA Breach Rate Trend by Month</h3>
                <small style={{ color: 'var(--text3)', fontSize: '11px' }}>Intake cohort failures over time</small>
              </div>
              <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer>
                  <LineChart data={monthlyTrendsData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="month" stroke="var(--text3)" fontSize={9} tickLine={false} />
                    <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} unit="%" />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="SLA Breach Rate (%)" stroke="var(--clr-critical)" strokeWidth={2} dot={{ r: 4, strokeWidth: 1 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 23: Overall Onboarding Duration Monthly Average */}
            <div className="chart-card-premium">
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Overall Onboarding Speed Trend</h3>
                <small style={{ color: 'var(--text3)', fontSize: '11px' }}>Average onboarding days tracked over time</small>
              </div>
              <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer>
                  <LineChart data={monthlyTrendsData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="month" stroke="var(--text3)" fontSize={9} tickLine={false} />
                    <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} unit="d" />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="Avg Onboarding Days" stroke="var(--clr-good)" strokeWidth={2} dot={{ r: 4, strokeWidth: 1 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
