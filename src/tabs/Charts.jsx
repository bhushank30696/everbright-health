import React, { useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
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
  PolarRadiusAxis
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
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
      }}>
        <p style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '8px', fontSize: '12px', fontFamily: 'var(--font-sans)' }}>
          {label}
        </p>
        {payload.map((item, idx) => (
          <p key={idx} style={{ color: item.color || 'var(--text)', fontSize: '11px', margin: '4px 0', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.color, display: 'inline-block' }} />
            <span style={{ fontWeight: '500', color: 'var(--text2)' }}>{item.name}:</span>
            <span style={{ fontWeight: '600', color: 'var(--text)' }}>
              {item.value}{item.name.includes('Rate') || item.name.includes('Completion') ? '%' : item.name.includes('Duration') || item.name.includes('Days') ? 'd' : item.name.includes('Time') ? 'h' : ''}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Scatter plot custom tooltip
const ScatterTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '12px 16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
      }}>
        <p style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '4px', fontSize: '12px', fontFamily: 'var(--font-sans)' }}>
          {data.name}
        </p>
        <p style={{ fontSize: '10px', color: 'var(--text3)', marginBottom: '8px', fontFamily: 'var(--font-sans)' }}>
          ID: {data.id} · Market: {data.market}
        </p>
        <p style={{ fontSize: '11px', margin: '4px 0', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--clr-good)', display: 'inline-block' }} />
          <span style={{ fontWeight: '500', color: 'var(--text2)' }}>Tasks Completed:</span>
          <span style={{ fontWeight: '600', color: 'var(--text)' }}>{data.TasksCompleted}%</span>
        </p>
        <p style={{ fontSize: '11px', margin: '4px 0', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
          <span style={{ fontWeight: '500', color: 'var(--text2)' }}>Onboarding Duration:</span>
          <span style={{ fontWeight: '600', color: 'var(--text)' }}>{data.OnboardingDuration}d</span>
        </p>
        <p style={{ fontSize: '11px', margin: '4px 0', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: data.riskIndex >= 70 ? 'var(--clr-critical)' : data.riskIndex >= 40 ? 'var(--clr-warn)' : 'var(--clr-good)', display: 'inline-block' }} />
          <span style={{ fontWeight: '500', color: 'var(--text2)' }}>Risk Score:</span>
          <span style={{ fontWeight: '600', color: 'var(--text)' }}>{data.riskIndex}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function Charts() {
  const { activeState, activeQuarter, dashboardData, providers } = useDashboard();
  const { kpis, delay_reasons, escalation_types, monthly_trend } = dashboardData;

  // Chart 1: Format Monthly Trends
  const formattedMonthlyTrend = useMemo(() => {
    return monthly_trend.map(t => ({
      month: t.start_month.toUpperCase(),
      'SLA Breach Rate': Math.round(t.breach_rate * 100),
      'Avg Onboarding Days': t.avg_onboarding
    }));
  }, [monthly_trend]);

  // Chart 2: Format Delay Diagnostics
  const formattedDelays = useMemo(() => {
    return [...delay_reasons]
      .sort((a, b) => b.count - a.count)
      .map(r => ({
        name: r['Primary Delay Reason'],
        Volume: r.count,
        'SLA Breach Rate': Math.round(r.breach_rate * 100)
      }));
  }, [delay_reasons]);

  // Chart 3: Format Escalation Types (Donut)
  const formattedEscalations = useMemo(() => {
    return escalation_types.map(et => ({
      name: et['Escalation Type'],
      value: et.count,
      'SLA Breach Rate': Math.round(et.breach_rate * 100)
    }));
  }, [escalation_types]);

  // Chart 4: Format Scatter Data
  const scatterData = useMemo(() => {
    let data = [...providers];
    if (activeState !== 'all') {
      data = data.filter(p => p.Market === activeState);
    }
    return data.map(p => ({
      name: p.ProviderName,
      id: p['Provider ID'],
      TasksCompleted: p['% Tasks Completed On Time'] || 0,
      OnboardingDuration: p['Onboarding Duration (days)'] || 0,
      riskIndex: p.calculated_risk_index || 0,
      market: p.Market
    }));
  }, [providers, activeState]);

  // Chart 5: Format Onboarding Step Radar
  const stepRadarData = useMemo(() => {
    const steps = ['Contracting', 'IT Provisioning', 'Compliance', 'Training'];
    const cleanProvs = providers.filter(p => p['SLA Breach (Y/N)'] === 'N');
    const breachedProvs = providers.filter(p => p['SLA Breach (Y/N)'] === 'Y');
    
    return steps.map(step => {
      const key = step + ' Days';
      const avgClean = cleanProvs.length ? (cleanProvs.reduce((sum, p) => sum + (p[key] || 0), 0) / cleanProvs.length) : 0;
      const avgBreached = breachedProvs.length ? (breachedProvs.reduce((sum, p) => sum + (p[key] || 0), 0) / breachedProvs.length) : 0;
      
      return {
        step: step,
        'No Breach': Math.round(avgClean * 10) / 10,
        'SLA Breach': Math.round(avgBreached * 10) / 10
      };
    });
  }, [providers]);

  // Donut colors
  const COLORS = [
    'var(--clr-critical)',
    'var(--clr-warn)',
    'var(--clr-caution)',
    'var(--clr-good)',
    'oklch(0.52 0.015 95.0)'
  ];

  return (
    <div className="page active" id="page-charts" style={{ animation: 'fadeIn 0.25s ease-out' }}>
      {/* Title Header */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text)' }}>
          Portfolio Insights & Analytics
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '2px' }}>
          Interactive visualization workspace · SLA trends · Handoff diagnostics · Performance distributions
        </p>
        <div className="meta">
          DATASET: {kpis.total_providers} PROVIDERS · {activeQuarter} 2025
        </div>
      </div>

      {/* SECTION 1: Time Series & Volumetric Trends */}
      <div className="grid-2" style={{ gap: '20px', marginBottom: '20px' }}>
        {/* Onboarding Duration Trend */}
        <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '24px' }}>
          <div className="card-header" style={{ marginBottom: '16px' }}>
            <div>
              <div className="card-title" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>Onboarding Duration Trend</div>
              <div className="card-sub">Chronological average onboarding speed in days</div>
            </div>
            <span className="card-tag">TIME SERIES</span>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={formattedMonthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOnboarding" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text3)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Avg Onboarding Days" stroke="var(--accent)" strokeWidth={2} fillOpacity={1} fill="url(#colorOnboarding)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SLA Breach Rate Trend */}
        <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '24px' }}>
          <div className="card-header" style={{ marginBottom: '16px' }}>
            <div>
              <div className="card-title" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>SLA Breach Rate Trend</div>
              <div className="card-sub">Intake cohort failure rate fluctuations by start month</div>
            </div>
            <span className="card-tag">FAILURE RATE</span>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={formattedMonthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text3)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="SLA Breach Rate" stroke="var(--clr-critical)" strokeWidth={2} dot={{ r: 4, strokeWidth: 1 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 2: Delay Diagnostic Funnels */}
      <div className="grid-2" style={{ gap: '20px', marginBottom: '20px' }}>
        {/* Delay Reason Diagnostics */}
        <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '24px' }}>
          <div className="card-header" style={{ marginBottom: '16px' }}>
            <div>
              <div className="card-title" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>Delay Reason Impact Analysis</div>
              <div className="card-sub">Case volume by delay type vs associated SLA breach rates</div>
            </div>
            <span className="card-tag">DIAGNOSTIC</span>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={formattedDelays} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" stroke="var(--text3)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="var(--text)" fontSize={10} tickLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Volume" fill="var(--accent)" name="Delay Volume" radius={[0, 4, 4, 0]} barSize={12} />
                <Bar dataKey="SLA Breach Rate" fill="var(--clr-critical)" name="Breach Rate (%)" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Escalation Center Donut */}
        <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '24px' }}>
          <div className="card-header" style={{ marginBottom: '16px' }}>
            <div>
              <div className="card-title" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>Escalation Pathway Distribution</div>
              <div className="card-sub">Volume proportion of operational escalations by category</div>
            </div>
            <span className="card-tag">ROUTING BURDEN</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260 }}>
            <div style={{ width: '55%', height: '100%' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={formattedEscalations}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {formattedEscalations.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom Legend */}
            <div style={{ width: '45%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {formattedEscalations.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '11px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[idx % COLORS.length], marginTop: '3px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text)' }}>{item.name}</div>
                    <div style={{ color: 'var(--text3)', marginTop: '2px' }}>n={item.value} cases · {item.breachPct}% breach</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Performance Distribution & Scatter Correlations */}
      <div className="grid-2-1" style={{ gap: '20px' }}>
        {/* Task Completion vs Duration Scatter */}
        <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '24px' }}>
          <div className="card-header" style={{ marginBottom: '16px' }}>
            <div>
              <div className="card-title" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>Task Execution vs Onboarding Latency</div>
              <div className="card-sub">Individual provider correlation map · Target: Top Left Quadrant</div>
            </div>
            <span className="card-tag">CORRELATION</span>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" dataKey="TasksCompleted" name="Tasks Completed On Time" unit="%" stroke="var(--text3)" fontSize={10} domain={[40, 100]} />
                <YAxis type="number" dataKey="OnboardingDuration" name="Onboarding Duration" unit="d" stroke="var(--text3)" fontSize={10} domain={[10, 36]} />
                <ZAxis type="number" range={[50, 150]} />
                <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Providers" data={scatterData}>
                  {scatterData.map((entry, idx) => {
                    const dotColor = entry.riskIndex >= 70 ? 'var(--clr-critical)' : entry.riskIndex >= 40 ? 'var(--clr-warn)' : 'var(--clr-good)';
                    return <Cell key={`cell-${idx}`} fill={dotColor} stroke="var(--border)" strokeWidth={1} />;
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Onboarding Stage Radar */}
        <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '24px' }}>
          <div className="card-header" style={{ marginBottom: '16px' }}>
            <div>
              <div className="card-title" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>Step Drag Profile</div>
              <div className="card-sub">Average step duration comparison by cohort</div>
            </div>
            <span className="card-tag">STEP LATENCY</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={stepRadarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="step" stroke="var(--text2)" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="var(--text3)" fontSize={8} />
                <Tooltip content={<CustomTooltip />} />
                <Radar name="No Breach" dataKey="No Breach" stroke="var(--clr-good)" fill="var(--clr-good)" fillOpacity={0.2} />
                <Radar name="SLA Breach" dataKey="SLA Breach" stroke="var(--clr-warn)" fill="var(--clr-warn)" fillOpacity={0.2} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
