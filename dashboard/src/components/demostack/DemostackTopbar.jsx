import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Search, 
  Settings, 
  Zap, 
  Database, 
  CheckCircle, 
  AlertTriangle,
  X,
  ExternalLink,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';
import { NavSearchIcon, NavCmdIcon } from './DemostackIcons';

export default function DemostackTopbar({
  currentTab,
  onSelectTab,
  searchQuery = '',
  onSearchChange,
  onOpenSettings,
  onOpenSandbox,
  flaggedCount = 0,
  totalCount = 50
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  const notifications = [
    {
      id: 1,
      title: "Quality Gate Active",
      desc: `${flaggedCount} reviews isolated with DistilBERT confidence < 0.60`,
      time: "Real-time",
      icon: AlertTriangle,
      color: "#f59e0b"
    },
    {
      id: 2,
      title: "Groq Llama 3.1 Engine Online",
      desc: "Sub-100ms structured extraction (topics, root causes, summary)",
      time: "Operational",
      icon: Cpu,
      color: "#7c3aed"
    },
    {
      id: 3,
      title: "Supabase PostgreSQL Synchronized",
      desc: "raw_reviews, processed_reviews & 4 SQL views active",
      time: "Live Pooler",
      icon: Database,
      color: "#0284c7"
    },
    {
      id: 4,
      title: "n8n Daily Digest Alert",
      desc: "Scheduled cron 0 9 * * * dispatches executive digest to Slack",
      time: "Scheduled",
      icon: CheckCircle,
      color: "#10b981"
    }
  ];

  // Global ⌘K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsMobileSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const tabTitles = {
    'overview': { title: 'Overview & Production Demo', subtitle: 'Real-time NLP Telemetry & Input/Output Showcase' },
    'audit': { title: 'Review Stream & Audit Table', subtitle: `${totalCount} Stratified customer reviews with verification tags` },
    'analytics': { title: 'Executive Analytics Hub', subtitle: 'Sentiment ratios, complaint Pareto rankings & product leaderboard' },
    'playground': { title: 'Live Ingestion Playground', subtitle: 'Test custom reviews with DistilBERT SST-2 & Groq Llama 3.1' },
    'confidence-gate': { title: 'Confidence Quality Gate (< 0.60)', subtitle: 'Borderline and ambiguous customer reviews flagged for human QA' },
    'architecture': { title: 'SQL Views & n8n Orchestration', subtitle: 'PostgreSQL analytical views, schema, and automated digest pipeline' }
  };

  const currentInfo = tabTitles[currentTab] || tabTitles['overview'];

  return (
    <header className="demostack-topbar">
      {/* Left: Active Section Title & Breadcrumb */}
      <div className="demostack-topbar-left">
        <div className="demostack-title-wrap">
          <h1 className="demostack-topbar-title">{currentInfo.title}</h1>
          <span className="demostack-topbar-subtitle">{currentInfo.subtitle}</span>
        </div>
      </div>

      {/* Center: Search with ⌘K */}
      <div className="demostack-topbar-center">
        <div className="demostack-search-input-group">
          <NavSearchIcon className="demostack-search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            className="demostack-search-input"
            placeholder="Search reviews, complaints, products, topics..."
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              if (currentTab !== 'audit' && e.target.value) {
                onSelectTab('audit');
              }
            }}
          />
          {searchQuery ? (
            <button 
              type="button" 
              className="demostack-search-clear" 
              onClick={() => onSearchChange('')}
              title="Clear search"
            >
              <X size={13} />
            </button>
          ) : (
            <div className="demostack-cmd-badge" title="Press ⌘K or Ctrl+K to search">
              <NavCmdIcon />
              <span>K</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Quick Action CTAs & Notifications */}
      <div className="demostack-topbar-right">
        {/* Quick Test Button */}
        <button
          type="button"
          className="demostack-topbar-btn primary"
          onClick={() => onSelectTab('playground')}
          title="Try live review ingestion with Llama 3.1"
        >
          <Zap size={14} />
          <span>Live Ingest</span>
        </button>

        {/* API Config Trigger */}
        <button
          type="button"
          className="demostack-topbar-btn secondary"
          onClick={onOpenSettings}
          title="Configure API Keys & Webhooks"
        >
          <Settings size={14} />
          <span className="hide-on-mobile">API Config</span>
        </button>

        {/* Notifications Bell Dropdown */}
        <div className="demostack-notifications-wrapper">
          <button
            type="button"
            className={`demostack-topbar-icon-btn ${flaggedCount > 0 ? 'has-badge' : ''}`}
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            title="System alerts & telemetry notifications"
            aria-label="Notifications"
          >
            <Bell size={16} />
            {flaggedCount > 0 && <span className="demostack-notification-dot" />}
          </button>

          {notificationsOpen && (
            <div className="demostack-notifications-dropdown">
              <div className="demostack-notifications-header">
                <span className="demostack-notifications-title">Pipeline Notifications</span>
                <span className="demostack-notifications-count">{notifications.length} Active</span>
              </div>

              <div className="demostack-notifications-list">
                {notifications.map(n => {
                  const Icon = n.icon;
                  return (
                    <div key={n.id} className="demostack-notification-item">
                      <div className="demostack-notification-icon-wrap" style={{ color: n.color, background: `${n.color}15` }}>
                        <Icon size={14} />
                      </div>
                      <div className="demostack-notification-content">
                        <div className="demostack-notification-row">
                          <span className="demostack-notification-item-title">{n.title}</span>
                          <span className="demostack-notification-time">{n.time}</span>
                        </div>
                        <p className="demostack-notification-desc">{n.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="demostack-notifications-footer">
                <button 
                  type="button" 
                  className="demostack-notifications-close-btn"
                  onClick={() => setNotificationsOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
