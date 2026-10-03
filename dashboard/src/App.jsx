import React, { useState, useEffect, useMemo } from 'react';
import DemostackSidebar from './components/demostack/DemostackSidebar';
import DemostackTopbar from './components/demostack/DemostackTopbar';
import DemostackCardView from './components/demostack/DemostackCardView';
import ArchitectureView from './components/demostack/ArchitectureView';
import Hero from './components/Hero';
import KpiMetrics from './components/KpiMetrics';
import LivePlayground from './components/LivePlayground';
import AnalyticsView from './components/AnalyticsView';
import SettingsModal from './components/SettingsModal';
import { INITIAL_REVIEWS } from './data/initialReviews';

const STORAGE_KEY_REVIEWS = 'reviewpulse_reviews_v3';
const STORAGE_KEY_CONFIG = 'reviewpulse_config_v3';
const STORAGE_KEY_THEME = 'reviewpulse_theme_v3';

export default function App() {
  // Reviews state
  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REVIEWS);
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  // Config state (defaults to reading VITE_GROQ_API_KEY if available)
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      const parsed = saved ? JSON.parse(saved) : {};
      return {
        hfToken: parsed.hfToken || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_HF_API_KEY) || '',
        groqKey: parsed.groqKey || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GROQ_API_KEY) || '',
        supabaseUri: parsed.supabaseUri || '',
        n8nWebhookUrl: parsed.n8nWebhookUrl || ''
      };
    } catch {
      return {
        hfToken: '',
        groqKey: '',
        supabaseUri: '',
        n8nWebhookUrl: ''
      };
    }
  });

  // Theme state (Light by default as requested, with dark toggle)
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_THEME) === 'dark';
    } catch {
      return false;
    }
  });

  // Apply dark mode class to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  // Layout & Navigation State
  const [currentTab, setCurrentTab] = useState('overview'); // 'overview' | 'audit' | 'analytics' | 'playground' | 'confidence-gate' | 'architecture'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Global Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedRating, setSelectedRating] = useState('ALL');
  const [selectedSentiment, setSelectedSentiment] = useState('ALL');
  const [selectedAuditGate, setSelectedAuditGate] = useState('ALL');

  // Sync reviews to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }, [reviews]);

  // Sync config
  const handleSaveConfig = (newConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(newConfig));
    } catch (e) {
      console.warn("Could not save config to localStorage:", e);
    }
  };

  // Add newly ingested review from live demonstrator or playground
  const handleReviewIngested = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
  };

  // Toggle review audit flag
  const handleToggleAuditFlag = (id) => {
    setReviews(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, needs_review: !r.needs_review };
      }
      return r;
    }));
  };

  // Reset sample dataset
  const handleResetData = () => {
    if (window.confirm("Reset dataset back to the initial 50 clean reviews?")) {
      setReviews(INITIAL_REVIEWS);
      setSearchQuery('');
      setSelectedBrand('ALL');
      setSelectedRating('ALL');
      setSelectedSentiment('ALL');
      setSelectedAuditGate('ALL');
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedBrand('ALL');
    setSelectedRating('ALL');
    setSelectedSentiment('ALL');
    setSelectedAuditGate('ALL');
  };

  // Filter calculations
  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchProduct = r.product_name?.toLowerCase().includes(q);
        const matchText = (r.cleaned_text || r.raw_text)?.toLowerCase().includes(q);
        const matchSummary = r.summary?.toLowerCase().includes(q);
        const matchComplaint = r.complaint?.toLowerCase().includes(q);
        const matchTopics = r.topics?.some(t => t.toLowerCase().includes(q));
        if (!matchProduct && !matchText && !matchSummary && !matchComplaint && !matchTopics) {
          return false;
        }
      }

      // Brand Filter
      if (selectedBrand !== 'ALL') {
        const p = (r.product_name || '').toUpperCase();
        if (selectedBrand === 'OTHER') {
          const known = ['CROMPTON', 'BOAT', 'INALSA', 'SCOTCH-BRITE', 'MILTON', 'SPOTZERO', 'DDARSH', 'CEAT'];
          if (known.some(k => p.includes(k))) return false;
        } else if (!p.includes(selectedBrand)) {
          return false;
        }
      }

      // Rating Filter
      if (selectedRating !== 'ALL' && String(r.rating) !== selectedRating) {
        return false;
      }

      // Sentiment Filter
      if (selectedSentiment !== 'ALL' && r.sentiment_label !== selectedSentiment) {
        return false;
      }

      // Confidence Gate Filter
      if (currentTab === 'confidence-gate' || selectedAuditGate === 'FLAGGED') {
        if (!r.needs_review) return false;
      } else if (selectedAuditGate === 'VERIFIED') {
        if (r.needs_review) return false;
      }

      return true;
    });
  }, [reviews, searchQuery, selectedBrand, selectedRating, selectedSentiment, selectedAuditGate, currentTab]);

  const flaggedCount = useMemo(() => {
    return reviews.filter(r => r.needs_review).length;
  }, [reviews]);

  // Export to CSV
  const handleExportCsv = () => {
    if (filteredReviews.length === 0) {
      alert("No reviews to export.");
      return;
    }

    const headers = ["id", "product_name", "rating", "sentiment_label", "sentiment_confidence", "needs_review", "topics", "complaint", "summary", "created_at"];
    const csvRows = [headers.join(",")];

    filteredReviews.forEach(r => {
      const row = [
        r.id,
        `"${(r.product_name || '').replace(/"/g, '""')}"`,
        r.rating,
        r.sentiment_label,
        r.sentiment_confidence,
        r.needs_review,
        `"${(r.topics || []).join(';')}"`,
        `"${(r.complaint || '').replace(/"/g, '""')}"`,
        `"${(r.summary || '').replace(/"/g, '""')}"`,
        `"${r.created_at || ''}"`
      ];
      csvRows.push(row.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reviewpulse_reviews_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`demostack-app-layout ${isDark ? 'dark' : ''}`}>
      {/* 1. Demostack Floating Collapsible Sidebar */}
      <DemostackSidebar 
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        totalReviews={reviews.length}
        flaggedCount={flaggedCount}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onResetData={handleResetData}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* 2. Main Viewport */}
      <div className="demostack-main-viewport">
        {/* Topbar with ⌘K Search & Quick Action CTAs */}
        <DemostackTopbar 
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenSandbox={() => setCurrentTab('playground')}
          flaggedCount={flaggedCount}
          totalCount={reviews.length}
        />

        {/* View Switcher based on Active Tab */}
        {currentTab === 'overview' && (
          <>
            {/* Luminous Light Hero with "Put This -> Get That" Showcase Studio */}
            <Hero 
              onOpenSettings={() => setIsSettingsOpen(true)}
              onResetData={handleResetData}
              onSelectTab={setCurrentTab}
              onReviewIngested={handleReviewIngested}
              totalReviews={reviews.length}
              flaggedCount={flaggedCount}
              config={config}
            />

            {/* Metrics & Quick Collection Preview */}
            <main className="app-container" style={{ paddingTop: '2rem' }}>
              <section id="telemetry-metrics" aria-label="Pipeline Telemetry Metrics">
                <KpiMetrics 
                  reviews={filteredReviews} 
                  totalUnfilteredCount={reviews.length}
                />
              </section>

              <section style={{ marginTop: '1rem' }}>
                <DemostackCardView 
                  reviews={filteredReviews}
                  onToggleAuditFlag={handleToggleAuditFlag}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedBrand={selectedBrand}
                  onBrandChange={setSelectedBrand}
                  selectedRating={selectedRating}
                  onRatingChange={setSelectedRating}
                  selectedSentiment={selectedSentiment}
                  onSentimentChange={setSelectedSentiment}
                  selectedAuditGate={selectedAuditGate}
                  onAuditGateChange={setSelectedAuditGate}
                  onResetFilters={handleResetFilters}
                  onExportCsv={handleExportCsv}
                />
              </section>
            </main>
          </>
        )}

        {currentTab === 'audit' && (
          <main className="app-container" style={{ paddingTop: '1.5rem' }}>
            <DemostackCardView 
              reviews={filteredReviews}
              onToggleAuditFlag={handleToggleAuditFlag}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedBrand={selectedBrand}
              onBrandChange={setSelectedBrand}
              selectedRating={selectedRating}
              onRatingChange={setSelectedRating}
              selectedSentiment={selectedSentiment}
              onSentimentChange={setSelectedSentiment}
              selectedAuditGate={selectedAuditGate}
              onAuditGateChange={setSelectedAuditGate}
              onResetFilters={handleResetFilters}
              onExportCsv={handleExportCsv}
            />
          </main>
        )}

        {currentTab === 'analytics' && (
          <main className="app-container" style={{ paddingTop: '1.5rem' }}>
            <KpiMetrics 
              reviews={filteredReviews} 
              totalUnfilteredCount={reviews.length}
            />
            <AnalyticsView 
              reviews={filteredReviews}
              onSelectTopicFilter={(topic) => {
                setSearchQuery(topic);
                setCurrentTab('audit');
              }}
              onSelectProductFilter={(prod) => {
                setSearchQuery(prod.slice(0, 25));
                setCurrentTab('audit');
              }}
            />
          </main>
        )}

        {currentTab === 'playground' && (
          <main className="app-container" style={{ paddingTop: '1.5rem' }}>
            <LivePlayground 
              onReviewIngested={handleReviewIngested}
              config={config}
            />
          </main>
        )}

        {currentTab === 'confidence-gate' && (
          <main className="app-container" style={{ paddingTop: '1.5rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <div className="demostack-gate-badge flagged" style={{ display: 'inline-flex', padding: '8px 16px', fontSize: '0.85rem' }}>
                <span>Human-in-the-Loop Quality Gate: Displaying all {filteredReviews.length} borderline customer reviews flagged for QA sign-off (DistilBERT confidence &lt; 0.60).</span>
              </div>
            </div>
            <DemostackCardView 
              reviews={filteredReviews}
              onToggleAuditFlag={handleToggleAuditFlag}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedBrand={selectedBrand}
              onBrandChange={setSelectedBrand}
              selectedRating={selectedRating}
              onRatingChange={setSelectedRating}
              selectedSentiment={selectedSentiment}
              onSentimentChange={setSelectedSentiment}
              selectedAuditGate="FLAGGED"
              onAuditGateChange={setSelectedAuditGate}
              onResetFilters={handleResetFilters}
              onExportCsv={handleExportCsv}
            />
          </main>
        )}

        {currentTab === 'architecture' && (
          <main className="app-container" style={{ paddingTop: '1.5rem' }}>
            <ArchitectureView />
          </main>
        )}
      </div>

      {/* API & Webhook Configuration Modal */}
      {isSettingsOpen && (
        <SettingsModal 
          config={config}
          onSaveConfig={handleSaveConfig}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}
