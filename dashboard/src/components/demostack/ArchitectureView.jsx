import React, { useState } from 'react';
import { Database, Server, GitBranch, Bell, Copy, Check, ExternalLink, Code2, Layers } from 'lucide-react';

export default function ArchitectureView() {
  const [copiedType, setCopiedType] = useState(null);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const schemaSql = `-- PostgreSQL / Supabase Schema for Review Intelligence Pipeline

CREATE TABLE IF NOT EXISTS raw_reviews (
    id SERIAL PRIMARY KEY,
    product_name TEXT NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    raw_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS processed_reviews (
    id SERIAL PRIMARY KEY,
    raw_review_id INTEGER REFERENCES raw_reviews(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    rating INTEGER NOT NULL,
    cleaned_text TEXT NOT NULL,
    sentiment_label VARCHAR(10) NOT NULL CHECK (sentiment_label IN ('POSITIVE', 'NEGATIVE')),
    sentiment_confidence NUMERIC(5, 4) NOT NULL,
    needs_review BOOLEAN DEFAULT FALSE,
    topics JSONB DEFAULT '[]'::jsonb,
    complaint TEXT,
    summary TEXT,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Analytical Views
CREATE OR REPLACE VIEW sentiment_summary AS
SELECT 
    sentiment_label,
    COUNT(*) AS total_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS percentage,
    ROUND(AVG(sentiment_confidence) * 100, 1) AS avg_confidence
FROM processed_reviews
GROUP BY sentiment_label;

CREATE OR REPLACE VIEW top_topics AS
SELECT 
    topic,
    COUNT(*) AS mention_count,
    SUM(CASE WHEN sentiment_label = 'NEGATIVE' THEN 1 ELSE 0 END) AS negative_mentions
FROM processed_reviews,
LATERAL jsonb_array_elements_text(topics) AS topic
GROUP BY topic
ORDER BY negative_mentions DESC, mention_count DESC
LIMIT 15;`;

  return (
    <div className="demostack-cardview-root">
      <div className="demostack-cardview-header">
        <div className="demostack-cardview-title-group">
          <h2 className="demostack-cardview-title">Architecture &amp; Data Pipeline</h2>
          <span className="demostack-cardview-badge">End-to-End Hybrid NLP</span>
        </div>
      </div>

      {/* 4 Pipeline Stages */}
      <div className="demostack-actions-row">
        <div className="demostack-action-card">
          <div className="demostack-action-icon-wrap wave">
            <Server size={20} color="#0284c7" />
          </div>
          <div className="demostack-action-text">
            <span className="demostack-action-title">1. Text Preprocessing</span>
            <p className="demostack-action-desc">
              HTML stripping, entity decoding, and token sanitization prior to model ingestion.
            </p>
          </div>
        </div>

        <div className="demostack-action-card">
          <div className="demostack-action-icon-wrap sky">
            <GitBranch size={20} color="#059669" />
          </div>
          <div className="demostack-action-text">
            <span className="demostack-action-title">2. DistilBERT SST-2 Engine</span>
            <p className="demostack-action-desc">
              Sub-50ms sentiment classification. Confidence &lt; 0.60 routes to <code>needs_review = true</code>.
            </p>
          </div>
        </div>

        <div className="demostack-action-card">
          <div className="demostack-action-icon-wrap neon">
            <Code2 size={20} color="#7c3aed" />
          </div>
          <div className="demostack-action-text">
            <span className="demostack-action-title">3. Groq Llama 3.1 8B LLM</span>
            <p className="demostack-action-desc">
              Strict JSON response format for structured topic extraction and root-cause complaint isolation.
            </p>
          </div>
        </div>
      </div>

      {/* SQL Schema Box */}
      <div className="demostack-showcase-card" style={{ marginTop: '1rem' }}>
        <div className="demostack-showcase-header">
          <div className="demostack-showcase-header-left">
            <span className="demostack-showcase-tag">POSTGRESQL &amp; SUPABASE DDL</span>
            <span className="demostack-showcase-title">Normalized Tables &amp; Materialized Views</span>
          </div>

          <button
            type="button"
            className="demostack-action-pill-btn"
            onClick={() => copyToClipboard(schemaSql, 'schema')}
          >
            {copiedType === 'schema' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{copiedType === 'schema' ? 'Copied SQL' : 'Copy DDL Script'}</span>
          </button>
        </div>

        <div style={{ padding: '1.25rem', backgroundColor: '#090d16' }}>
          <pre style={{ 
            fontFamily: 'var(--font-mono)', 
            fontSize: '0.78rem', 
            color: '#38bdf8', 
            lineHeight: 1.5,
            overflowX: 'auto',
            margin: 0
          }}>
            {schemaSql}
          </pre>
        </div>
      </div>
    </div>
  );
}
