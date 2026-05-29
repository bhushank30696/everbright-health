import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { generateProvidersForQuarter, recomputeDataAggregates } from '../utils/synthesisEngine';

const DashboardContext = createContext();

const SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1eXdbzv866nxlkY2eUZozlctFNHuVaemh0SrTB7MHV-g/export?format=csv&gid=171064881";

// Standalone CSV parser that handles commas inside quotes correctly
const parseCSV = (text) => {
  let lines = [];
  let row = [""];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    let c = text[i];
    let next = text[i+1];
    if (c === '"') {
      if (inQuotes && next === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push("");
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') {
        i++;
      }
      lines.push(row);
      row = [""];
    } else {
      row[row.length - 1] += c;
    }
  }
  if (row.length > 1 || row[0] !== "") {
    lines.push(row);
  }
  return lines;
};

// Map raw CSV lines to provider database objects (constrained strictly to columns A-P and rows 1-37 of the spreadsheet)
const mapCsvToProviders = (csvLines) => {
  if (csvLines.length < 2) return null;
  // Constrain headers to columns A-P (indices 0 to 15, i.e. first 16 columns)
  const headers = csvLines[0].slice(0, 16).map(h => h.trim());
  
  // Constrain rows to 1 to 37 (index 0 is header, indices 1 to 36 are the 36 data rows)
  return csvLines.slice(1, 37).map(row => {
    let obj = {};
    headers.forEach((h, idx) => {
      let val = row[idx] !== undefined ? row[idx].trim() : "";
      
      // Attempt numeric conversion for metric cells
      if (val === "") {
        obj[h] = "";
      } else if (!isNaN(val) && val !== null && val !== "") {
        obj[h] = Number(val);
      } else {
        obj[h] = val;
      }
    });
    return obj;
  }).filter(p => p['Provider ID']);
};

export const DashboardProvider = ({ children }) => {
  const [activeState, setActiveState] = useState('all');
  const [activeQuarter, setActiveQuarter] = useState('Q1');
  const [activeTab, setActiveTab] = useState('ops');
  const [activeSubTab, setActiveSubTab] = useState('market');
  const [selectedProviderId, setSelectedProviderId] = useState(null);

  // Theme support
  const [darkMode, setDarkMode] = useState(false);

  // Live Spreadsheet States
  const [liveBaseProviders, setLiveBaseProviders] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncError, setSyncError] = useState(null);

  const fetchLiveSheet = async () => {
    setSyncLoading(true);
    setSyncError(null);
    try {
      // Use cache-busting parameter to bypass browser/CDN caches and get the latest sheet data
      const response = await fetch(`${SPREADSHEET_URL}&cb=${new Date().getTime()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch spreadsheet: ${response.statusText}`);
      }
      const text = await response.text();
      const csvLines = parseCSV(text);
      const parsedProviders = mapCsvToProviders(csvLines);
      
      if (parsedProviders && parsedProviders.length > 0) {
        setLiveBaseProviders(parsedProviders);
        setIsLive(true);
        setLastSync(new Date());
      } else {
        throw new Error("No provider rows found in spreadsheet");
      }
    } catch (err) {
      console.error("Live Sheet Sync Error:", err);
      setSyncError(err.message);
      // Fallback is implicit since liveBaseProviders remains null or uses last loaded data
    } finally {
      setSyncLoading(false);
    }
  };

  // Fetch sheet on load
  useEffect(() => {
    fetchLiveSheet();

    // Auto-polling interval: fetch latest data every 60 seconds
    const interval = setInterval(fetchLiveSheet, 60000);
    return () => clearInterval(interval);
  }, []);

  // Generate database for active quarter
  const allProvidersInQuarter = useMemo(() => {
    return generateProvidersForQuarter(activeQuarter, liveBaseProviders);
  }, [activeQuarter, liveBaseProviders]);

  // Filter providers in context by state
  const providers = useMemo(() => {
    if (activeState === 'all') return allProvidersInQuarter;
    return allProvidersInQuarter.filter(p => p.Market === activeState);
  }, [allProvidersInQuarter, activeState]);

  // Compute stats on the fly
  const dashboardData = useMemo(() => {
    return recomputeDataAggregates(allProvidersInQuarter, activeState, activeQuarter);
  }, [allProvidersInQuarter, activeState, activeQuarter]);

  // If activeState changes globally, make sure we sync local filters
  useEffect(() => {
    // Reset individual provider selection when state/quarter changes to avoid showing a provider from a different cohort or state
    setSelectedProviderId(null);
  }, [activeState, activeQuarter]);

  // Dark Mode side effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <DashboardContext.Provider value={{
      activeState,
      setActiveState,
      activeQuarter,
      setActiveQuarter,
      activeTab,
      setActiveTab,
      activeSubTab,
      setActiveSubTab,
      selectedProviderId,
      setSelectedProviderId,
      providers, // Filtered provider list
      allProvidersInQuarter, // Full quarterly provider list (for heatmaps)
      dashboardData,
      isLive,
      lastSync,
      syncLoading,
      syncError,
      fetchLiveSheet,
      darkMode,
      setDarkMode
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
