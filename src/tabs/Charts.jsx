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
  Zap
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
  ZAxis,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ReferenceLine
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
// STATIC DATASETS FOR ADVANCED CASE STUDY ANALYTICS (CHARTS 1 TO 15)
// ==========================================

const caseStudyChartsList = [
  { id: 1, title: 'Chart 1: Ticket Speed vs Breach Correlation', icon: 'Activity' },
  { id: 2, title: 'Chart 2: Texas Delay Reason Concentration', icon: 'MapPin' },
  { id: 3, title: 'Chart 3: Training Days as Primary Phase Driver', icon: 'Layers' },
  { id: 4, title: 'Chart 4: CSAT Drivers vs Task Completion', icon: 'Smile' },
  { id: 5, title: 'Chart 5: Operations vs IT Escalations', icon: 'AlertTriangle' },
  { id: 6, title: 'Chart 6: Phase Duration Share in Breaches', icon: 'Clock' },
  { id: 7, title: 'Chart 7: 5-Factor Risk Score early-warning', icon: 'Shield' },
  { id: 8, title: 'Chart 8: Satisfaction CSAT Survey Compression', icon: 'ThumbsUp' },
  { id: 9, title: 'Chart 9: Vendor SLA Delay Paradox', icon: 'Zap' },
  { id: 10, title: 'Chart 10: Combined Compliance & IT Threshold', icon: 'Target' },
  { id: 11, title: 'Chart 11: Internal Handoff Silent Churn Journey', icon: 'User' },
  { id: 12, title: 'Chart 12: Calendar Heat Start Day effect', icon: 'Calendar' },
  { id: 13, title: 'Chart 13: Phase waterfall & Radar Benchmark', icon: 'Sparkles' },
  { id: 14, title: 'Chart 14: Provider Cohort Profile Segmentation', icon: 'ClipboardList' },
  { id: 15, title: 'Chart 15: Monthly Trend Cohort Composition', icon: 'FileText' }
];

const chart1ScatterData = [
  { id: 'P001', ticketHrs: 20, breached: 0, delay: 'Vendor SLA' },
  { id: 'P002', ticketHrs: 12.7, breached: 0, delay: 'Internal Handoff' },
  { id: 'P003', ticketHrs: 22.5, breached: 0, delay: 'Internal Handoff' },
  { id: 'P004', ticketHrs: 25.3, breached: 1, delay: 'Scheduling' },
  { id: 'P005', ticketHrs: 20, breached: 1, delay: 'IT Access' },
  { id: 'P006', ticketHrs: 18.8, breached: 1, delay: 'IT Access' },
  { id: 'P007', ticketHrs: 14.9, breached: 0, delay: 'Scheduling' },
  { id: 'P008', ticketHrs: 17.9, breached: 0, delay: 'Scheduling' },
  { id: 'P009', ticketHrs: 22.3, breached: 0, delay: 'Scheduling' },
  { id: 'P010', ticketHrs: 19, breached: 0, delay: 'Vendor SLA' },
  { id: 'P011', ticketHrs: 21.2, breached: 1, delay: 'IT Access' },
  { id: 'P012', ticketHrs: 24, breached: 1, delay: 'Vendor SLA' },
  { id: 'P013', ticketHrs: 29.4, breached: 1, delay: 'Scheduling' },
  { id: 'P014', ticketHrs: 23.9, breached: 0, delay: 'IT Access' },
  { id: 'P015', ticketHrs: 21.3, breached: 0, delay: 'Vendor SLA' },
  { id: 'P016', ticketHrs: 19.6, breached: 0, delay: 'Vendor SLA' },
  { id: 'P017', ticketHrs: 10.4, breached: 1, delay: 'Scheduling' },
  { id: 'P018', ticketHrs: 19.9, breached: 1, delay: 'IT Access' },
  { id: 'P019', ticketHrs: 20.3, breached: 0, delay: 'Scheduling' },
  { id: 'P020', ticketHrs: 32.3, breached: 1, delay: 'IT Access' },
  { id: 'P021', ticketHrs: 19, breached: 0, delay: 'Internal Handoff' },
  { id: 'P022', ticketHrs: 21.5, breached: 1, delay: 'Missing Docs' },
  { id: 'P023', ticketHrs: 19.8, breached: 1, delay: 'Missing Docs' },
  { id: 'P024', ticketHrs: 14.2, breached: 0, delay: 'Missing Docs' },
  { id: 'P025', ticketHrs: 25.7, breached: 1, delay: 'Scheduling' },
  { id: 'P026', ticketHrs: 23.8, breached: 0, delay: 'Internal Handoff' },
  { id: 'P027', ticketHrs: 24, breached: 1, delay: 'IT Access' },
  { id: 'P028', ticketHrs: 17.5, breached: 0, delay: 'Vendor SLA' },
  { id: 'P029', ticketHrs: 31, breached: 1, delay: 'IT Access' },
  { id: 'P030', ticketHrs: 14, breached: 0, delay: 'Vendor SLA' },
  { id: 'P031', ticketHrs: 22.9, breached: 1, delay: 'IT Access' },
  { id: 'P032', ticketHrs: 35, breached: 1, delay: 'Internal Handoff' },
  { id: 'P033', ticketHrs: 15, breached: 0, delay: 'Vendor SLA' },
  { id: 'P034', ticketHrs: 17.2, breached: 0, delay: 'Scheduling' },
  { id: 'P035', ticketHrs: 21.5, breached: 1, delay: 'IT Access' },
  { id: 'P036', ticketHrs: 17.5, breached: 0, delay: 'IT Access' }
];

const chart2LeftData = [
  { name: 'TX', 'Breach Rate': 60 },
  { name: 'CA', 'Breach Rate': 42 },
  { name: 'FL', 'Breach Rate': 43 }
];

const chart2RightData = [
  { market: 'TX', 'IT Access': 30, 'Scheduling': 20, 'Internal Handoff': 30, 'Missing Docs': 10, 'Vendor SLA': 10 },
  { market: 'CA', 'IT Access': 43, 'Scheduling': 39, 'Missing Docs': 18, 'Internal Handoff': 0, 'Vendor SLA': 0 },
  { market: 'FL', 'Vendor SLA': 43, 'IT Access': 29, 'Scheduling': 21, 'Internal Handoff': 7, 'Missing Docs': 0 }
];

const chart3PhaseData = [
  { id: 'P001', contracting: 5.7, itProv: 7.4, compliance: 5.9, training: 6.5, total: 26, breached: 'N' },
  { id: 'P002', contracting: 4.8, itProv: 3.1, compliance: 8.3, training: 5.9, total: 22, breached: 'N' },
  { id: 'P003', contracting: 6.0, itProv: 4.3, compliance: 3.0, training: 2.2, total: 16, breached: 'N' },
  { id: 'P004', contracting: 7.3, itProv: 7.4, compliance: 7.2, training: 5.9, total: 28, breached: 'Y' },
  { id: 'P005', contracting: 4.6, itProv: 8.5, compliance: 6.1, training: 6.1, total: 25, breached: 'Y' },
  { id: 'P006', contracting: 4.6, itProv: 7.3, compliance: 5.6, training: 10.0, total: 28, breached: 'Y' },
  { id: 'P007', contracting: 7.4, itProv: 6.8, compliance: 6.1, training: 5.6, total: 26, breached: 'N' },
  { id: 'P008', contracting: 6.2, itProv: 6.4, compliance: 3.0, training: 6.6, total: 22, breached: 'N' },
  { id: 'P009', contracting: 4.3, itProv: 4.0, compliance: 5.7, training: 5.9, total: 20, breached: 'N' },
  { id: 'P010', contracting: 5.8, itProv: 5.6, compliance: 6.5, training: 3.7, total: 22, breached: 'N' },
  { id: 'P011', contracting: 4.3, itProv: 6.1, compliance: 8.2, training: 8.3, total: 27, breached: 'Y' },
  { id: 'P012', contracting: 4.3, itProv: 9.1, compliance: 5.2, training: 7.5, total: 26, breached: 'Y' },
  { id: 'P013', contracting: 5.4, itProv: 7.7, compliance: 4.8, training: 7.6, total: 26, breached: 'Y' },
  { id: 'P014', contracting: 2.1, itProv: 3.5, compliance: 5.2, training: 4.2, total: 15, breached: 'N' },
  { id: 'P015', contracting: 2.4, itProv: 7.6, compliance: 7.4, training: 8.8, total: 26, breached: 'N' },
  { id: 'P016', contracting: 4.2, itProv: 6.2, compliance: 6.5, training: 3.2, total: 20, breached: 'N' },
  { id: 'P017', contracting: 3.5, itProv: 5.6, compliance: 5.2, training: 7.2, total: 22, breached: 'Y' },
  { id: 'P018', contracting: 5.5, itProv: 8.2, compliance: 6.8, training: 10.0, total: 30, breached: 'Y' },
  { id: 'P019', contracting: 3.6, itProv: 9.1, compliance: 6.1, training: 4.0, total: 23, breached: 'N' },
  { id: 'P020', contracting: 2.9, itProv: 8.9, compliance: 7.5, training: 4.9, total: 24, breached: 'Y' },
  { id: 'P021', contracting: 7.2, itProv: 5.3, compliance: 4.9, training: 6.2, total: 24, breached: 'N' },
  { id: 'P022', contracting: 4.7, itProv: 6.4, compliance: 5.5, training: 5.0, total: 22, breached: 'Y' },
  { id: 'P023', contracting: 5.1, itProv: 7.7, compliance: 5.4, training: 2.9, total: 21, breached: 'Y' },
  { id: 'P024', contracting: 2.9, itProv: 9.0, compliance: 3.8, training: 6.1, total: 22, breached: 'N' },
  { id: 'P025', contracting: 4.2, itProv: 6.0, compliance: 6.4, training: 3.9, total: 20, breached: 'Y' },
  { id: 'P026', contracting: 5.2, itProv: 6.6, compliance: 6.4, training: 6.9, total: 25, breached: 'N' },
  { id: 'P027', contracting: 3.3, itProv: 4.8, compliance: 6.0, training: 4.2, total: 18, breached: 'Y' },
  { id: 'P028', contracting: 5.6, itProv: 4.6, compliance: 5.6, training: 9.1, total: 25, breached: 'N' },
  { id: 'P029', contracting: 4.1, itProv: 8.6, compliance: 3.9, training: 4.4, total: 21, breached: 'Y' },
  { id: 'P030', contracting: 4.6, itProv: 9.7, compliance: 5.4, training: 5.4, total: 25, breached: 'N' },
  { id: 'P031', contracting: 4.1, itProv: 6.9, compliance: 5.5, training: 7.6, total: 24, breached: 'Y' },
  { id: 'P032', contracting: 7.8, itProv: 9.0, compliance: 4.8, training: 3.5, total: 25, breached: 'Y' },
  { id: 'P033', contracting: 5.0, itProv: 7.7, compliance: 5.8, training: 6.5, total: 25, breached: 'N' },
  { id: 'P034', contracting: 3.4, itProv: 5.7, compliance: 6.6, training: 8.6, total: 24, breached: 'N' },
  { id: 'P035', contracting: 6.2, itProv: 7.7, compliance: 8.8, training: 2.8, total: 26, breached: 'Y' },
  { id: 'P036', contracting: 3.2, itProv: 10.0, compliance: 6.3, training: 6.4, total: 26, breached: 'N' }
];

const chart4Correlations = [
  { variable: 'Escalations', r: -0.485 },
  { variable: 'Ticket Res. Time', r: -0.333 },
  { variable: 'Total Onboard Days', r: -0.303 },
  { variable: 'Training Days', r: -0.281 },
  { variable: 'IT Prov Days', r: -0.019 },
  { variable: 'Task % Complete', r: -0.021 },
  { variable: 'Contracting Days', r: 0.089 }
];

const chart4Scatter = [
  { escalations: 0, sat: 4.40 },
  { escalations: 1, sat: 4.22 },
  { escalations: 2, sat: 4.07 },
  { escalations: 3, sat: 3.93 },
  { escalations: 4, sat: 3.90 },
  { escalations: 5, sat: 3.82 }
];

const chart5Data = [
  { type: 'Operations', 'Breach Rate': 67, cases: 9, sat: 4.07 },
  { type: 'Other', 'Breach Rate': 56, cases: 10, sat: 4.23 },
  { type: 'Compliance', 'Breach Rate': 44, cases: 9, sat: 4.09 },
  { type: 'IT', 'Breach Rate': 25, cases: 8, sat: 4.00 }
];

const chart6Stacked = [
  { status: 'Breached (Y)', Contracting: 19.8, 'IT Prov': 30.7, Compliance: 25.1, Training: 24.3 },
  { status: 'Non-Breached (N)', Contracting: 20.9, 'IT Prov': 28.0, Compliance: 25.2, Training: 25.5 },
  { status: 'Overall', Contracting: 20.4, 'IT Prov': 29.3, Compliance: 25.2, Training: 24.9 }
];

const chart7ScoreData = [
  { score: 0, 'Breach Rate': 50, count: 2 },
  { score: 1, 'Breach Rate': 0, count: 5 },
  { score: 2, 'Breach Rate': 20, count: 5 },
  { score: 3, 'Breach Rate': 63, count: 8 },
  { score: 4, 'Breach Rate': 20, count: 5 },
  { score: 5, 'Breach Rate': 67, count: 6 },
  { score: 6, 'Breach Rate': 100, count: 4 },
  { score: 8, 'Breach Rate': 100, count: 1 }
];

const chart7PrData = [
  { threshold: 3, Precision: 62, Recall: 88, flagged: 24 },
  { threshold: 4, Precision: 62, Recall: 59, flagged: 16 },
  { threshold: 5, Precision: 82, Recall: 53, flagged: 11 },
  { threshold: 6, Precision: 100, Recall: 29, flagged: 5 }
];

const chart8Histogram = [
  { score: '3.5', count: 1, fill: 'var(--clr-critical)' },
  { score: '3.7', count: 2, fill: 'var(--clr-critical)' },
  { score: '3.8', count: 5, fill: 'var(--clr-critical)' },
  { score: '3.9', count: 2, fill: 'var(--clr-critical)' },
  { score: '4.0', count: 6, fill: 'var(--clr-caution)' },
  { score: '4.1', count: 3, fill: 'var(--clr-caution)' },
  { score: '4.2', count: 5, fill: 'var(--clr-caution)' },
  { score: '4.3', count: 6, fill: 'var(--clr-good)' },
  { score: '4.4', count: 1, fill: 'var(--clr-good)' },
  { score: '4.5', count: 4, fill: 'var(--clr-good)' },
  { score: '4.6', count: 1, fill: 'var(--clr-good)' }
];

const chart9Quadrant = [
  { name: 'IT Access', duration: 24.3, breachRate: 73, count: 12 },
  { name: 'Missing Docs', duration: 21.7, breachRate: 67, count: 8 },
  { name: 'Scheduling', duration: 22.7, breachRate: 56, count: 6 },
  { name: 'Internal Handoff', duration: 22.4, breachRate: 20, count: 5 },
  { name: 'Vendor SLA', duration: 24.4, breachRate: 12.5, count: 5 }
];

const chart10Buckets = [
  { name: '<10 days', breachRate: 0, sat: 4.30, cases: 4, avgTotal: 18.3 },
  { name: '10–13 days', breachRate: 47, sat: 4.13, cases: 15, avgTotal: 23.0 },
  { name: '13–16 days', breachRate: 58, sat: 3.99, cases: 12, avgTotal: 25.6 },
  { name: '16+ days', breachRate: 67, sat: 4.17, cases: 5, avgTotal: 25.3 }
];

const chart11Matrix = [
  { name: 'IT Access', breach: 73, sat: 4.03, count: 12, zone: 'CRISIS' },
  { name: 'Scheduling', breach: 56, sat: 4.12, count: 6, zone: 'WARNING' },
  { name: 'Missing Docs', breach: 67, sat: 4.10, count: 8, zone: 'WARNING' },
  { name: 'Vendor SLA', breach: 12, sat: 4.12, count: 5, zone: 'SAFE' },
  { name: 'Internal Handoff', breach: 20, sat: 3.98, count: 5, zone: 'SILENT_CHURN' }
];

const chart12Weekdays = [
  { day: 'Friday', breachRate: 100, count: 5, fill: 'var(--clr-critical)' },
  { day: 'Monday', breachRate: 50, count: 4, fill: '#8c8a84' },
  { day: 'Sunday', breachRate: 50, count: 4, fill: '#8c8a84' },
  { day: 'Wednesday', breachRate: 50, count: 2, fill: '#8c8a84' },
  { day: 'Thursday', breachRate: 38, count: 8, fill: '#8c8a84' },
  { day: 'Saturday', breachRate: 33, count: 12, fill: '#8c8a84' },
  { day: 'Tuesday', breachRate: 0, count: 1, fill: '#8c8a84' }
];

const chart13Waterfall = [
  { phase: 'Contracting', P014: 2.1, P003: 6.0, Avg: 4.8 },
  { phase: 'IT Provisioning', P014: 3.5, P003: 4.3, Avg: 6.9 },
  { phase: 'Compliance', P014: 5.2, P003: 3.0, Avg: 5.9 },
  { phase: 'Training', P014: 4.2, P003: 2.2, Avg: 5.9 },
  { phase: 'TOTAL', P014: 15.0, P003: 16.0, Avg: 23.5 }
];

const chart13Radar = [
  { subject: 'Contracting', P014: 2.1, P003: 6.0, Avg: 4.8 },
  { subject: 'IT Prov', P014: 3.5, P003: 4.3, Avg: 6.9 },
  { subject: 'Compliance', P014: 5.2, P003: 3.0, Avg: 5.9 },
  { subject: 'Training', P014: 4.2, P003: 2.2, Avg: 5.9 },
  { subject: 'Ticket Hrs (x0.3)', P014: 7.2, P003: 6.8, Avg: 6.1 }, 
  { subject: 'Escalations (x2)', P014: 2.0, P003: 2.0, Avg: 4.0 }, 
  { subject: 'CSAT (x2)', P014: 8.0, P003: 9.0, Avg: 8.3 }
];

const chart14Bubbles = [
  { name: 'Standard', duration: 21.75, breachRate: 31, count: 16, sat: 4.14, escalations: 2.53, ticketHrs: 19.78, color: 'var(--clr-good)' },
  { name: 'Compliance-Heavy', duration: 26.00, breachRate: 50, count: 8, sat: 4.06, escalations: 2.00, ticketHrs: 18.76, color: 'var(--clr-caution)' },
  { name: 'IT-Stressed', duration: 24.25, breachRate: 67, count: 12, sat: 4.09, escalations: 1.92, ticketHrs: 24.06, color: 'var(--clr-critical)' }
];

const chart15Monthly = [
  { month: 'Jan', breachRate: 55, avgDays: 23.82, sat: 4.16, itProv: 6.40, ticketHrs: 19.86, n: 11, itAccessPct: 35, schedulingPct: 20, otherPct: 45 },
  { month: 'Feb', breachRate: 38, avgDays: 23.56, sat: 4.09, itProv: 7.36, ticketHrs: 20.47, n: 16, itAccessPct: 20, schedulingPct: 30, otherPct: 50 },
  { month: 'Mar', breachRate: 56, avgDays: 23.11, sat: 4.06, itProv: 6.71, ticketHrs: 23.24, n: 9, itAccessPct: 45, schedulingPct: 15, otherPct: 40 }
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

  const [selectedCaseStudyChart, setSelectedCaseStudyChart] = useState(1);

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

  const renderCaseStudyChart = (id) => {
    switch (id) {
      case 1:
        return (
          <div className="chart-card-premium" style={{ gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={16} color="var(--clr-critical)" />
                Slow Tickets ≠ Cause of Breach — Both Are Symptoms of the Same Upstream Failure
              </h3>
              <p style={{ color: 'var(--text3)', fontSize: '11.5px', marginTop: '4px' }}>
                r=0.49 looks strong but disappears when delay reason is controlled (0=N, 1=Y Breach status plotted with jitter)
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px', alignItems: 'start' }}>
              <div style={{ width: '100%', height: 260, position: 'relative' }}>
                {/* Visual Shaded Region for IT Access dots */}
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '42%',
                  right: '5%',
                  bottom: '10px',
                  background: 'var(--clr-critical-bg)',
                  border: '1px dashed var(--clr-critical-border)',
                  borderRadius: '6px',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  padding: '6px'
                }}>
                  <span style={{ fontSize: '9px', fontWeight: '600', color: 'var(--clr-critical)', textAlign: 'center', opacity: 0.85 }}>
                    IT Access Block Region (Slow Tickets & Breaches)
                  </span>
                </div>

                <ResponsiveContainer>
                  <ScatterChart margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" dataKey="ticketHrs" name="Avg Ticket Time" stroke="var(--text3)" fontSize={10} domain={[10, 36]} unit="h" />
                    <YAxis type="number" dataKey="breached" name="Breached" stroke="var(--text3)" fontSize={10} domain={[-0.2, 1.2]} ticks={[0, 1]} tickFormatter={(v) => v === 0 ? 'N (0)' : 'Y (1)'} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const p = payload[0].payload;
                        return (
                          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px', boxShadow: 'var(--shadow)' }}>
                            <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text)', marginBottom: '4px' }}>Provider: {p.id}</p>
                            <p style={{ fontSize: '10.5px', color: 'var(--text2)' }}>Avg Ticket Time: <strong>{p.ticketHrs}h</strong></p>
                            <p style={{ fontSize: '10.5px', color: 'var(--text2)' }}>Delay Reason: <strong>{p.delay}</strong></p>
                            <p style={{ fontSize: '10.5px', color: p.breached ? 'var(--clr-critical)' : 'var(--clr-good)', fontWeight: '600' }}>
                              SLA status: {p.breached ? '❌ Breached' : '✓ On Track'}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }} />
                    <ReferenceLine x={22} stroke="var(--clr-warn)" strokeDasharray="3 3" label={{ value: 'Slow threshold (22h)', fill: 'var(--clr-warn)', fontSize: 10, position: 'top' }} />
                    <Scatter name="Providers" data={chart1ScatterData} shape={renderCustomScatterNode} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              {/* Sidebar Callouts */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ background: 'var(--surface)', borderLeft: '3px solid var(--accent)', padding: '10px', borderRadius: '6px' }}>
                  <h4 style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    r = 0.487 Pearson Correlation
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--text2)', lineHeight: '1.4' }}>
                    Strong correlation initially suggests slow tickets cause breaches. However, the data reveals both are symptoms of the same upstream block (e.g. IT Access or Contracting delays).
                  </p>
                </div>

                <div style={{ background: 'var(--surface)', borderLeft: '3px solid var(--clr-critical)', padding: '10px', borderRadius: '6px' }}>
                  <h4 style={{ fontSize: '10px', fontWeight: '700', color: 'var(--clr-critical)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    🚨 P013 Scheduling Delay Callout
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--text2)', lineHeight: '1.4' }}>
                    <strong>P013 (29.4 hrs, Breached=Y)</strong>: Slowest tickets in the set, but delay is due to Scheduling — not IT Access.
                  </p>
                </div>

                <div style={{ background: 'var(--surface)', borderLeft: '3px solid var(--clr-good)', padding: '10px', borderRadius: '6px' }}>
                  <h4 style={{ fontSize: '10px', fontWeight: '700', color: 'var(--clr-good)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    ✓ P014 Support Speed Exception
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--text2)', lineHeight: '1.4' }}>
                    <strong>P014 (23.9 hrs, Breached=N)</strong>: Had slow tickets but achieved the fastest onboarding (15 days) and NO breach because compliance and contracting were completed instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="chart-card-premium" style={{ gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} color="var(--clr-critical)" />
                TX's 60% Breach Rate Is Entirely Explained by Delay Reason Concentration
              </h3>
              <p style={{ color: 'var(--text3)', fontSize: '11.5px', marginTop: '4px' }}>
                TX Internal Handoff providers: 0% breach. Same market, different delay = different outcome.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
              {/* Left horizontal bar chart */}
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '14px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)', marginBottom: '10px' }}>
                  Overall Breach Rate by Market (TX looks worst overall)
                </div>
                <div style={{ width: '100%', height: 180 }}>
                  <ResponsiveContainer>
                    <BarChart data={chart2LeftData} layout="vertical" margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                      <XAxis type="number" stroke="var(--text3)" fontSize={10} domain={[0, 100]} unit="%" />
                      <YAxis dataKey="name" type="category" stroke="var(--text)" fontSize={11} tickLine={false} width={40} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="Breach Rate" fill="var(--text3)" radius={[0, 4, 4, 0]} barSize={20}>
                        {chart2LeftData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.fill || 'var(--text3)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right stacked composition bars */}
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '14px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)', marginBottom: '10px' }}>
                  Delay Reason Mix (TX has 3x more IT Access concentration than FL)
                </div>
                <div style={{ width: '100%', height: 180 }}>
                  <ResponsiveContainer>
                    <BarChart data={chart2RightData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="market" stroke="var(--text3)" fontSize={10} tickLine={false} />
                      <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} unit="%" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: '9px', paddingTop: '6px' }} />
                      <Bar dataKey="IT Access" stackId="mix" fill="var(--clr-critical)" name="IT Access" />
                      <Bar dataKey="Scheduling" stackId="mix" fill="var(--clr-warn)" name="Scheduling" />
                      <Bar dataKey="Internal Handoff" stackId="mix" fill="var(--clr-caution)" name="Internal Handoff" />
                      <Bar dataKey="Missing Docs" stackId="mix" fill="var(--clr-good)" name="Missing Docs" />
                      <Bar dataKey="Vendor SLA" stackId="mix" fill="var(--text3)" name="Vendor SLA" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Shaded Callout Box */}
            <div style={{ background: 'var(--clr-critical-bg)', border: '1px solid var(--clr-critical-border)', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Info size={16} color="var(--clr-critical)" />
              <div style={{ fontSize: '12.5px', color: 'var(--text)', lineHeight: '1.4' }}>
                <strong>If TX had CA's delay reason mix, estimated breach rate drops to ~35%.</strong> TX's breach rate is a portfolio problem, not a process culture problem.
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="chart-card-premium" style={{ gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={16} color="var(--accent)" />
                Training Days Drives Total Duration More Than Any Other Phase
              </h3>
              <p style={{ color: 'var(--text3)', fontSize: '11.5px', marginTop: '4px' }}>
                r=0.640 — stronger than IT provisioning (0.551), stronger than compliance (0.398) (dots colored red for Breached, grey for On Track)
              </p>
            </div>

            {/* 2x2 Grid of scatter plots */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Panel 1 */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text2)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Contracting Days vs Total</span>
                  <span style={{ color: 'var(--text3)' }}>r = 0.322 (Weakest)</span>
                </div>
                <div style={{ width: '100%', height: 110 }}>
                  <ResponsiveContainer>
                    <ScatterChart margin={{ top: 5, right: 10, left: -30, bottom: 0 }}>
                      <XAxis type="number" dataKey="contracting" stroke="var(--text3)" fontSize={8} tickLine={false} />
                      <YAxis type="number" dataKey="total" stroke="var(--text3)" fontSize={8} tickLine={false} domain={[12, 32]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Scatter data={chart3PhaseData} fill="var(--text3)">
                        {chart3PhaseData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.breached === 'Y' ? 'var(--clr-critical)' : 'var(--text3)'} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Panel 2 */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text2)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>IT Provisioning vs Total</span>
                  <span style={{ color: 'var(--text3)' }}>r = 0.551 (Second strongest)</span>
                </div>
                <div style={{ width: '100%', height: 110 }}>
                  <ResponsiveContainer>
                    <ScatterChart margin={{ top: 5, right: 10, left: -30, bottom: 0 }}>
                      <XAxis type="number" dataKey="itProv" stroke="var(--text3)" fontSize={8} tickLine={false} />
                      <YAxis type="number" dataKey="total" stroke="var(--text3)" fontSize={8} tickLine={false} domain={[12, 32]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Scatter data={chart3PhaseData} fill="var(--text3)">
                        {chart3PhaseData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.breached === 'Y' ? 'var(--clr-critical)' : 'var(--text3)'} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Panel 3 */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text2)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Compliance Days vs Total</span>
                  <span style={{ color: 'var(--text3)' }}>r = 0.398 (Moderate)</span>
                </div>
                <div style={{ width: '100%', height: 110 }}>
                  <ResponsiveContainer>
                    <ScatterChart margin={{ top: 5, right: 10, left: -30, bottom: 0 }}>
                      <XAxis type="number" dataKey="compliance" stroke="var(--text3)" fontSize={8} tickLine={false} />
                      <YAxis type="number" dataKey="total" stroke="var(--text3)" fontSize={8} tickLine={false} domain={[12, 32]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Scatter data={chart3PhaseData} fill="var(--text3)">
                        {chart3PhaseData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.breached === 'Y' ? 'var(--clr-critical)' : 'var(--text3)'} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Panel 4: Highlighted Strongest Driver */}
              <div style={{ background: 'var(--surface)', border: '2px solid var(--clr-warn)', borderRadius: '8px', padding: '10px', boxShadow: 'var(--shadow)' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--clr-warn)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Training Days vs Total</span>
                  <span>r = 0.640 (STRONGEST DRIVER)</span>
                </div>
                <div style={{ width: '100%', height: 110 }}>
                  <ResponsiveContainer>
                    <ScatterChart margin={{ top: 5, right: 10, left: -30, bottom: 0 }}>
                      <XAxis type="number" dataKey="training" stroke="var(--text3)" fontSize={8} tickLine={false} />
                      <YAxis type="number" dataKey="total" stroke="var(--text3)" fontSize={8} tickLine={false} domain={[12, 32]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Scatter data={chart3PhaseData} fill="var(--text3)">
                        {chart3PhaseData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.breached === 'Y' ? 'var(--clr-critical)' : 'var(--text3)'} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', fontSize: '11.5px', color: 'var(--text2)', background: 'var(--surface)', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid var(--clr-warn)' }}>
              <span>🔍</span>
              <div>
                <strong>6 providers with Training &gt; 8 days: 50% breach rate, avg 26.7 days.</strong> This is the single highest correlation phase that has never been discussed in operations meetings.
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="chart-card-premium" style={{ gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Smile size={16} color="var(--clr-good)" />
                Task Completion Rate Is the Wrong Dashboard Metric
              </h3>
              <p style={{ color: 'var(--text3)', fontSize: '11.5px', marginTop: '4px' }}>
                Providers forgive late tasks. They don't forgive being dragged into escalations.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
              {/* Panel 1: Horizontal diverging bar */}
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '14px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)', marginBottom: '10px' }}>
                  Correlation (r) with Provider Satisfaction Score
                </div>
                <div style={{ width: '100%', height: 180 }}>
                  <ResponsiveContainer>
                    <BarChart data={chart4Correlations} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                      <XAxis type="number" stroke="var(--text3)" fontSize={10} domain={[-0.6, 0.2]} />
                      <YAxis dataKey="variable" type="category" stroke="var(--text)" fontSize={10} tickLine={false} width={110} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="r" fill="var(--text3)" radius={[4, 4, 4, 4]} barSize={12}>
                        {chart4Correlations.map((entry, idx) => {
                          const fill = entry.variable === 'Task % Complete' ? 'var(--clr-caution)' :
                                       entry.r < -0.25 ? 'var(--clr-critical)' : 'var(--text3)';
                          return <Cell key={`cell-${idx}`} fill={fill} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '8px', lineHeight: '1.4' }}>
                  ⚠️ **Task % Complete** has almost **ZERO correlation (r=-0.02)** with what providers feel, yet it is currently highlighted.
                </div>
              </div>

              {/* Panel 2: Scatter plot of escalations vs satisfaction */}
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '14px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)', marginBottom: '10px' }}>
                  Escalation Count vs Average Satisfaction Score
                </div>
                <div style={{ width: '100%', height: 180 }}>
                  <ResponsiveContainer>
                    <LineChart data={chart4Scatter} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="escalations" stroke="var(--text3)" fontSize={10} unit=" esc" />
                      <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} domain={[3.5, 4.6]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="sat" stroke="var(--clr-critical)" strokeWidth={2} dot={{ r: 5, fill: 'var(--clr-critical)' }} name="Avg Satisfaction" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '8px', lineHeight: '1.4' }}>
                  📈 **Each additional escalation costs approximately 0.12 satisfaction points** (r = -0.485, 23x stronger than task completion!).
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="chart-card-premium" style={{ gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={16} color="var(--clr-critical)" />
                Operations Escalations Are 3x More Likely to Cause SLA Breach Than IT Escalations
              </h3>
              <p style={{ color: 'var(--text3)', fontSize: '11.5px', marginTop: '4px' }}>
                The fix is coordination architecture, not help desk hiring.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px', alignItems: 'center' }}>
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer>
                  <BarChart data={chart5Data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="type" stroke="var(--text3)" fontSize={10} tickLine={false} />
                    <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} unit="%" />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={47} stroke="var(--text3)" strokeDasharray="3 3" label={{ value: 'Dataset Avg (47%)', fill: 'var(--text3)', fontSize: 9, position: 'top' }} />
                    <Bar dataKey="Breach Rate" radius={[4, 4, 0, 0]} barSize={24}>
                      {chart5Data.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Small Supporting Table */}
              <div className="tbl-wrap">
                <table className="data-tbl" style={{ fontSize: '11.5px' }}>
                  <thead>
                    <tr>
                      <th>Escalation Type</th>
                      <th>Breach Rate</th>
                      <th>What it means</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: '600', color: 'var(--clr-critical)' }}>Operations</td>
                      <td><strong>67%</strong></td>
                      <td>Handoff & scheduling coordination failure</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: '600', color: 'var(--clr-warn)' }}>Other</td>
                      <td><strong>56%</strong></td>
                      <td>Unclassified drag</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: '600', color: 'var(--clr-caution)' }}>Compliance</td>
                      <td><strong>44%</strong></td>
                      <td>Credential validation blockages</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: '600', color: 'var(--text3)' }}>IT</td>
                      <td><strong>25%</strong></td>
                      <td>Defined path exists — easily gets resolved</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', fontSize: '11.5px', color: 'var(--text2)', background: 'var(--surface)', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid var(--clr-critical)' }}>
              <span>💡</span>
              <div>
                <strong>IT escalations are the safest category.</strong> The current operational analysis focuses heavily on IT ticket speed, but operations failures (coordination, handoffs, scheduling) are where breaches actually pile up.
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="chart-card-premium" style={{ gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} color="var(--accent)" />
                IT Provisioning Is the Phase That Grows Most When Onboarding Fails
              </h3>
              <p style={{ color: 'var(--text3)', fontSize: '11.5px', marginTop: '4px' }}>
                100% stacked horizontal bar representation showing duration share % across phases
              </p>
            </div>

            <div style={{ width: '100%', height: 160 }}>
              <ResponsiveContainer>
                <BarChart data={chart6Stacked} layout="vertical" margin={{ top: 5, right: 10, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" stroke="var(--text3)" fontSize={10} domain={[0, 100]} unit="%" />
                  <YAxis dataKey="status" type="category" stroke="var(--text)" fontSize={11} tickLine={false} width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
                  <Bar dataKey="Contracting" stackId="pct" fill="var(--accent)" />
                  <Bar dataKey="IT Prov" stackId="pct" fill="var(--clr-warn)" />
                  <Bar dataKey="Compliance" stackId="pct" fill="var(--clr-good)" />
                  <Bar dataKey="Training" stackId="pct" fill="oklch(0.65 0.18 200.0)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Days spent details block */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: 'var(--surface)', padding: '14px', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--clr-critical)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Breached Cohort (Avg: 25.4 days total)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '11px', color: 'var(--text2)' }}>
                  <div>Contract: <strong>5.1d</strong></div>
                  <div style={{ color: 'var(--clr-critical)', fontWeight: '600' }}>IT Prov: <strong>7.8d</strong></div>
                  <div>Compliance: <strong>6.4d</strong></div>
                  <div>Training: <strong>6.2d</strong></div>
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--clr-good)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Non-Breached Cohort (Avg: 21.8 days total)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '11px', color: 'var(--text2)' }}>
                  <div>Contract: <strong>4.7d</strong></div>
                  <div>IT Prov: <strong>6.0d</strong></div>
                  <div>Compliance: <strong>5.4d</strong></div>
                  <div>Training: <strong>5.7d</strong></div>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '11.5px', color: 'var(--text2)', lineHeight: '1.5' }}>
              ✏️ <strong>IT Provisioning increases by +2.7 percentage points (30% longer in absolute days) in breached providers.</strong> In Q1 2025, manual EHR credentialing, SSO setup, and role mapping should take hours, not 7.8 days. This is automatable process debt.
            </div>
          </div>
        );

      case 7:
        return (
          <div className="chart-card-premium" style={{ gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={16} color="var(--clr-good)" />
                A 5-Factor Risk Score Flags 88% of SLA Breaches Early Enough to Intervene
              </h3>
              <p style={{ color: 'var(--text3)', fontSize: '11.5px', marginTop: '4px' }}>
                All score inputs are fully known by Day 8–10 of onboarding — 15+ days before the breach window.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
              {/* Panel 1: Bar chart of Breach Rate by Risk Score */}
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '14px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)', marginBottom: '10px' }}>
                  Breach Rate by Risk Score (Score ≥ 5 = High Risk Zone)
                </div>
                <div style={{ width: '100%', height: 160 }}>
                  <ResponsiveContainer>
                    <BarChart data={chart7ScoreData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="score" stroke="var(--text3)" fontSize={10} tickLine={false} />
                      <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} unit="%" />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine x={3} stroke="var(--clr-warn)" strokeDasharray="3 3" label={{ value: 'Alert limit', fill: 'var(--clr-warn)', fontSize: 9, position: 'top' }} />
                      <Bar dataKey="Breach Rate" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={16}>
                        {chart7ScoreData.map((entry, idx) => {
                          const fill = entry.score >= 5 ? 'var(--clr-critical)' :
                                       entry.score >= 3 ? 'var(--clr-warn)' : 'var(--clr-good)';
                          return <Cell key={`cell-${idx}`} fill={fill} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Panel 2: Precision-Recall Curve Table */}
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '14px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)', marginBottom: '10px' }}>
                  Precision-Recall Trade-off & Flagging Metrics
                </div>
                <table className="data-tbl" style={{ fontSize: '11.5px' }}>
                  <thead>
                    <tr>
                      <th>Score Cutoff</th>
                      <th>Precision</th>
                      <th>Recall</th>
                      <th>N Flagged</th>
                      <th>Operational Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: 'var(--clr-good-bg)', fontWeight: '600' }}>
                      <td style={{ color: 'var(--clr-good)' }}>≥ 3</td>
                      <td>62%</td>
                      <td>88%</td>
                      <td>24</td>
                      <td>✓ Best balance (flags 88%)</td>
                    </tr>
                    <tr>
                      <td>≥ 4</td>
                      <td>62%</td>
                      <td>59%</td>
                      <td>16</td>
                      <td>Moderate</td>
                    </tr>
                    <tr style={{ background: 'var(--clr-critical-bg)' }}>
                      <td style={{ color: 'var(--clr-critical)' }}>≥ 5</td>
                      <td>82%</td>
                      <td>53%</td>
                      <td>11</td>
                      <td>High precision (82% accurate)</td>
                    </tr>
                    <tr>
                      <td>≥ 6</td>
                      <td>100%</td>
                      <td>29%</td>
                      <td>5</td>
                      <td>Conservative</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Scoring rules inset */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', background: 'var(--surface2)', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', fontSize: '10.5px', color: 'var(--text2)' }}>
              <div>Contract &gt; 5.2d: <strong>+1 pt</strong></div>
              <div>IT Prov &gt; 6.7d: <strong>+2 pts</strong></div>
              <div>Comp &gt; 5.7d: <strong>+1 pt</strong></div>
              <div>Escalations ≥ 3: <strong>+2 pts</strong></div>
              <div>Delay = IT/Docs: <strong>+2 pts</strong></div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="chart-card-premium" style={{ gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ThumbsUp size={16} color="var(--clr-warn)" />
                The Satisfaction Survey Has a 1.1-Point Range — It Cannot Detect Real Dissatisfaction
              </h3>
              <p style={{ color: 'var(--text3)', fontSize: '11.5px', marginTop: '4px' }}>
                Healthcare B2B administrators show strong social desirability bias in CSAT rating surveys (spanning only 1.1 points total).
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
              {/* Panel 1 Histogram */}
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '14px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)', marginBottom: '10px' }}>
                  Histogram of Satisfaction Scores (Compressed CSAT distribution)
                </div>
                <div style={{ width: '100%', height: 160 }}>
                  <ResponsiveContainer>
                    <BarChart data={chart8Histogram} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="score" stroke="var(--text3)" fontSize={10} tickLine={false} />
                      <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" barSize={16}>
                        {chart8Histogram.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--text3)', marginTop: '8px', textAlign: 'center' }}>
                  🟥 Red Zone (3.5–3.9) · 🟨 Amber Zone (4.0–4.2) · 🟩 Green Zone (4.3–4.6)
                </div>
              </div>

              {/* Panel 2 Comparison */}
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '14px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)', marginBottom: '10px' }}>
                  CSAT vs. Escalation Signals (Discriminative Capacity)
                </div>
                <p style={{ fontSize: '11.5px', color: 'var(--text2)', lineHeight: '1.5' }}>
                  While the CSAT survey range is compressed to a flat **1.1 points** (making it nearly impossible to filter out unhappy providers), tracking **escalation counts** discriminates operational satisfaction **10x better**:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', borderBottom: '1px solid var(--border)', paddingBottom: '3px' }}>
                    <span>0 Escalations</span>
                    <strong style={{ color: 'var(--clr-good)' }}>Avg CSAT: 4.40</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', borderBottom: '1px solid var(--border)', paddingBottom: '3px' }}>
                    <span>2 Escalations</span>
                    <strong style={{ color: 'var(--clr-caution)' }}>Avg CSAT: 4.07</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', paddingBottom: '3px' }}>
                    <span>5 Escalations</span>
                    <strong style={{ color: 'var(--clr-critical)' }}>Avg CSAT: 3.82</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="chart-card-premium" style={{ gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={16} color="var(--clr-warn)" />
                Vendor SLA Delays Have the Lowest Breach Rate — Because Teams Plan Around External Failures
              </h3>
              <p style={{ color: 'var(--text3)', fontSize: '11.5px', marginTop: '4px' }}>
                Internal delays lack the same proactive buffer. That asymmetry is the real problem.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
              {/* Quadrant scatter plot */}
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '14px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)', marginBottom: '10px' }}>
                  Breach Rate vs Avg Duration (Vendor SLA Paradox Quadrant)
                </div>
                <div style={{ width: '100%', height: 180 }}>
                  <ResponsiveContainer>
                    <ScatterChart margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis type="number" dataKey="duration" name="Avg Duration" stroke="var(--text3)" fontSize={10} domain={[21, 25]} unit="d" />
                      <YAxis type="number" dataKey="breachRate" name="Breach Rate" stroke="var(--text3)" fontSize={10} domain={[0, 100]} unit="%" />
                      <Tooltip content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const p = payload[0].payload;
                          return (
                            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px', boxShadow: 'var(--shadow)' }}>
                              <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text)' }}>{p.name}</p>
                              <p style={{ fontSize: '10px' }}>Avg Days: <strong>{p.duration}d</strong></p>
                              <p style={{ fontSize: '10px', color: 'var(--clr-critical)' }}>Breach Rate: <strong>{p.breachRate}%</strong></p>
                            </div>
                          );
                        }
                        return null;
                      }} />
                      <ReferenceLine x={23} stroke="var(--text3)" strokeDasharray="3 3" />
                      <ReferenceLine y={47} stroke="var(--text3)" strokeDasharray="3 3" />
                      <Scatter name="Delay Reasons" data={chart9Quadrant} fill="var(--accent)">
                        {chart9Quadrant.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.name === 'Vendor SLA' ? 'var(--clr-good)' : 'var(--clr-critical)'} r={entry.count} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Simple Flow Chart */}
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '14px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)', marginBottom: '12px' }}>
                  Causal Buffer Mechanism (External vs. Internal)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
                  <div style={{ background: 'var(--surface2)', padding: '8px 10px', borderRadius: '6px', borderLeft: '3px solid var(--clr-good)' }}>
                    <strong>Vendor SLA Flow:</strong>
                    <div style={{ marginTop: '4px', opacity: 0.85 }}>
                      [Vendor misses SLA] → [Ops team notified early] → [Timeline dynamically extended] → <strong>NO breach (12.5% rate)</strong>
                    </div>
                  </div>
                  <div style={{ background: 'var(--surface2)', padding: '8px 10px', borderRadius: '6px', borderLeft: '3px solid var(--clr-critical)' }}>
                    <strong>IT Access Flow:</strong>
                    <div style={{ marginTop: '4px', opacity: 0.85 }}>
                      [IT Access blocked] → [Ops team not notified early] → [No buffer extended] → <strong>SLA BREACH (73% rate)</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 10:
        return (
          <div className="chart-card-premium" style={{ gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Target size={16} color="var(--accent)" />
                When Compliance + IT Exceeds 13 Days, Providers Go Live Without Clinical Access
              </h3>
              <p style={{ color: 'var(--text3)', fontSize: '11.5px', marginTop: '4px' }}>
                Regulatory Activation Time = Compliance Days + IT Provisioning Days (Target limit: &lt;13 days combined)
              </p>
            </div>

            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <BarChart data={chart10Buckets} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text3)" fontSize={10} tickLine={false} />
                  <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine x="10–13 days" stroke="var(--clr-warn)" strokeDasharray="3 3" label={{ value: 'Activation Warning', fill: 'var(--clr-warn)', fontSize: 9, position: 'top' }} />
                  <Bar dataKey="breachRate" name="Breach Rate" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={24}>
                    {chart10Buckets.map((entry, idx) => {
                      const colors = ['var(--clr-good)', 'var(--clr-caution)', 'var(--clr-warn)', 'var(--clr-critical)'];
                      return <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Clinical interpretation note */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: 'var(--surface)', padding: '14px', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--clr-good)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  ≤10 Days Combined (Go-Live Success)
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text2)', lineHeight: '1.4' }}>
                  Provider fully activated at go-live. Fully credentialed, active EHR credentials, instantly billable. Zero billing gap.
                </p>
              </div>

              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--clr-critical)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  ≥16 Days Combined (Phantom Launch Risk)
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text2)', lineHeight: '1.4' }}>
                  Provider goes live on paper but has restricted EHR access. Non-functional in practice, cannot bill payers, massive revenue leak.
                </p>
              </div>
            </div>
          </div>
        );

      case 11:
        return (
          <div className="chart-card-premium" style={{ gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={16} color="var(--clr-warn)" />
                Internal Handoff Has the Lowest Satisfaction of Any Category — and It Doesn't Show Up as a Breach
              </h3>
              <p style={{ color: 'var(--text3)', fontSize: '11.5px', marginTop: '4px' }}>
                Operations dashboards miss this because handoff delay has a low breach rate but high silent post-go-live churn risk.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
              {/* Matrix Bubble Chart */}
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '14px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)', marginBottom: '10px' }}>
                  Breach Risk vs Satisfaction Risk Matrix
                </div>
                <div style={{ width: '100%', height: 180 }}>
                  <ResponsiveContainer>
                    <ScatterChart margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis type="number" dataKey="breach" name="Breach Rate" stroke="var(--text3)" fontSize={10} domain={[0, 100]} unit="%" />
                      <YAxis type="number" dataKey="sat" name="Avg Satisfaction" stroke="var(--text3)" fontSize={10} domain={[3.9, 4.2]} />
                      <Tooltip content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const p = payload[0].payload;
                          return (
                            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px', boxShadow: 'var(--shadow)' }}>
                              <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text)' }}>{p.name}</p>
                              <p style={{ fontSize: '10px' }}>CSAT: <strong>{p.sat}</strong></p>
                              <p style={{ fontSize: '10px', color: 'var(--clr-critical)' }}>Breach: <strong>{p.breach}%</strong></p>
                            </div>
                          );
                        }
                        return null;
                      }} />
                      <Scatter name="Delay Categories" data={chart11Matrix} fill="var(--accent)">
                        {chart11Matrix.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.name === 'Internal Handoff' ? 'var(--clr-warn)' : 'var(--clr-critical)'} r={entry.count * 1.5} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Journey timeline */}
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '14px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)', marginBottom: '10px' }}>
                  Silent Journey limbo Gaps (Limbo days)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: 'var(--text2)' }}>
                  <div style={{ padding: '4px 6px', borderBottom: '1px solid var(--border)' }}>Day 1: Contracting starts (Clear owner)</div>
                  <div style={{ padding: '4px 6px', background: 'var(--clr-critical-bg)', color: 'var(--clr-critical)', borderRadius: '4px' }}>Day 5: Contracting ends → ⚠️ **LImbo handoff (Unclear owner)**</div>
                  <div style={{ padding: '4px 6px', borderBottom: '1px solid var(--border)' }}>Day 8: IT provisioning begins (Silent blockages)</div>
                  <div style={{ padding: '4px 6px', background: 'var(--clr-critical-bg)', color: 'var(--clr-critical)', borderRadius: '4px' }}>Day 12: IT ends → ⚠️ **Silent Handoff Gap (emails unanswered)**</div>
                  <div style={{ padding: '4px 6px' }}>Day 16: Compliance & training begins (Multiple contacts)</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 12:
        return (
          <div className="chart-card-premium" style={{ gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={16} color="var(--clr-critical)" />
                Every Provider Who Started Onboarding on a Friday Breached SLA
              </h3>
              <p style={{ color: 'var(--text3)', fontSize: '11.5px', marginTop: '4px' }}>
                A single scheduling rule could eliminate this entirely (Zero-cost operational intervention).
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px', alignItems: 'center' }}>
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer>
                  <BarChart data={chart12Weekdays} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="day" stroke="var(--text3)" fontSize={10} tickLine={false} />
                    <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} unit="%" />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={47} stroke="var(--text3)" strokeDasharray="3 3" label={{ value: 'Cohort Avg (47%)', fill: 'var(--text3)', fontSize: 9, position: 'top' }} />
                    <Bar dataKey="breachRate" name="Breach Rate" fill="var(--text3)" radius={[4, 4, 0, 0]} barSize={20}>
                      {chart12Weekdays.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Friday start causal mechanism diagram */}
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '14px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>
                  Friday start Causal Flow
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text2)', lineHeight: '1.4' }}>
                  Friday start → Weekend absorbs first 2 days before any work begins → Contracting emails sit unanswered → IT tickets sit in queue until Monday (2-day ticket resolution delay automatically baked in!) → Cascading delays down the pipeline.
                </p>
              </div>
            </div>

            <div style={{ background: 'var(--clr-good-bg)', border: '1px solid var(--clr-good-border)', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>💡</span>
              <div style={{ fontSize: '12px', color: 'var(--text)', lineHeight: '1.4' }}>
                <strong>Zero-cost scheduling fix:</strong> Do not initiate new provider onboarding on Fridays. Shift starts to Thursdays (our best operational start day: 38% breach, high volume).
              </div>
            </div>
          </div>
        );

      case 13:
        return (
          <div className="chart-card-premium" style={{ gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} color="var(--accent)" />
                P014 and P003 Prove 15–16 Day Onboarding Is Achievable Today
              </h3>
              <p style={{ color: 'var(--text3)', fontSize: '11.5px', marginTop: '4px' }}>
                The gap between 15 days and 23.5 days is entirely process automation and structural design, not complexity.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
              {/* Waterfall Phase Comparison */}
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '14px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)', marginBottom: '10px' }}>
                  Benchmark comparison by Phase (Days spent)
                </div>
                <div style={{ width: '100%', height: 180 }}>
                  <ResponsiveContainer>
                    <BarChart data={chart13Waterfall} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="phase" stroke="var(--text3)" fontSize={9} tickLine={false} />
                      <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: '9px', paddingTop: '6px' }} />
                      <Bar dataKey="P014" fill="var(--accent)" name="P014 (15d)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="P003" fill="var(--clr-good)" name="P003 (16d)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Avg" fill="#8c8a84" name="Cohort Average" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Spider/Radar Chart */}
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '14px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)', marginBottom: '10px' }}>
                  Radar Performance Dimension Comparison
                </div>
                <div style={{ width: '100%', height: 180 }}>
                  <ResponsiveContainer>
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chart13Radar}>
                      <PolarGrid stroke="var(--border)" />
                      <PolarAngleAxis dataKey="subject" stroke="var(--text3)" fontSize={9} />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} fontSize={8} stroke="var(--text3)" />
                      <Radar name="P014 (15d)" dataKey="P014" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.1} />
                      <Radar name="P003 (16d)" dataKey="P003" stroke="var(--clr-good)" fill="var(--clr-good)" fillOpacity={0.1} />
                      <Radar name="Cohort Avg" dataKey="Avg" stroke="#8c8a84" fill="#8c8a84" fillOpacity={0.1} />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: '9px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        );

      case 14:
        return (
          <div className="chart-card-premium" style={{ gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ClipboardList size={16} color="var(--accent)" />
                Three Provider Profiles — Each Requiring a Different Operational Intervention
              </h3>
              <p style={{ color: 'var(--text3)', fontSize: '11.5px', marginTop: '4px' }}>
                One-size-fits-all onboarding is why Standard providers get delayed waiting for IT-Stressed ones.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: '20px', alignItems: 'start' }}>
              {/* Bubble chart */}
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '14px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)', marginBottom: '10px' }}>
                  Breach Rate vs Duration Bubble (Sized by Count)
                </div>
                <div style={{ width: '100%', height: 180 }}>
                  <ResponsiveContainer>
                    <ScatterChart margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis type="number" dataKey="duration" name="Avg Duration" stroke="var(--text3)" fontSize={10} domain={[20, 28]} unit="d" />
                      <YAxis type="number" dataKey="breachRate" name="Breach Rate" stroke="var(--text3)" fontSize={10} domain={[0, 100]} unit="%" />
                      <Tooltip content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const p = payload[0].payload;
                          return (
                            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px', boxShadow: 'var(--shadow)' }}>
                              <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text)' }}>{p.name}</p>
                              <p style={{ fontSize: '10px' }}>Count: <strong>{p.count} providers</strong></p>
                              <p style={{ fontSize: '10px' }}>Breach Rate: <strong>{p.breachRate}%</strong></p>
                              <p style={{ fontSize: '10px' }}>Avg Days: <strong>{p.duration}d</strong></p>
                            </div>
                          );
                        }
                        return null;
                      }} />
                      <Scatter name="Profiles" data={chart14Bubbles} fill="var(--accent)">
                        {chart14Bubbles.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} r={entry.count * 1.2} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Three profile cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '10px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--clr-good)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    1. Standard (n=16)
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text3)', marginBottom: '6px' }}>21.8 days | 31% breach</div>
                  <p style={{ fontSize: '9.5px', color: 'var(--text2)', lineHeight: '1.4' }}>
                    <strong>Intervention:</strong> Protect this baseline group from resource diversion to IT-Stressed cases.
                  </p>
                </div>

                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '10px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--clr-caution)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    2. Compliance-Heavy (n=8)
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text3)', marginBottom: '6px' }}>26.0 days | 50% breach</div>
                  <p style={{ fontSize: '9.5px', color: 'var(--text2)', lineHeight: '1.4' }}>
                    <strong>Intervention:</strong> Pre-onboarding credential validation + parallel stage scheduling.
                  </p>
                </div>

                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '10px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--clr-critical)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    3. IT-Stressed (n=12)
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text3)', marginBottom: '6px' }}>24.3 days | 67% breach</div>
                  <p style={{ fontSize: '9.5px', color: 'var(--text2)', lineHeight: '1.4' }}>
                    <strong>Intervention:</strong> Automate credentialing, pre-provision contracting phase, 24h help desk SLA.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 15:
        return (
          <div className="chart-card-premium" style={{ gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={16} color="var(--accent)" />
                February's 38% Breach Rate Looks Like Improvement — But May Be a Cohort Artifact
              </h3>
              <p style={{ color: 'var(--text3)', fontSize: '11.5px', marginTop: '4px' }}>
                Duration is barely moving. Ticket resolution is worsening. Experience quality is quietly declining.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
              {/* Panel 1: Multi-line trend */}
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '14px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)', marginBottom: '10px' }}>
                  Breach Rate vs Avg Duration Days Monthly Trend
                </div>
                <div style={{ width: '100%', height: 180 }}>
                  <ResponsiveContainer>
                    <LineChart data={chart15Monthly} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="month" stroke="var(--text3)" fontSize={10} tickLine={false} />
                      <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: '9px', paddingTop: '6px' }} />
                      <Line type="monotone" dataKey="breachRate" stroke="var(--clr-critical)" strokeWidth={2} name="Breach Rate (%)" dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="avgDays" stroke="var(--accent)" strokeWidth={2} name="Avg Days" strokeDasharray="3 3" dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Panel 2: Stacked monthly composition */}
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '14px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)', marginBottom: '10px' }}>
                  Cohort Delay Reason Complexity Mix
                </div>
                <div style={{ width: '100%', height: 180 }}>
                  <ResponsiveContainer>
                    <BarChart data={chart15Monthly} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="month" stroke="var(--text3)" fontSize={10} tickLine={false} />
                      <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} unit="%" />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="itAccessPct" stackId="monthpct" fill="var(--clr-critical)" name="IT Access" />
                      <Bar dataKey="schedulingPct" stackId="monthpct" fill="var(--clr-warn)" name="Scheduling" />
                      <Bar dataKey="otherPct" stackId="monthpct" fill="#8c8a84" name="Other Delays" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
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
        <button
          className={`charts-sub-btn ${activeSubTab === 'advanced' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('advanced')}
        >
          🔬 Case Study Deep Dives
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

      {/* ======================================================== */}
      {/* SUB-TAB 5: CASE STUDY DEEP DIVES (15 INTERACTIVE CHARTS) */}
      {/* ======================================================== */}
      {activeSubTab === 'advanced' && (
        <div style={{ display: 'grid', gridTemplateColumns: '290px 1fr', gap: '24px', animation: 'fadeIn 0.2s ease-out' }}>
          {/* Left Sidebar Menu of 15 Charts */}
          <div style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            height: 'calc(100vh - 220px)',
            overflowY: 'auto',
            position: 'sticky',
            top: '24px'
          }} className="case-study-sidebar">
            <h3 style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text3)', padding: '0 8px 8px', borderBottom: '1px solid var(--border)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              🔬 Case Study Charts (15)
            </h3>
            {caseStudyChartsList.map(c => {
              const isActive = selectedCaseStudyChart === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCaseStudyChart(c.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius)',
                    background: isActive ? 'var(--accent)' : 'transparent',
                    border: 'none',
                    color: isActive ? '#FFFFFF' : 'var(--text)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                  className={`case-study-item-btn ${isActive ? 'active' : ''}`}
                >
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    fontFamily: 'var(--font-mono)',
                    background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--surface)',
                    color: isActive ? '#FFFFFF' : 'var(--text2)',
                    width: '22px',
                    height: '22px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {c.id}
                  </span>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12px', fontWeight: isActive ? '600' : '500' }}>
                    {c.title.split(': ')[1] || c.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Workspace - Selected Chart display */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {renderCaseStudyChart(selectedCaseStudyChart)}
          </div>
        </div>
      )}

    </div>
  );
}
