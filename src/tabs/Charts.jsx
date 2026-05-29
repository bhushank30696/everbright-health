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
  ClipboardList,
  FileText,
  Shield,
  ThumbsUp,
  Sparkles,
  Layers,
  Target,
  CheckCircle2,
  User,
  Zap,
  Eye,
  EyeOff,
  TrendingUp
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
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
  ZAxis,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ReferenceLine,
  ReferenceArea
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

// ==========================================
// STATIC DATASETS FOR NO CORRELATION SUB-TAB
// ==========================================

const noCorrInsight1AData = [
  { group: '< 75% tasks', satisfaction: 4.17, color: '#85B7EB' },
  { group: '75–90% tasks', satisfaction: 4.09, color: '#85B7EB' },
  { group: '> 90% tasks', satisfaction: 4.11, color: '#85B7EB' }
];

const noCorrInsight1BData = [
  { group: '0 escalations', satisfaction: 4.40, color: '#1D9E75' },
  { group: '1–2 escalations', satisfaction: 4.15, color: '#EF9F27' },
  { group: '3–5 escalations', satisfaction: 3.88, color: '#E24B4A' }
];

const noCorrInsight2AData = [
  { phase: 'Training', Short: 21.7, Long: 26.3, ShortColor: '#9FE1CB', LongColor: '#E24B4A', gap: '+4.6 days' },
  { phase: 'IT Provisioning', Short: 21.9, Long: 25.3, ShortColor: '#9FE1CB', LongColor: '#E24B4A', gap: '+3.4 days' },
  { phase: 'Compliance', Short: 22.4, Long: 24.9, ShortColor: '#9FE1CB', LongColor: '#E24B4A', gap: '+2.5 days' },
  { phase: 'Contracting', Short: 22.8, Long: 24.5, ShortColor: '#9FE1CB', LongColor: '#E24B4A', gap: '+1.7 days' }
];

const noCorrInsight2BData = [
  { name: 'Short training (≤ 5.9d)', avgDays: 21.9, breachRate: 32 },
  { name: 'Long training (> 5.9d)', avgDays: 25.5, breachRate: 53 }
];

const noCorrInsight2CData = [
  { bucket: '< 4d training', avgDays: 21.4, color: '#9FE1CB' },
  { bucket: '4–6d training', avgDays: 22.8, color: '#9FE1CB' },
  { bucket: '6–8d training', avgDays: 25.0, color: '#FAC775' },
  { bucket: '> 8d training', avgDays: 26.7, color: '#E24B4A' }
];

const noCorrInsight3AData = [
  { type: 'Operations', breachRate: 67, label: 'n=9', color: '#A32D2D' },
  { type: 'Other', breachRate: 50, label: 'n=10', color: '#EF9F27' },
  { type: 'Compliance', breachRate: 44, label: 'n=9', color: '#FAC775' },
  { type: 'IT', breachRate: 25, label: 'n=8', color: '#1D9E75' }
];

const noCorrInsight3BData = [
  { type: 'Operations', breached: 6, withinSLA: 3 },
  { type: 'Other', breached: 5, withinSLA: 5 },
  { type: 'Compliance', breached: 4, withinSLA: 5 },
  { type: 'IT', breached: 2, withinSLA: 6 }
];

const noCorrInsight3CData = [
  { reason: 'IT Access', breachRate: 73, escalations: 19, satisfaction: 40 },
  { reason: 'Scheduling', breachRate: 56, escalations: 15, satisfaction: 41 },
  { reason: 'Internal Handoff', breachRate: 20, escalations: 32, satisfaction: 40 },
  { reason: 'Vendor SLA', breachRate: 13, escalations: 23, satisfaction: 41 },
  { reason: 'Missing Docs', breachRate: 67, escalations: 13, satisfaction: 41 }
];

// ==========================================
// STATIC DATASETS FOR CORE INSIGHTS SUB-TAB
// ==========================================

const CORE_CHART_TITLES = {
  'chart-nc-1a': 'Avg satisfaction by task completion group',
  'chart-nc-1b': 'Avg satisfaction by escalation count group',
  'chart-nc-2a': 'Phase impact on onboarding duration',
  'chart-nc-2b': 'Short training vs long training impact',
  'chart-nc-2c': 'Training duration staircase trend',
  'chart-nc-3a': 'Breach rate per escalation type',
  'chart-nc-3b': 'Raw breach counts per escalation type',
  'chart-nc-3c': 'Handoff coordination delay metrics',
  'chart-25': 'IT Access Delay & Ticket Speed Compounding Impact',
  'chart-26': 'Texas Onboarding Duration & Stage Bottleneck',
  'chart-27': 'Task Completion & Escalation Satisfaction Collapse',
  'chart-28': 'Average Onboarding Duration by Market',
  'chart-29': 'Average Satisfaction Score by Market',
  'chart-30': 'Average Ticket Resolution Time by Market',
  'chart-31': 'Market vs Task Completion Rate',
  'chart-32': 'Total Escalations by Market',
  'chart-33': 'SLA Breach by Market',
  'chart-34': 'Onboarding Stages by Market',
  'chart-35': 'Primary Delay Reasons',
  'chart-36': 'Distribution of Escalation Types',
  'chart-37': 'Primary Delay Reason vs Market',
  'chart-38': 'SLA Breach vs Avg Ticket Resolution Time',
  'chart-39': 'Market vs SLA Breach vs Onboarding Days',
  'chart-40': 'Delay Reason vs SLA Breach Rate',
  'chart-41': 'Chronological Onboarding Speed & Trend Diagnostics',
  'chart-42': 'SLA Breach Rate Trend by Month',
  'chart-43': 'Overall Onboarding Speed Trend',
};

// Reusable Helper Component to allow hiding/unhiding of charts across all tabs
const CollapsibleChartCard = ({ id, title, children, minimizedCharts, onToggle, className = "chart-card-premium", style = {} }) => {
  const isHidden = minimizedCharts[id];
  if (isHidden) {
    return null;
  }
  return children;
};

export default function Charts() {
  const { activeState, activeQuarter, dashboardData, providers, allProvidersInQuarter } = useDashboard();
  const { kpis } = dashboardData;
  // Sub-tabs navigation state
  const { activeSubTab, setActiveSubTab } = useDashboard();
  const [minimizedCharts, setMinimizedCharts] = useState(() => {
    try {
      const saved = localStorage.getItem('minimizedCharts');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const toggleChart = (chartId) => {
    setMinimizedCharts(prev => {
      const updated = { ...prev, [chartId]: !prev[chartId] };
      localStorage.setItem('minimizedCharts', JSON.stringify(updated));
      return updated;
    });
  };
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


  // Helper Custom Node for Chart 1 Scatter
  const renderCustomScatterNode = (props) => {
    const { cx, cy, payload } = props;
    if (cx === undefined || cy === undefined) return null;
    const isBreached = payload.breached === 1;
    const delay = payload.delay;
    const colors = {
      'IT Access': '#c44200',
      'Scheduling': '#ff6200',
      'Internal Handoff': '#d97706',
      'Missing Docs': '#0d7e6e',
      'Vendor SLA': '#8c8a84'
    };
    const color = colors[delay] || '#8c8a84';
    if (isBreached) {
      return (
        <path
          d={`M ${cx} ${cy - 5} L ${cx + 5} ${cy + 5} L ${cx - 5} ${cy + 5} Z`}
          fill={color}
          stroke="var(--card)"
          strokeWidth={1}
          style={{ cursor: 'pointer' }}
        />
      );
    } else {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={4.5}
          fill={color}
          stroke="var(--card)"
          strokeWidth={1}
          style={{ cursor: 'pointer' }}
        />
      );
    }
  };



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
        <div className="meta" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', marginTop: '6px', color: 'var(--accent)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <span>CURRENT DATASET COHORT: {kpis.total_providers} PROVIDERS · {activeQuarter} 2025 · FILTER: {activeState.toUpperCase()}</span>
          {Object.values(minimizedCharts).some(val => val) && (
            <button 
              onClick={() => { setMinimizedCharts({}); localStorage.removeItem('minimizedCharts'); }} 
              style={{
                fontSize: '9px',
                fontWeight: '700',
                color: '#E24B4A',
                border: '1px solid #F7C1C1',
                background: '#FCEBEB',
                borderRadius: '4px',
                padding: '2px 8px',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                marginLeft: '10px',
                textTransform: 'uppercase'
              }}
            >
              <Eye size={10} /> Reset Minimized Charts ({Object.values(minimizedCharts).filter(val => val).length})
            </button>
          )}
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
          📈 Trends
        </button>
        <button
          className={`charts-sub-btn ${activeSubTab === 'nocorrelation' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('nocorrelation')}
        >
          🚫 Deep Dive Insights
        </button>

      </div>

      {/* ======================================================== */}
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
            <CollapsibleChartCard id="chart-25" title="IT Access Delay & Ticket Speed Compounding Impact" minimizedCharts={minimizedCharts} onToggle={toggleChart}>
  <div className="chart-card-premium" style={{ height: '100%', justifyContent: 'center' }}>
              <div className="card-header" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
  <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>IT Access Delay & Ticket Speed Compounding Impact</h3>
  <button 
    onClick={() => toggleChart('chart-25')}
    title="Minimize Chart"
    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', marginLeft: '8px', transition: 'all 0.2s' }}
  >
    <EyeOff size={13} />
  </button>
</div>
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
</CollapsibleChartCard>
          </div>

          {/* ROW 2: TEXAS MARKET PROCESS HANDOFF BOTTLENECK */}
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
            <CollapsibleChartCard id="chart-26" title="Texas Onboarding Duration & Stage Bottleneck" minimizedCharts={minimizedCharts} onToggle={toggleChart}>
  <div className="chart-card-premium" style={{ height: '100%', justifyContent: 'center' }}>
              <div className="card-header" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
  <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Texas Onboarding Duration & Stage Bottleneck</h3>
  <button 
    onClick={() => toggleChart('chart-26')}
    title="Minimize Chart"
    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', marginLeft: '8px', transition: 'all 0.2s' }}
  >
    <EyeOff size={13} />
  </button>
</div>
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
</CollapsibleChartCard>
          </div>

          {/* ROW 3: LOW TASK COMPLETION & HIGH ESCALATION IMPACT ON SATISFACTION */}
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
            <CollapsibleChartCard id="chart-27" title="Task Completion & Escalation Satisfaction Collapse" minimizedCharts={minimizedCharts} onToggle={toggleChart}>
  <div className="chart-card-premium" style={{ height: '100%', justifyContent: 'center' }}>
              <div className="card-header" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
  <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Task Completion & Escalation Satisfaction Collapse</h3>
  <button 
    onClick={() => toggleChart('chart-27')}
    title="Minimize Chart"
    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', marginLeft: '8px', transition: 'all 0.2s' }}
  >
    <EyeOff size={13} />
  </button>
</div>
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
</CollapsibleChartCard>
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
            <CollapsibleChartCard id="chart-28" title="Average Onboarding Duration by Market" minimizedCharts={minimizedCharts} onToggle={toggleChart}>
  <div className="chart-card-premium">
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
  <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Average Onboarding Duration by Market</h3>
  <button 
    onClick={() => toggleChart('chart-28')}
    title="Minimize Chart"
    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', marginLeft: '8px', transition: 'all 0.2s' }}
  >
    <EyeOff size={13} />
  </button>
</div>
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
</CollapsibleChartCard>

            {/* Chart 5: Average Satisfaction Score by Market */}
            <CollapsibleChartCard id="chart-29" title="Average Satisfaction Score by Market" minimizedCharts={minimizedCharts} onToggle={toggleChart}>
  <div className="chart-card-premium">
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
  <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Average Satisfaction Score by Market</h3>
  <button 
    onClick={() => toggleChart('chart-29')}
    title="Minimize Chart"
    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', marginLeft: '8px', transition: 'all 0.2s' }}
  >
    <EyeOff size={13} />
  </button>
</div>
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
</CollapsibleChartCard>

            {/* Chart 6: Average Ticket Resolution Time by Market */}
            <CollapsibleChartCard id="chart-30" title="Average Ticket Resolution Time by Market" minimizedCharts={minimizedCharts} onToggle={toggleChart}>
  <div className="chart-card-premium">
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
  <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Average Ticket Resolution Time by Market</h3>
  <button 
    onClick={() => toggleChart('chart-30')}
    title="Minimize Chart"
    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', marginLeft: '8px', transition: 'all 0.2s' }}
  >
    <EyeOff size={13} />
  </button>
</div>
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
</CollapsibleChartCard>

            {/* Chart 7: Market vs Task Completion Rate */}
            <CollapsibleChartCard id="chart-31" title="Market vs Task Completion Rate" minimizedCharts={minimizedCharts} onToggle={toggleChart}>
  <div className="chart-card-premium">
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
  <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Market vs Task Completion Rate</h3>
  <button 
    onClick={() => toggleChart('chart-31')}
    title="Minimize Chart"
    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', marginLeft: '8px', transition: 'all 0.2s' }}
  >
    <EyeOff size={13} />
  </button>
</div>
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
</CollapsibleChartCard>

            {/* Chart 8: Total Escalations by Market */}
            <CollapsibleChartCard id="chart-32" title="Total Escalations by Market" minimizedCharts={minimizedCharts} onToggle={toggleChart}>
  <div className="chart-card-premium">
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
  <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Total Escalations by Market</h3>
  <button 
    onClick={() => toggleChart('chart-32')}
    title="Minimize Chart"
    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', marginLeft: '8px', transition: 'all 0.2s' }}
  >
    <EyeOff size={13} />
  </button>
</div>
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
</CollapsibleChartCard>

            {/* Chart 9: SLA Breach Counts by Market */}
            <CollapsibleChartCard id="chart-33" title="SLA Breach by Market" minimizedCharts={minimizedCharts} onToggle={toggleChart}>
  <div className="chart-card-premium">
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
  <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>SLA Breach by Market</h3>
  <button 
    onClick={() => toggleChart('chart-33')}
    title="Minimize Chart"
    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', marginLeft: '8px', transition: 'all 0.2s' }}
  >
    <EyeOff size={13} />
  </button>
</div>
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
</CollapsibleChartCard>

            {/* Chart 10: Onboarding Stages by Market */}
            <CollapsibleChartCard id="chart-34" title="Onboarding Stages by Market" minimizedCharts={minimizedCharts} onToggle={toggleChart}>
  <div className="chart-card-premium" style={{ gridColumn: '1 / -1' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
  <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Onboarding Stages by Market</h3>
  <button 
    onClick={() => toggleChart('chart-34')}
    title="Minimize Chart"
    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', marginLeft: '8px', transition: 'all 0.2s' }}
  >
    <EyeOff size={13} />
  </button>
</div>
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
</CollapsibleChartCard>

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
            <CollapsibleChartCard id="chart-35" title="Primary Delay Reasons" minimizedCharts={minimizedCharts} onToggle={toggleChart}>
  <div className="chart-card-premium">
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
  <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Primary Delay Reasons</h3>
  <button 
    onClick={() => toggleChart('chart-35')}
    title="Minimize Chart"
    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', marginLeft: '8px', transition: 'all 0.2s' }}
  >
    <EyeOff size={13} />
  </button>
</div>
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
</CollapsibleChartCard>

            {/* Chart 12: Distribution of Escalation Types */}
            <CollapsibleChartCard id="chart-36" title="Distribution of Escalation Types" minimizedCharts={minimizedCharts} onToggle={toggleChart}>
  <div className="chart-card-premium">
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
  <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Distribution of Escalation Types</h3>
  <button 
    onClick={() => toggleChart('chart-36')}
    title="Minimize Chart"
    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', marginLeft: '8px', transition: 'all 0.2s' }}
  >
    <EyeOff size={13} />
  </button>
</div>
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
</CollapsibleChartCard>

            {/* Chart 13: Primary Delay Reason vs Market */}
            <CollapsibleChartCard id="chart-37" title="Primary Delay Reason vs Market" minimizedCharts={minimizedCharts} onToggle={toggleChart}>
  <div className="chart-card-premium">
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
  <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Primary Delay Reason vs Market</h3>
  <button 
    onClick={() => toggleChart('chart-37')}
    title="Minimize Chart"
    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', marginLeft: '8px', transition: 'all 0.2s' }}
  >
    <EyeOff size={13} />
  </button>
</div>
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
</CollapsibleChartCard>

            {/* Chart 14: SLA Breach vs Average Ticket Resolution Time */}
            <CollapsibleChartCard id="chart-38" title="SLA Breach vs Avg Ticket Resolution Time" minimizedCharts={minimizedCharts} onToggle={toggleChart}>
  <div className="chart-card-premium">
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
  <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>SLA Breach vs Avg Ticket Resolution Time</h3>
  <button 
    onClick={() => toggleChart('chart-38')}
    title="Minimize Chart"
    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', marginLeft: '8px', transition: 'all 0.2s' }}
  >
    <EyeOff size={13} />
  </button>
</div>
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
</CollapsibleChartCard>

            {/* Chart 15: Market vs SLA Breach vs Onboarding Days */}
            <CollapsibleChartCard id="chart-39" title="Market vs SLA Breach vs Onboarding Days" minimizedCharts={minimizedCharts} onToggle={toggleChart}>
  <div className="chart-card-premium">
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
  <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Market vs SLA Breach vs Onboarding Days</h3>
  <button 
    onClick={() => toggleChart('chart-39')}
    title="Minimize Chart"
    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', marginLeft: '8px', transition: 'all 0.2s' }}
  >
    <EyeOff size={13} />
  </button>
</div>
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
</CollapsibleChartCard>

            {/* Chart 16: Primary Delay Reason vs SLA Breach Rate */}
            <CollapsibleChartCard id="chart-40" title="Delay Reason vs SLA Breach Rate" minimizedCharts={minimizedCharts} onToggle={toggleChart}>
  <div className="chart-card-premium">
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
  <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Delay Reason vs SLA Breach Rate</h3>
  <button 
    onClick={() => toggleChart('chart-40')}
    title="Minimize Chart"
    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', marginLeft: '8px', transition: 'all 0.2s' }}
  >
    <EyeOff size={13} />
  </button>
</div>
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
</CollapsibleChartCard>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 4: CHRONOLOGICAL TRENDS (WITH provider-wise vs market-wise toggle) */}
      {/* ======================================================== */}
      {activeSubTab === 'trends' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.2s ease-out' }}>
          
          {/* Main Toggle Chart: Provider-Wise vs Market-Wise */}
          <CollapsibleChartCard id="chart-41" title="Chronological Onboarding Speed & Trend Diagnostics" minimizedCharts={minimizedCharts} onToggle={toggleChart}>
  <div className="chart-card-premium">
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
  <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ClipboardList size={16} color="var(--accent)" />
                  Chronological Onboarding Speed & Trend Diagnostics
                </h3>
  <button 
    onClick={() => toggleChart('chart-41')}
    title="Minimize Chart"
    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', marginLeft: '8px', transition: 'all 0.2s' }}
  >
    <EyeOff size={13} />
  </button>
</div>
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
</CollapsibleChartCard>

          {/* Bottom Grid for monthly KPI trends */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
            
            {/* Chart 21: SLA Breach Rate Trend by Month */}
            <CollapsibleChartCard id="chart-42" title="SLA Breach Rate Trend by Month" minimizedCharts={minimizedCharts} onToggle={toggleChart}>
  <div className="chart-card-premium">
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
  <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>SLA Breach Rate Trend by Month</h3>
  <button 
    onClick={() => toggleChart('chart-42')}
    title="Minimize Chart"
    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', marginLeft: '8px', transition: 'all 0.2s' }}
  >
    <EyeOff size={13} />
  </button>
</div>
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
</CollapsibleChartCard>

            {/* Chart 23: Overall Onboarding Duration Monthly Average */}
            <CollapsibleChartCard id="chart-43" title="Overall Onboarding Speed Trend" minimizedCharts={minimizedCharts} onToggle={toggleChart}>
  <div className="chart-card-premium">
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
  <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Overall Onboarding Speed Trend</h3>
  <button 
    onClick={() => toggleChart('chart-43')}
    title="Minimize Chart"
    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', marginLeft: '8px', transition: 'all 0.2s' }}
  >
    <EyeOff size={13} />
  </button>
</div>
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
</CollapsibleChartCard>

          </div>
        </div>
      )}



      {activeSubTab === 'nocorrelation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', animation: 'fadeIn 0.2s ease-out' }}>
          
          {/* ======================================================== */}
          {/* INSIGHT 1: TASK COMPLETION IS THE WRONG KPI */}
          {/* ======================================================== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header Callout Card */}
            <div style={{ padding: '16px 20px', background: 'var(--surface)', borderLeft: '4px solid #E24B4A', borderRadius: '4px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text)', margin: '0 0 4px 0', fontFamily: 'var(--font-sans)' }}>
                Insight 1 — Task completion is the wrong KPI
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text2)', margin: 0, fontFamily: 'var(--font-sans)' }}>
                When providers are grouped by task completion, satisfaction barely changes. When grouped by escalation count, satisfaction drops sharply. Same grouping logic. Completely different result.
              </p>
            </div>

            {/* Side-by-Side Collapsible Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
              
              {/* Chart A */}
              <CollapsibleChartCard id="chart-nc-1a" title="Avg satisfaction by task completion group" minimizedCharts={minimizedCharts} onToggle={toggleChart}>
                <div className="chart-card-premium" style={{ background: '#FFFFFF', padding: '20px', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                      <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', fontFamily: 'var(--font-sans)', margin: '0 0 2px 0' }}>Avg satisfaction by task completion group</h3>
                      <button 
                        onClick={() => toggleChart('chart-nc-1a')}
                        title="Minimize Chart"
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', marginLeft: '8px', transition: 'all 0.2s' }}
                      >
                        <EyeOff size={13} />
                      </button>
                    </div>
                    <small style={{ color: 'var(--text3)', fontSize: '11px', display: 'block', lineHeight: '1.4' }}>If task completion drove satisfaction, bars should clearly step down. They don't.</small>
                  </div>
                  
                  <div style={{ width: '100%', height: 200 }}>
                    <ResponsiveContainer>
                      <BarChart data={noCorrInsight1AData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="group" stroke="var(--text3)" fontSize={10} tickLine={false} />
                        <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} domain={[3.8, 4.6]} />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={4.12} stroke="var(--text3)" strokeDasharray="3 3" label={{ value: 'Dataset avg', fill: 'var(--text3)', fontSize: 9, position: 'top' }} />
                        <Bar dataKey="satisfaction" fill="#85B7EB" radius={[4, 4, 0, 0]} barSize={36} label={{ position: 'top', formatter: (v) => v.toFixed(2), fill: 'var(--text)', fontSize: 10, fontWeight: '700' }} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={{ borderLeft: '3px solid var(--clr-critical)', padding: '12px 16px', background: 'var(--surface2)', borderRadius: '0 var(--radius) var(--radius) 0', marginTop: '16px', fontSize: '11.5px', color: 'var(--text2)', lineHeight: '1.6' }}>
                    All three bars are nearly the same height — 4.17, 4.09, 4.11.<br/>
                    High task completion and low task completion groups have identical satisfaction scores.<br/>
                    <strong>The metric is producing no signal.</strong>
                  </div>
                </div>
              </CollapsibleChartCard>

              {/* Chart B */}
              <CollapsibleChartCard id="chart-nc-1b" title="Avg satisfaction by escalation count group" minimizedCharts={minimizedCharts} onToggle={toggleChart}>
                <div className="chart-card-premium" style={{ background: '#FFFFFF', padding: '20px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', position: 'relative' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                      <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', fontFamily: 'var(--font-sans)', margin: '0 0 2px 0' }}>Avg satisfaction by escalation count group</h3>
                      <button 
                        onClick={() => toggleChart('chart-nc-1b')}
                        title="Minimize Chart"
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', marginLeft: '8px', transition: 'all 0.2s' }}
                      >
                        <EyeOff size={13} />
                      </button>
                    </div>
                    <small style={{ color: 'var(--text3)', fontSize: '11px', display: 'block', lineHeight: '1.4' }}>Same grouping logic — completely different result. Clear staircase down.</small>
                  </div>
                  
                  <div style={{ width: '100%', height: 200, position: 'relative' }}>
                    <ResponsiveContainer>
                      <BarChart data={noCorrInsight1BData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="group" stroke="var(--text3)" fontSize={10} tickLine={false} />
                        <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} domain={[3.6, 4.6]} />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={4.12} stroke="var(--text3)" strokeDasharray="3 3" label={{ value: 'Dataset avg', fill: 'var(--text3)', fontSize: 9, position: 'top' }} />
                        <Bar dataKey="satisfaction" radius={[4, 4, 0, 0]} barSize={36} label={{ position: 'top', formatter: (v) => v.toFixed(2), fill: 'var(--text)', fontSize: 10, fontWeight: '700' }}>
                          {noCorrInsight1BData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    
                    {/* Downward sloping arrow overlay */}
                    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                      <defs>
                        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#E24B4A" />
                        </marker>
                      </defs>
                      <line x1="30%" y1="28%" x2="80%" y2="82%" stroke="#E24B4A" strokeWidth="2" strokeDasharray="4 3" markerEnd="url(#arrow)" />
                      <rect x="50%" y="45%" width="64" height="18" fill="var(--card)" rx="4" stroke="var(--border)" strokeWidth="0.5" />
                      <text x="50%" y="45%" dx="32" dy="12" textAnchor="middle" fill="#E24B4A" fontSize="9px" fontWeight="700">−0.52 drop</text>
                    </svg>
                  </div>

                  <div style={{ borderLeft: '3px solid var(--clr-good)', padding: '12px 16px', background: 'var(--surface2)', borderRadius: '0 var(--radius) var(--radius) 0', marginTop: '16px', fontSize: '11.5px', color: 'var(--text2)', lineHeight: '1.6' }}>
                    A 0.52-point drop from 0 escalations to 3–5 escalations.<br/>
                    Every escalation bucket steps clearly down.<br/>
                    <strong>Escalation count is the real satisfaction driver — not task completion.</strong>
                  </div>
                </div>
              </CollapsibleChartCard>

            </div>

            {/* Stat Comparison Summary Row */}
            <div style={{ border: '0.5px solid var(--border)', borderRadius: '8px', padding: '16px', background: 'var(--surface2)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'center' }}>
                
                {/* Left Summary Box */}
                <div style={{ paddingRight: '15px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: '8px' }}>What Chart A says</h4>
                  <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '600', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span>High task % group avg sat = <span style={{ color: 'var(--accent)' }}>4.11</span></span>
                    <span>Low task % group avg sat = <span style={{ color: 'var(--text2)' }}>4.17</span></span>
                    <span style={{ color: 'var(--clr-good)', fontWeight: '700', fontSize: '11.5px', background: '#EAF3DE', padding: '2px 6px', borderRadius: '4px', width: 'fit-content', marginTop: '4px' }}>Difference: +0.06 — meaningless</span>
                  </div>
                </div>

                {/* Right Summary Box */}
                <div style={{ paddingLeft: '15px', borderLeft: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: '8px' }}>What Chart B says</h4>
                  <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '600', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span>0 escalations avg sat = <span style={{ color: 'var(--clr-good)' }}>4.40</span></span>
                    <span>3–5 escalations avg sat = <span style={{ color: 'var(--clr-critical)' }}>3.88</span></span>
                    <span style={{ color: '#E24B4A', fontWeight: '700', fontSize: '11.5px', background: '#FCEBEB', padding: '2px 6px', borderRadius: '4px', width: 'fit-content', marginTop: '4px' }}>Difference: −0.52 — large and clear</span>
                  </div>
                </div>

              </div>

              <div style={{ borderLeft: '3px solid var(--clr-critical)', padding: '10px 14px', background: '#FFFFFF', borderRadius: '0 4px 4px 0', marginTop: '16px', fontSize: '11.5px', color: 'var(--text2)' }}>
                Same grouping logic applied to two different metrics. Task completion produces flat bars. Escalations produce a staircase. The current dashboard is built around the flat metric.
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* INSIGHT 2: TRAINING DAYS: THE SILENT DURATION KILLER */}
          {/* ======================================================== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header Callout Card */}
            <div style={{ padding: '16px 20px', background: 'var(--surface)', borderLeft: '4px solid #E24B4A', borderRadius: '4px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text)', margin: '0 0 4px 0', fontFamily: 'var(--font-sans)' }}>
                Insight 2 — Training days: the silent duration killer
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text2)', margin: 0, fontFamily: 'var(--font-sans)' }}>
                No statistics needed. When any phase runs long, how many extra days does total onboarding take? The phase with the biggest gap is the biggest driver.
              </p>
            </div>

            {/* Top Panel (Full Width) */}
            <CollapsibleChartCard id="chart-nc-2a" title="Phase impact on onboarding duration" minimizedCharts={minimizedCharts} onToggle={toggleChart}>
              <div className="chart-card-premium" style={{ background: '#FFFFFF', padding: '20px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', position: 'relative' }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                    <h3 style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text)', fontFamily: 'var(--font-sans)', margin: '0 0 2px 0' }}>When each phase runs long vs short — how many extra days does it add to total onboarding?</h3>
                    <button 
                      onClick={() => toggleChart('chart-nc-2a')}
                      title="Minimize Chart"
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', marginLeft: '8px', transition: 'all 0.2s' }}
                    >
                      <EyeOff size={13} />
                    </button>
                  </div>
                  <small style={{ color: 'var(--text3)', fontSize: '11px', display: 'block', lineHeight: '1.4' }}>Every phase split at its median. Long group vs short group. Biggest gap = biggest bottleneck.</small>
                </div>

                <div style={{ width: '100%', height: 260, position: 'relative' }}>
                  <ResponsiveContainer>
                    <BarChart data={noCorrInsight2AData} margin={{ top: 30, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="phase" stroke="var(--text3)" fontSize={10} tickLine={false} />
                      <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} domain={[18, 30]} />
                      <Tooltip content={<CustomTooltip />} />
                      
                      {/* Shaded highlight for Training */}
                      <ReferenceArea x1="Training" x2="Training" fill="#FCEBEB" fillOpacity={0.25} />
                      
                      <Legend iconSize={10} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Bar dataKey="Short" fill="#9FE1CB" name="Short (below median)" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: 'var(--text2)', fontSize: 10, fontWeight: '600' }} />
                      <Bar dataKey="Long" fill="#E24B4A" name="Long (above median)" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: 'var(--text2)', fontSize: 10, fontWeight: '600' }} />
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Highlight label for Training */}
                  <div style={{ position: 'absolute', top: 5, left: '6%', background: '#E24B4A', color: '#FFFFFF', fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                    Biggest lever
                  </div>

                  {/* Bracket annotations overlay */}
                  <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    {/* Training Bracket */}
                    <path d="M 8% 40 L 8% 28 L 22% 28 L 22% 40" fill="none" stroke="#E24B4A" strokeWidth="1.5" />
                    <text x="15%" y="23" textAnchor="middle" fill="#E24B4A" fontSize="10px" fontWeight="800">+4.6 days</text>

                    {/* IT Prov Bracket */}
                    <path d="M 32% 40 L 32% 28 L 46% 28 L 46% 40" fill="none" stroke="var(--text3)" strokeWidth="1.2" />
                    <text x="39%" y="23" textAnchor="middle" fill="var(--text)" fontSize="9.5px" fontWeight="600">+3.4 days</text>

                    {/* Compliance Bracket */}
                    <path d="M 57% 40 L 57% 28 L 71% 28 L 71% 40" fill="none" stroke="var(--text3)" strokeWidth="1.2" />
                    <text x="64%" y="23" textAnchor="middle" fill="var(--text)" fontSize="9.5px" fontWeight="600">+2.5 days</text>

                    {/* Contracting Bracket */}
                    <path d="M 81% 40 L 81% 28 L 95% 28 L 95% 40" fill="none" stroke="var(--text3)" strokeWidth="1.2" />
                    <text x="88%" y="23" textAnchor="middle" fill="var(--text)" fontSize="9.5px" fontWeight="600">+1.7 days</text>
                  </svg>
                </div>

                <div style={{ borderLeft: '3px solid var(--clr-critical)', padding: '12px 16px', background: 'var(--surface2)', borderRadius: '0 var(--radius) var(--radius) 0', marginTop: '16px', fontSize: '11.5px', color: 'var(--text2)', lineHeight: '1.6' }}>
                  Read this chart as: when training runs long, total onboarding takes 4.6 extra days on average. When contracting runs long, it takes only 1.7 extra days. <strong>Training is the biggest lever — 2.7× more impactful than contracting.</strong> No statistics needed. Just compare the gaps.
                </div>
              </div>
            </CollapsibleChartCard>

            {/* Bottom Panels (Side-by-Side) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
              
              {/* Bottom Left Panel */}
              <CollapsibleChartCard id="chart-nc-2b" title="Short training vs long training impact" minimizedCharts={minimizedCharts} onToggle={toggleChart}>
                <div className="chart-card-premium" style={{ background: '#FFFFFF', padding: '20px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', position: 'relative' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                      <h3 style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text)', fontFamily: 'var(--font-sans)', margin: '0 0 2px 0' }}>Short training vs long training: duration and breach rate</h3>
                      <button 
                        onClick={() => toggleChart('chart-nc-2b')}
                        title="Minimize Chart"
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', marginLeft: '8px', transition: 'all 0.2s' }}
                      >
                        <EyeOff size={13} />
                      </button>
                    </div>
                    <small style={{ color: 'var(--text3)', fontSize: '11px', display: 'block', lineHeight: '1.4' }}>Two groups only. Training ≤ 5.9 days vs &gt; 5.9 days.</small>
                  </div>

                  <div style={{ width: '100%', height: 200, position: 'relative' }}>
                    <ResponsiveContainer>
                      <BarChart data={noCorrInsight2BData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--text3)" fontSize={10} tickLine={false} />
                        <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} domain={[0, 30]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="avgDays" radius={[4, 4, 0, 0]} barSize={36} label={{ position: 'top', formatter: (v) => `${v}d`, fill: 'var(--text)', fontSize: 10, fontWeight: '700' }}>
                          <Cell fill="#9FE1CB" />
                          <Cell fill="#E24B4A" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>

                    {/* Arrow / Line Overlay and Breach rate line representation */}
                    <div style={{ position: 'absolute', top: 5, right: '15px', background: 'var(--surface2)', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: '6px', fontSize: '10.5px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <span style={{ fontWeight: '700', color: 'var(--text2)' }}>Breach Rate Trend:</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text3)' }}></span>
                        Short: <span style={{ fontWeight: '700' }}>32%</span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--clr-critical)' }}></span>
                        Long: <span style={{ fontWeight: '700', color: 'var(--clr-critical)' }}>53%</span>
                      </span>
                    </div>

                    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                      <defs>
                        <marker id="darrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text)" />
                        </marker>
                      </defs>
                      <line x1="28%" y1="52%" x2="72%" y2="40%" stroke="var(--text)" strokeWidth="1.5" markerStart="url(#darrow)" markerEnd="url(#darrow)" />
                      <rect x="42%" y="36%" width="46" height="16" fill="var(--card)" rx="4" stroke="var(--border)" strokeWidth="0.5" />
                      <text x="42%" y="36%" dx="23" dy="11" textAnchor="middle" fill="var(--text)" fontSize="8.5px" fontWeight="700">+3.6 days</text>
                    </svg>
                  </div>

                  <div style={{ borderLeft: '3px solid var(--clr-good)', padding: '12px 16px', background: 'var(--surface2)', borderRadius: '0 var(--radius) var(--radius) 0', marginTop: '16px', fontSize: '11.5px', color: 'var(--text2)', lineHeight: '1.6' }}>
                    3.6 extra days and a 21 percentage point higher breach rate — just from being above the training median. No formula. No statistics. <strong>Long training = longer onboarding + higher breach risk.</strong>
                  </div>
                </div>
              </CollapsibleChartCard>

              {/* Bottom Right Panel */}
              <CollapsibleChartCard id="chart-nc-2c" title="Training duration staircase trend" minimizedCharts={minimizedCharts} onToggle={toggleChart}>
                <div className="chart-card-premium" style={{ background: '#FFFFFF', padding: '20px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', position: 'relative' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                      <h3 style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text)', fontFamily: 'var(--font-sans)', margin: '0 0 2px 0' }}>As training gets longer, total onboarding gets longer</h3>
                      <button 
                        onClick={() => toggleChart('chart-nc-2c')}
                        title="Minimize Chart"
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', marginLeft: '8px', transition: 'all 0.2s' }}
                      >
                        <EyeOff size={13} />
                      </button>
                    </div>
                    <small style={{ color: 'var(--text3)', fontSize: '11px', display: 'block', lineHeight: '1.4' }}>Four training buckets → four bars → clear staircase up.</small>
                  </div>

                  <div style={{ width: '100%', height: 200, position: 'relative' }}>
                    <ResponsiveContainer>
                      <BarChart data={noCorrInsight2CData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="bucket" stroke="var(--text3)" fontSize={10} tickLine={false} />
                        <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} domain={[18, 29]} />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={23.5} stroke="var(--text3)" strokeDasharray="3 3" label={{ value: 'Overall avg', fill: 'var(--text3)', fontSize: 9, position: 'top' }} />
                        <Bar dataKey="avgDays" radius={[4, 4, 0, 0]} barSize={28} label={{ position: 'top', formatter: (v) => `${v}d`, fill: 'var(--text)', fontSize: 9.5, fontWeight: '700' }}>
                          {noCorrInsight2CData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>

                    {/* Diagonal upward arrow overlay */}
                    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                      <defs>
                        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#E24B4A" />
                        </marker>
                      </defs>
                      <line x1="16%" y1="72%" x2="84%" y2="32%" stroke="#E24B4A" strokeWidth="2" strokeDasharray="4 3" markerEnd="url(#arrow)" />
                      <rect x="42%" y="45%" width="105" height="18" fill="var(--card)" rx="4" stroke="var(--border)" strokeWidth="0.5" />
                      <text x="42%" y="45%" dx="52" dy="12" textAnchor="middle" fill="#E24B4A" fontSize="9px" fontWeight="700">+5.3 days across range</text>
                    </svg>
                  </div>

                  <div style={{ borderLeft: '3px solid var(--clr-critical)', padding: '12px 16px', background: 'var(--surface2)', borderRadius: '0 var(--radius) var(--radius) 0', marginTop: '16px', fontSize: '11.5px', color: 'var(--text2)', lineHeight: '1.6' }}>
                    Each training bucket adds roughly 1.5 days to total onboarding. The staircase is the entire argument. When training exceeds 8 days, providers average 26.7 days total — 5.3 days above the fastest training group. <strong>This is a staffing and scheduling problem, not a system problem. It silently eats time.</strong>
                  </div>
                </div>
              </CollapsibleChartCard>

            </div>
          </div>

          {/* ======================================================== */}
          {/* INSIGHT 3: OPERATIONS ESCALATIONS PREDICT BREACH, NOT IT */}
          {/* ======================================================== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header Callout Card */}
            <div style={{ padding: '16px 20px', background: 'var(--surface)', borderLeft: '4px solid #E24B4A', borderRadius: '4px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text)', margin: '0 0 4px 0', fontFamily: 'var(--font-sans)' }}>
                Insight 3 — Operations escalations predict breach, not IT escalations
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text2)', margin: 0, fontFamily: 'var(--font-sans)' }}>
                No statistics needed. Just count: of every provider with each escalation type, how many breached SLA? The answer breaks the current narrative.
              </p>
            </div>

            {/* Top Row: Stat Cards */}
            <div style={{ position: 'relative', marginBottom: '4px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                
                {/* Card 1 */}
                <div style={{ background: '#FCEBEB', border: '1px solid #F7C1C1', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '28px', fontWeight: '800', color: '#A32D2D', fontFamily: 'var(--font-mono)' }}>67%</span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Operations escalation — breach rate</span>
                  <span style={{ fontSize: '11px', color: 'var(--text3)' }}>6 out of 9 providers breached</span>
                </div>

                {/* Card 2 */}
                <div style={{ background: '#FFF8EB', border: '1px solid #FAC775', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '28px', fontWeight: '800', color: '#B25E00', fontFamily: 'var(--font-mono)' }}>44%</span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Compliance escalation — breach rate</span>
                  <span style={{ fontSize: '11px', color: 'var(--text3)' }}>4 out of 9 providers breached</span>
                </div>

                {/* Card 3 */}
                <div style={{ background: '#EAF3DE', border: '1px solid #C6E0A6', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '28px', fontWeight: '800', color: '#3B6D11', fontFamily: 'var(--font-mono)' }}>25%</span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>IT escalation — breach rate</span>
                  <span style={{ fontSize: '11px', color: 'var(--text3)' }}>2 out of 8 providers breached</span>
                </div>

              </div>

              {/* Annotation connection badge */}
              <div style={{ position: 'absolute', top: '-10px', right: '10%', background: 'var(--card)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: '20px', fontSize: '9.5px', fontWeight: '700', color: '#A32D2D', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                <TrendingUp size={11} /> Operations breach rate is 2.7× higher than IT
              </div>
            </div>

            {/* Side-by-Side Panels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
              
              {/* Panel 1 */}
              <CollapsibleChartCard id="chart-nc-3a" title="Breach rate per escalation type" minimizedCharts={minimizedCharts} onToggle={toggleChart}>
                <div className="chart-card-premium" style={{ background: '#FFFFFF', padding: '20px', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                      <h3 style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text)', fontFamily: 'var(--font-sans)', margin: '0 0 2px 0' }}>Of every provider with this escalation type, how many breached SLA?</h3>
                      <button 
                        onClick={() => toggleChart('chart-nc-3a')}
                        title="Minimize Chart"
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', marginLeft: '8px', transition: 'all 0.2s' }}
                      >
                        <EyeOff size={13} />
                      </button>
                    </div>
                    <small style={{ color: 'var(--text3)', fontSize: '11px', display: 'block', lineHeight: '1.4' }}>Raw breach rate per escalation type. Simplest question: which type ends in breach most often?</small>
                  </div>

                  <div style={{ width: '100%', height: 220, position: 'relative' }}>
                    <ResponsiveContainer>
                      <BarChart layout="vertical" data={noCorrInsight3AData} margin={{ top: 10, right: 35, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                        <XAxis type="number" stroke="var(--text3)" fontSize={10} tickLine={false} domain={[0, 80]} unit="%" />
                        <YAxis type="category" dataKey="type" stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} width={80} />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine x={47} stroke="var(--text3)" strokeDasharray="3 3" label={{ value: 'Dataset avg (47%)', fill: 'var(--text3)', fontSize: 8.5, position: 'top' }} />
                        <Bar dataKey="breachRate" radius={[0, 4, 4, 0]} barSize={20} label={(props) => {
                          const { x, y, width, height, value, payload } = props;
                          if (!payload) return null;
                          return (
                            <text 
                              x={x + width + 5} 
                              y={y + height / 2 + 4} 
                              fill="var(--text2)" 
                              fontSize={9.5} 
                              fontWeight="600"
                              textAnchor="start"
                            >
                              {`${value}% (${payload.label || ''})`}
                            </text>
                          );
                        }}>
                          {noCorrInsight3AData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={{ borderLeft: '3px solid var(--clr-critical)', padding: '12px 16px', background: 'var(--surface2)', borderRadius: '0 var(--radius) var(--radius) 0', marginTop: '16px', fontSize: '11.5px', color: 'var(--text2)', lineHeight: '1.6' }}>
                    <strong>IT escalations have the LOWEST breach rate (25%).</strong> When a support ticket is opened, a defined resolution process exists. Someone owns it.<br/>
                    <strong>Operations escalations have no equivalent workflow (67%).</strong> When a handoff breaks down or a coordinator drops the ball, no system assigns ownership. The process stalls. The SLA breaks.
                  </div>
                </div>
              </CollapsibleChartCard>

              {/* Panel 2 */}
              <CollapsibleChartCard id="chart-nc-3b" title="Raw breach counts per escalation type" minimizedCharts={minimizedCharts} onToggle={toggleChart}>
                <div className="chart-card-premium" style={{ background: '#FFFFFF', padding: '20px', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                      <h3 style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text)', fontFamily: 'var(--font-sans)', margin: '0 0 2px 0' }}>Raw count: breached vs not breached — by escalation type</h3>
                      <button 
                        onClick={() => toggleChart('chart-nc-3b')}
                        title="Minimize Chart"
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', marginLeft: '8px', transition: 'all 0.2s' }}
                      >
                        <EyeOff size={13} />
                      </button>
                    </div>
                    <small style={{ color: 'var(--text3)', fontSize: '11px', display: 'block', lineHeight: '1.4' }}>Of the 17 total breaches in the dataset, here is where they actually came from.</small>
                  </div>

                  <div style={{ width: '100%', height: 220 }}>
                    <ResponsiveContainer>
                      <BarChart data={noCorrInsight3BData} margin={{ top: 20, right: 10, left: -25, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="type" stroke="var(--text3)" fontSize={10} tickLine={false} />
                        <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} domain={[0, 10]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconSize={10} wrapperStyle={{ fontSize: '10.5px', paddingTop: '6px' }} />
                        <Bar dataKey="breached" stackId="esc" fill="#E24B4A" name="SLA breached" label={{ position: 'inside', fill: '#FFFFFF', fontSize: 9.5, fontWeight: '700' }} />
                        <Bar dataKey="withinSLA" stackId="esc" fill="#9FE1CB" name="Within SLA" radius={[4, 4, 0, 0]} label={{ position: 'inside', fill: 'var(--text2)', fontSize: 9.5, fontWeight: '700' }} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={{ borderLeft: '3px solid #378ADD', padding: '12px 16px', background: 'var(--surface2)', borderRadius: '0 var(--radius) var(--radius) 0', marginTop: '16px', fontSize: '11.5px', color: 'var(--text2)', lineHeight: '1.6' }}>
                    <strong>6 out of 9 vs. 2 out of 8.</strong> These are the same-size groups. The outcomes are completely different.<br/>
                    No formula needed. Just count who breached.
                  </div>
                </div>
              </CollapsibleChartCard>

            </div>

            {/* Bottom Panel (Full Width) */}
            <CollapsibleChartCard id="chart-nc-3c" title="Handoff coordination delay metrics" minimizedCharts={minimizedCharts} onToggle={toggleChart}>
              <div className="chart-card-premium" style={{ background: '#FFFFFF', padding: '20px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', position: 'relative' }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', fontFamily: 'var(--font-sans)', margin: '0 0 2px 0' }}>Internal Handoff: lowest satisfaction, highest escalations — yet only 20% breach rate</h3>
                    <button 
                      onClick={() => toggleChart('chart-nc-3c')}
                      title="Minimize Chart"
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', marginLeft: '8px', transition: 'all 0.2s' }}
                    >
                      <EyeOff size={14} />
                    </button>
                  </div>
                  <small style={{ color: 'var(--text3)', fontSize: '11px', display: 'block', lineHeight: '1.4' }}>Compare all 5 delay reasons across 3 measures. Which delay reason looks worst? The answer is not the one the current analysis is focused on.</small>
                </div>

                <div style={{ width: '100%', height: 260, position: 'relative' }}>
                  <ResponsiveContainer>
                    <BarChart data={noCorrInsight3CData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="reason" stroke="var(--text3)" fontSize={10} tickLine={false} />
                      <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} domain={[0, 80]} />
                      <Tooltip content={({ active, payload }) => {
                        if (active && payload && payload.length && payload[0]?.payload) {
                          const p = payload[0].payload;
                          const breachRate = p.breachRate || 0;
                          const escalations = p.escalations || 0;
                          const satisfaction = p.satisfaction || 0;
                          return (
                            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "10px 14px", boxShadow: "var(--shadow)", backdropFilter: "blur(8px)" }}>
                              <p style={{ fontWeight: "700", fontSize: "11px", color: "var(--text)", marginBottom: "5px" }}>{p.reason || ""}</p>
                              <span style={{ fontSize: "10px", display: "block", color: "#E24B4A", fontWeight: "600" }}>Breach rate: {breachRate}%</span>
                              <span style={{ fontSize: "10px", display: "block", color: "#378ADD", fontWeight: "600" }}>Avg escalations: {(escalations/10).toFixed(1)}</span>
                              <span style={{ fontSize: "10px", display: "block", color: "#1D9E75", fontWeight: "600" }}>Avg satisfaction: {(satisfaction/10).toFixed(2)}</span>
                            </div>
                          );
                        }
                        return null;
                      }} />
                      <ReferenceArea x1="IT Access" x2="IT Access" fill="#FCEBEB" fillOpacity={0.4} />
                      
                      <Legend iconSize={10} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Bar dataKey="breachRate" fill="#E24B4A" name="Breach rate %" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#E24B4A', fontSize: 9, fontWeight: '700', formatter: (v) => `${v}%` }} />
                      <Bar dataKey="escalations" fill="#378ADD" name="Avg escalations (scaled ×10 for comparison)" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#378ADD', fontSize: 9, fontWeight: '700', formatter: (v) => (v/10).toFixed(1) }} />
                      <Bar dataKey="satisfaction" fill="#1D9E75" name="Avg satisfaction (scaled ×10 for comparison)" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#1D9E75', fontSize: 9, fontWeight: '700', formatter: (v) => (v/10).toFixed(2) }} />
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Highlights Callouts */}
                  <div style={{ position: 'absolute', top: 5, left: '3%', background: '#FCEBEB', border: '1px solid #F7C1C1', borderRadius: '4px', padding: '4px 8px', fontSize: '9px', width: '130px', color: '#A32D2D', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: '800' }}>IT Access:</span>
                    <span>Highest breach (73%)</span>
                    <span>IT blockages, not coordination</span>
                  </div>

                  <div style={{ position: 'absolute', top: 5, left: '43%', background: '#E6F1FB', border: '1px solid #C4DFF6', borderRadius: '4px', padding: '4px 8px', fontSize: '9px', width: '145px', color: '#1B609E', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: '800' }}>Internal Handoff:</span>
                    <span>Lowest satisfaction (3.98)</span>
                    <span>Highest escalations (3.2)</span>
                    <span>Ops rescue it manually</span>
                  </div>
                </div>

                {/* Bottom Callout Boxes */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '16px' }}>
                  
                  {/* Left Callout */}
                  <div style={{ borderLeft: '3px solid var(--clr-critical)', padding: '12px 16px', background: 'var(--surface2)', borderRadius: '0 var(--radius) var(--radius) 0', fontSize: '11.5px', color: 'var(--text2)', lineHeight: '1.5' }}>
                    <strong>IT Access = highest breach (73%) but easy to diagnose</strong> — access is visibly blocked.<br/>
                    <em>Fix:</em> automated provisioning, pre-provisioning during contracting stage.
                  </div>

                  {/* Right Callout */}
                  <div style={{ borderLeft: '3px solid #378ADD', padding: '12px 16px', background: 'var(--surface2)', borderRadius: '0 var(--radius) var(--radius) 0', fontSize: '11.5px', color: 'var(--text2)', lineHeight: '1.5' }}>
                    <strong>Internal Handoff = lowest satisfaction (3.98) and highest escalations (3.2)</strong> — but ops teams prevent the breach every time. The cost is hidden. It shows in satisfaction and post-launch engagement, not in breach numbers.<br/>
                    <em>Fix:</em> named DRI at each phase transition + automated handoff status notifications.
                  </div>

                </div>
              </div>
            </CollapsibleChartCard>
          </div>

        </div>
      )}

            {/* Persistent Minimized Charts Shelf at the bottom of the page */}
      {Object.values(minimizedCharts).some(val => val) && (
        <div style={{ 
          marginTop: '40px', 
          padding: '24px', 
          background: 'var(--surface)', 
          border: '1.5px dashed var(--border)', 
          borderRadius: 'var(--radius)',
          animation: 'fadeIn 0.2s ease-out',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <EyeOff size={14} color="var(--accent)" />
              Minimized Workspace Shelf ({Object.values(minimizedCharts).filter(val => val).length})
            </span>
            <button 
              onClick={() => { setMinimizedCharts({}); localStorage.removeItem('minimizedCharts'); }}
              style={{ 
                fontSize: '10px', 
                fontWeight: '700', 
                color: '#E24B4A', 
                border: '1px solid #F7C1C1', 
                background: '#FCEBEB', 
                borderRadius: '4px',
                padding: '5px 12px',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                textTransform: 'uppercase',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F9D5D5'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#FCEBEB'; }}
            >
              Restore All Charts
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {Object.keys(minimizedCharts).map(key => {
              if (!minimizedCharts[key]) return null;
              const title = CORE_CHART_TITLES[key] || key.replace(/-/g, ' ');
              return (
                <div 
                  key={key} 
                  onClick={() => toggleChart(key)}
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '8px 14px',
                    fontSize: '11.5px',
                    fontWeight: '600',
                    color: 'var(--text)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--surface)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--card)'; }}
                >
                  <span style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
                  <span style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: '700', borderLeft: '1px solid var(--border)', paddingLeft: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Eye size={11} /> Restore
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
