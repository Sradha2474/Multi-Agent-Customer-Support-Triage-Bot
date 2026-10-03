import React from 'react';
import { Layers, ThumbsUp, ThumbsDown, AlertTriangle, Star, TrendingUp, ShieldAlert, Sparkles } from 'lucide-react';

export default function KpiMetrics({ reviews, totalUnfilteredCount }) {
  const total = reviews.length;
  const positiveCount = reviews.filter(r => r.sentiment_label === 'POSITIVE').length;
  const negativeCount = reviews.filter(r => r.sentiment_label === 'NEGATIVE').length;
  const flaggedCount = reviews.filter(r => r.needs_review).length;
  
  const positivePct = total > 0 ? ((positiveCount / total) * 100).toFixed(1) : '0.0';
  const negativePct = total > 0 ? ((negativeCount / total) * 100).toFixed(1) : '0.0';
  
  // Net Sentiment Score (NSS = % Positive - % Negative)
  const nss = total > 0 ? (Number(positivePct) - Number(negativePct)).toFixed(1) : '0.0';
  
  const avgRating = total > 0 
    ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / total).toFixed(1)
    : '0.0';

  return (
    <div className="kpi-grid">
      {/* 1. Total Reviews Ingested */}
      <div className="kpi-card" style={{ '--card-accent': '#0284c7', '--card-accent-bg': '#f0f9ff', '--card-border': '#bae6fd' }}>
        <div className="kpi-header">
          <span className="kpi-label">Ingested Dataset</span>
          <div className="kpi-icon-wrap">
            <Layers size={17} color="#0284c7" />
          </div>
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value">{total}</span>
          <span className="kpi-badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>
            {totalUnfilteredCount && total !== totalUnfilteredCount ? `${total} of ${totalUnfilteredCount}` : 'Batch Active'}
          </span>
        </div>
        <div className="kpi-footer-subtext">
          <span>Stratified balanced review sample</span>
        </div>
      </div>

      {/* 2. Positive Sentiment */}
      <div className="kpi-card" style={{ '--card-accent': '#059669', '--card-accent-bg': '#ecfdf5', '--card-border': '#a7f3d0' }}>
        <div className="kpi-header">
          <span className="kpi-label">Positive Sentiment</span>
          <div className="kpi-icon-wrap">
            <ThumbsUp size={17} color="#059669" />
          </div>
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value">{positivePct}%</span>
          <span className="kpi-badge" style={{ background: '#ecfdf5', color: '#059669' }}>
            {positiveCount} reviews
          </span>
        </div>
        <div className="kpi-progress-bar-wrap">
          <div className="kpi-progress-bar-fill" style={{ width: `${positivePct}%`, background: '#10b981' }} />
        </div>
        <div className="kpi-footer-subtext">
          <span>DistilBERT SST-2 High Confidence</span>
        </div>
      </div>

      {/* 3. Negative Sentiment */}
      <div className="kpi-card" style={{ '--card-accent': '#e11d48', '--card-accent-bg': '#fff1f2', '--card-border': '#fecdd3' }}>
        <div className="kpi-header">
          <span className="kpi-label">Negative Sentiment</span>
          <div className="kpi-icon-wrap">
            <ThumbsDown size={17} color="#e11d48" />
          </div>
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value">{negativePct}%</span>
          <span className="kpi-badge" style={{ background: '#fff1f2', color: '#e11d48' }}>
            {negativeCount} reviews
          </span>
        </div>
        <div className="kpi-progress-bar-wrap">
          <div className="kpi-progress-bar-fill" style={{ width: `${negativePct}%`, background: '#f43f5e' }} />
        </div>
        <div className="kpi-footer-subtext">
          <span>Root-cause issues routed to Llama 3.1</span>
        </div>
      </div>

      {/* 4. Net Sentiment Score (NSS) */}
      <div className="kpi-card" style={{ '--card-accent': '#4f46e5', '--card-accent-bg': '#eef2ff', '--card-border': '#c7d2fe' }}>
        <div className="kpi-header">
          <span className="kpi-label">Net Sentiment Score (NSS)</span>
          <div className="kpi-icon-wrap">
            <TrendingUp size={17} color="#4f46e5" />
          </div>
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value" style={{ color: Number(nss) >= 0 ? '#059669' : '#e11d48' }}>
            {Number(nss) >= 0 ? `+${nss}` : nss}
          </span>
          <span className="kpi-badge" style={{ background: '#eef2ff', color: '#4338ca' }}>
            Index Scale
          </span>
        </div>
        <div className="kpi-footer-subtext">
          <span>Standard customer satisfaction index</span>
        </div>
      </div>

      {/* 5. Quality Gate Flagged (Human Audit) */}
      <div className="kpi-card" style={{ '--card-accent': '#d97706', '--card-accent-bg': '#fffbeb', '--card-border': '#fde68a' }}>
        <div className="kpi-header">
          <span className="kpi-label">Audit Gate Flagged</span>
          <div className="kpi-icon-wrap">
            <AlertTriangle size={17} color="#d97706" />
          </div>
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value">{flaggedCount}</span>
          <span className="kpi-badge" style={{ background: '#fffbeb', color: '#b45309' }}>
            Score &lt; 0.60
          </span>
        </div>
        <div className="kpi-footer-subtext">
          <span>Human review required for compliance</span>
        </div>
      </div>

      {/* 6. Average Rating */}
      <div className="kpi-card" style={{ '--card-accent': '#f59e0b', '--card-accent-bg': '#fffbeb', '--card-border': '#fde68a' }}>
        <div className="kpi-header">
          <span className="kpi-label">Avg Customer Rating</span>
          <div className="kpi-icon-wrap">
            <Star size={17} color="#f59e0b" fill="#f59e0b" />
          </div>
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value">{avgRating}</span>
          <span className="kpi-badge" style={{ background: '#fef3c7', color: '#92400e' }}>
            ★ / 5.0
          </span>
        </div>
        <div className="kpi-footer-subtext">
          <span>Across all sampled product categories</span>
        </div>
      </div>
    </div>
  );
}
