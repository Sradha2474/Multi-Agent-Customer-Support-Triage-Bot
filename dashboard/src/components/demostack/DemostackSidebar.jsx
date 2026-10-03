import React, { useState } from 'react';
import { 
  BuildingIcon, 
  CaretUpDownIcon 
} from './DemostackIcons';
import { 
  LayoutDashboard, 
  TableProperties, 
  BarChart3, 
  Zap, 
  ShieldAlert, 
  Database, 
  Settings, 
  Sun, 
  Moon, 
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export default function DemostackSidebar({
  currentTab,
  onSelectTab,
  totalReviews = 50,
  flaggedCount = 0,
  isDark = false,
  onToggleTheme,
  onOpenSettings,
  onResetData,
  collapsed = false,
  onToggleCollapse
}) {
  const [orgMenuOpen, setOrgMenuOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview & Showcase', icon: LayoutDashboard, badge: 'Live v2.4' },
    { id: 'audit', label: 'Review Stream & Audit', icon: TableProperties, badge: `${totalReviews}` },
    { id: 'analytics', label: 'Executive Analytics', icon: BarChart3, badge: '4 Views' },
    { id: 'playground', label: 'Live Sandbox & Test', icon: Zap, badge: 'Sub-50ms' },
    { id: 'confidence-gate', label: 'Confidence QA Gate', icon: ShieldAlert, badge: flaggedCount > 0 ? `${flaggedCount} Flagged` : '0 Flagged', alert: flaggedCount > 0 },
    { id: 'architecture', label: 'SQL Views & n8n', icon: Database, badge: 'Supabase' },
  ];

  return (
    <aside 
      className={`demostack-sidebar ${collapsed ? 'collapsed' : ''}`}
      aria-label="Platform Sidebar"
    >
      {/* Top Organization Capsule Box */}
      <div className="demostack-sidebar-org-box">
        <div className="demostack-sidebar-header-row">
          <div className="demostack-brand-logo">
            <div className="demostack-logo-mark">
              <Sparkles size={16} color="#ffffff" />
            </div>
            {!collapsed && (
              <div className="demostack-brand-text">
                <span className="demostack-brand-title">ReviewPulse<span className="demostack-brand-dot">.ai</span></span>
                <span className="demostack-brand-subtitle">NLP Intelligence</span>
              </div>
            )}
          </div>

          <button 
            type="button"
            className="demostack-collapse-btn"
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label="Toggle sidebar collapse"
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>

        {/* Organization Switcher Trigger */}
        <div 
          className="demostack-org-trigger"
          onClick={() => setOrgMenuOpen(!orgMenuOpen)}
          title="Switch workspace"
        >
          <div className="demostack-org-icon-badge">
            <BuildingIcon />
          </div>

          {!collapsed && (
            <div className="demostack-org-info">
              <span className="demostack-org-name">Amazon &amp; Flipkart Org</span>
              <span className="demostack-org-role">Production Pipeline</span>
            </div>
          )}

          {!collapsed && <CaretUpDownIcon className="demostack-org-caret" />}
        </div>

        {/* Members Pill Bar */}
        {!collapsed && (
          <div className="demostack-org-members">
            <span className="demostack-members-label">MEMBERS [3]</span>
            <div className="demostack-avatar-stack">
              <span className="demostack-avatar" title="AI Analyst" style={{ background: '#0284c7' }}>AI</span>
              <span className="demostack-avatar" title="QA Lead" style={{ background: '#059669' }}>QA</span>
              <span className="demostack-avatar" title="Judge / Evaluator" style={{ background: '#7c3aed' }}>JD</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation Links */}
      <nav className="demostack-nav-menu">
        <span className="demostack-menu-group-label">{!collapsed ? 'WORKSPACE' : '•••'}</span>
        
        <ul className="demostack-nav-list">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`demostack-nav-link ${isActive ? 'active' : ''} ${item.alert ? 'has-alert' : ''}`}
                  onClick={() => onSelectTab(item.id)}
                  title={item.label}
                >
                  <Icon className="demostack-nav-icon" size={18} />
                  {!collapsed && <span className="demostack-nav-text">{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span className={`demostack-nav-badge ${item.alert ? 'alert' : ''}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Quick Action Reset */}
      {!collapsed && (
        <div className="demostack-sidebar-action-box">
          <button 
            type="button"
            className="demostack-reset-btn"
            onClick={onResetData}
            title="Reset reviews to initial clean dataset"
          >
            <RotateCcw size={13} />
            <span>Reset 50 Sample Reviews</span>
          </button>
        </div>
      )}

      {/* Sidebar Footer User Card & Theme Toggle */}
      <div className="demostack-sidebar-footer">
        <div className="demostack-user-card">
          <div className="demostack-user-avatar">
            <span>JD</span>
            <span className="demostack-online-dot"></span>
          </div>

          {!collapsed && (
            <div className="demostack-user-details">
              <span className="demostack-user-name">Judge / Evaluator</span>
              <span className="demostack-user-role">evaluator@production.ai</span>
            </div>
          )}

          <div className="demostack-footer-controls">
            <button 
              type="button" 
              className="demostack-icon-action-btn"
              onClick={onToggleTheme}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <button 
              type="button" 
              className="demostack-icon-action-btn"
              onClick={onOpenSettings}
              title="API Keys & Webhooks Config"
            >
              <Settings size={15} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
