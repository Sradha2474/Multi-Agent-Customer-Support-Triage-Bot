import React from 'react';
import { Activity, Settings, RotateCcw, Database, Cpu, MessageSquare } from 'lucide-react';

export default function Header({ onOpenSettings, onResetData, totalReviews }) {
  return (
    <header className="header-bar">
      <div className="brand-section">
        <div className="brand-icon">
          <Activity size={24} />
        </div>
        <div className="brand-title">
          <h1>
            Sentilytix AI
            <span className="brand-badge">Pipeline Live</span>
          </h1>
          <span className="brand-subtitle">
            Automated Customer Review Sentiment &amp; Insight Telemetry
          </span>
        </div>
      </div>

      <div className="system-status-pills">
        <div className="status-pill" title="DistilBERT SST-2 English Model">
          <span className="status-indicator-dot online"></span>
          <span>HF DistilBERT</span>
        </div>
        <div className="status-pill" title="Groq LLM for Topics & Complaints">
          <Cpu size={13} color="#a855f7" />
          <span>Groq LLM</span>
        </div>
        <div className="status-pill" title="Supabase PostgreSQL Connection Pooler">
          <Database size={13} color="#06b6d4" />
          <span>Supabase DB</span>
        </div>
        <div className="status-pill" title="Automated Slack Digest Alerts">
          <MessageSquare size={13} color="#10b981" />
          <span>Slack Digest</span>
        </div>
      </div>

      <div className="header-actions">
        <button 
          className="btn btn-secondary btn-sm"
          onClick={onResetData}
          title="Reset back to initial Flipkart review sample"
        >
          <RotateCcw size={14} />
          Reset Sample
        </button>
        <button 
          className="btn btn-primary btn-sm"
          onClick={onOpenSettings}
        >
          <Settings size={14} />
          API &amp; Webhook Config
        </button>
      </div>
    </header>
  );
}
