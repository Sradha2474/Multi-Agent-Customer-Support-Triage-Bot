import React, { useState } from 'react';
import { 
  BarChart3, 
  Tag, 
  Package, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  AlertCircle, 
  TrendingUp, 
  Database, 
  MessageSquare, 
  Sliders, 
  Cpu, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Layers,
  Copy,
  Check
} from 'lucide-react';

export default function AnalyticsView({ reviews, onSelectTopicFilter, onSelectProductFilter }) {
  const [activeTab, setActiveTab] = useState('sentiment'); // 'sentiment' | 'complaints' | 'products' | 'sql_views'
  const [sqlViewTab, setSqlViewTab] = useState('sentiment_summary');
  const [copiedSql, setCopiedSql] = useState(false);

  const total = reviews.length;
  const positive = reviews.filter(r => r.sentiment_label === 'POSITIVE').length;
  const negative = reviews.filter(r => r.sentiment_label === 'NEGATIVE').length;
  const flagged = reviews.filter(r => r.needs_review).length;

  const posPct = total > 0 ? ((positive / total) * 100).toFixed(1) : 0;
  const negPct = total > 0 ? ((negative / total) * 100).toFixed(1) : 0;
  const flagPct = total > 0 ? ((flagged / total) * 100).toFixed(1) : 0;

  // Star Rating vs Sentiment Correlation Breakdown
  const ratingBreakdown = [1, 2, 3, 4, 5].map(star => {
    const starReviews = reviews.filter(r => Number(r.rating) === star);
    const starTotal = starReviews.length;
    const pos = starReviews.filter(r => r.sentiment_label === 'POSITIVE').length;
    const neg = starReviews.filter(r => r.sentiment_label === 'NEGATIVE').length;
    const flg = starReviews.filter(r => r.needs_review).length;
    return {
      star,
      total: starTotal,
      pos,
      neg,
      flg,
      posRate: starTotal > 0 ? Math.round((pos / starTotal) * 100) : 0
    };
  });

  // Confidence distribution
  const highConfCount = reviews.filter(r => r.sentiment_confidence >= 0.85).length;
  const medConfCount = reviews.filter(r => r.sentiment_confidence >= 0.60 && r.sentiment_confidence < 0.85).length;
  const lowConfCount = reviews.filter(r => r.sentiment_confidence < 0.60).length;

  // Aggregate topics frequency
  const topicCounts = {};
  reviews.forEach(r => {
    if (Array.isArray(r.topics)) {
      r.topics.forEach(t => {
        const clean = t.toLowerCase().trim();
        topicCounts[clean] = (topicCounts[clean] || 0) + 1;
      });
    }
  });

  const sortedTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const maxTopicCount = sortedTopics.length > 0 ? sortedTopics[0][1] : 1;

  // Extract Top Recurring Complaints
  const complaintsList = reviews
    .filter(r => r.complaint && r.complaint.trim().length > 0)
    .map(r => ({
      product: r.product_name,
      rating: r.rating,
      complaint: r.complaint,
      summary: r.summary,
      confidence: r.sentiment_confidence
    }))
    .slice(0, 6);

  // Aggregate product performance
  const productStats = {};
  reviews.forEach(r => {
    const pName = r.product_name || "Unknown Product";
    if (!productStats[pName]) {
      productStats[pName] = {
        name: pName,
        total: 0,
        ratingsSum: 0,
        posCount: 0,
        negCount: 0,
        complaintsCount: 0,
        sampleComplaint: null
      };
    }
    productStats[pName].total += 1;
    productStats[pName].ratingsSum += Number(r.rating) || 0;
    if (r.sentiment_label === 'POSITIVE') productStats[pName].posCount += 1;
    if (r.sentiment_label === 'NEGATIVE') productStats[pName].negCount += 1;
    if (r.complaint) {
      productStats[pName].complaintsCount += 1;
      if (!productStats[pName].sampleComplaint) {
        productStats[pName].sampleComplaint = r.complaint;
      }
    }
  });

  const productList = Object.values(productStats).sort((a, b) => b.total - a.total);

  // SQL Views code snippets
  const sqlViews = {
    sentiment_summary: {
      title: "1. sentiment_summary View",
      description: "Aggregates overall volume, positive/negative sentiment shares, and audit gate flag ratios.",
      sql: `CREATE OR REPLACE VIEW sentiment_summary AS
SELECT
  COUNT(*) AS total_reviews,
  COUNT(*) FILTER (WHERE sentiment_label = 'POSITIVE') AS positive_count,
  COUNT(*) FILTER (WHERE sentiment_label = 'NEGATIVE') AS negative_count,
  ROUND(100.0 * COUNT(*) FILTER (WHERE sentiment_label = 'POSITIVE') / NULLIF(COUNT(*), 0), 2) AS positive_pct,
  ROUND(100.0 * COUNT(*) FILTER (WHERE sentiment_label = 'NEGATIVE') / NULLIF(COUNT(*), 0), 2) AS negative_pct,
  COUNT(*) FILTER (WHERE needs_review = true) AS flagged_for_audit
FROM processed_reviews;`
    },
    top_topics: {
      title: "2. top_topics View",
      description: "Unnests extracted JSON topics and calculates negative complaint mention volume per topic.",
      sql: `CREATE OR REPLACE VIEW top_topics AS
SELECT
  t.topic,
  COUNT(*) AS mention_count,
  COUNT(*) FILTER (WHERE p.sentiment_label = 'NEGATIVE') AS negative_mentions
FROM processed_reviews p,
  jsonb_array_elements_text(p.topics) AS t(topic)
GROUP BY t.topic
ORDER BY mention_count DESC
LIMIT 15;`
    },
    daily_trend: {
      title: "3. daily_trend View",
      description: "Rolls up daily ingestion volume and sentiment breakdown for BI dashboards and temporal graphs.",
      sql: `CREATE OR REPLACE VIEW daily_trend AS
SELECT
  DATE(created_at) AS review_date,
  COUNT(*) AS total_daily,
  COUNT(*) FILTER (WHERE sentiment_label = 'POSITIVE') AS positive_daily,
  COUNT(*) FILTER (WHERE sentiment_label = 'NEGATIVE') AS negative_daily
FROM processed_reviews
GROUP BY DATE(created_at)
ORDER BY review_date ASC;`
    },
    products_by_sentiment: {
      title: "4. products_by_sentiment View",
      description: "Ranks products by total volume, average customer star rating, and negative complaint count.",
      sql: `CREATE OR REPLACE VIEW products_by_sentiment AS
SELECT
  product_name,
  COUNT(*) AS total_reviews,
  ROUND(AVG(rating), 2) AS avg_rating,
  COUNT(*) FILTER (WHERE sentiment_label = 'POSITIVE') AS positive_count,
  COUNT(*) FILTER (WHERE sentiment_label = 'NEGATIVE') AS negative_count
FROM processed_reviews
GROUP BY product_name
HAVING COUNT(*) >= 2
ORDER BY total_reviews DESC, avg_rating ASC;`
    }
  };

  const copySqlToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="analytics-hub-container" id="analytics-hub">
      {/* Hub Header with Navigation Tabs */}
      <div className="analytics-hub-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="analytics-hub-icon-wrap">
              <BarChart3 size={18} color="#0284c7" />
            </div>
            <h2 className="analytics-hub-title">Executive Analytics &amp; Intelligence Hub</h2>
          </div>
          <p className="analytics-hub-subtitle">
            Live analytical views synchronized with PostgreSQL &amp; Supabase schemas. In-depth sentiment diagnostics, Llama 3.1 recurring complaints, and product leaderboards.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="analytics-tab-bar">
          {[
            { id: 'sentiment', label: 'Sentiment & Diagnostics', icon: <Sliders size={14} /> },
            { id: 'complaints', label: 'Recurring Complaints & Topics', icon: <Tag size={14} /> },
            { id: 'products', label: 'Product Leaderboard', icon: <Package size={14} /> },
            { id: 'sql_views', label: 'PostgreSQL Views & Slack Digest', icon: <Database size={14} /> }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`analytics-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Sentiment & Model Diagnostics */}
      {activeTab === 'sentiment' && (
        <div className="analytics-tab-content">
          <div className="analytics-two-col-grid">
            {/* Sentiment Ratio & Confidence Distribution */}
            <div className="glass-panel">
              <div className="panel-header">
                <div className="panel-title">
                  <Sliders size={17} color="#0284c7" />
                  <span>Sentiment Distribution &amp; Quality Ratio</span>
                </div>
                <span className="panel-title-badge">Model: DistilBERT SST-2</span>
              </div>

              {/* Multi-segment Ratio Bar */}
              <div className="bar-progress-container" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.4rem' }}>
                  <span>Overall Sentiment Breakdown</span>
                  <span>{total} Total Records</span>
                </div>

                <div className="sentiment-ratio-bar">
                  <div 
                    className="ratio-fill positive" 
                    style={{ width: `${posPct}%` }}
                    title={`Positive: ${posPct}%`}
                  />
                  <div 
                    className="ratio-fill negative" 
                    style={{ width: `${negPct}%` }}
                    title={`Negative: ${negPct}%`}
                  />
                </div>

                <div className="ratio-legend">
                  <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#10b981' }}></span>
                    <span>Positive: <strong>{posPct}%</strong> ({positive})</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#f43f5e' }}></span>
                    <span>Negative: <strong>{negPct}%</strong> ({negative})</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#f59e0b' }}></span>
                    <span>Flagged for Audit: <strong>{flagPct}%</strong> ({flagged})</span>
                  </div>
                </div>
              </div>

              {/* Confidence Brackets */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.2rem' }}>
                <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                  DistilBERT Confidence Bracket Distribution
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {/* High Confidence */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.2rem' }}>
                      <span>High Confidence (≥ 85%) &bull; Direct Auto-Commit</span>
                      <span>{highConfCount} ({total > 0 ? Math.round((highConfCount / total) * 100) : 0}%)</span>
                    </div>
                    <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: `${total > 0 ? (highConfCount / total) * 100 : 0}%`, height: '100%', background: '#0284c7', borderRadius: '999px' }} />
                    </div>
                  </div>

                  {/* Moderate Confidence */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.2rem' }}>
                      <span>Moderate Confidence (60% - 84%) &bull; Passed Quality Gate</span>
                      <span>{medConfCount} ({total > 0 ? Math.round((medConfCount / total) * 100) : 0}%)</span>
                    </div>
                    <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: `${total > 0 ? (medConfCount / total) * 100 : 0}%`, height: '100%', background: '#60a5fa', borderRadius: '999px' }} />
                    </div>
                  </div>

                  {/* Flagged Confidence */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, color: '#b45309', marginBottom: '0.2rem' }}>
                      <span>Low Confidence (&lt; 60%) &bull; ⚠️ Flagged for Human Audit</span>
                      <span>{lowConfCount} ({total > 0 ? Math.round((lowConfCount / total) * 100) : 0}%)</span>
                    </div>
                    <div style={{ height: '7px', background: '#fef3c7', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: `${total > 0 ? (lowConfCount / total) * 100 : 0}%`, height: '100%', background: '#f59e0b', borderRadius: '999px' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Star Rating vs Sentiment Correlation Breakdown */}
            <div className="glass-panel">
              <div className="panel-header">
                <div className="panel-title">
                  <Star size={17} color="#f59e0b" fill="#f59e0b" />
                  <span>Star Rating vs. NLP Sentiment Matrix</span>
                </div>
                <span className="panel-title-badge">Sarcasm &amp; Discrepancy Detection</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {ratingBreakdown.map((item) => (
                  <div key={item.star} className="rating-matrix-row">
                    <div className="rating-matrix-star-col">
                      <span className="rating-matrix-star-val">{item.star}</span>
                      <Star size={14} color="#f59e0b" fill="#f59e0b" />
                      <span className="rating-matrix-star-count">({item.total})</span>
                    </div>

                    <div className="rating-matrix-bar-col">
                      <div className="rating-matrix-bar">
                        <div 
                          style={{ width: `${item.posRate}%`, background: '#10b981', height: '100%' }} 
                          title={`Positive: ${item.pos} reviews`}
                        />
                        <div 
                          style={{ width: `${100 - item.posRate}%`, background: '#f43f5e', height: '100%' }} 
                          title={`Negative: ${item.neg} reviews`}
                        />
                      </div>
                    </div>

                    <div className="rating-matrix-stat-col">
                      <span style={{ color: '#059669', fontWeight: 600 }}>{item.pos} pos</span>
                      <span style={{ color: '#cbd5e1' }}>/</span>
                      <span style={{ color: '#e11d48', fontWeight: 600 }}>{item.neg} neg</span>
                      {item.flg > 0 && (
                        <span style={{ fontSize: '0.72rem', color: '#d97706', background: '#fffbeb', padding: '1px 5px', borderRadius: '4px' }}>
                          {item.flg} ⚠️
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#475569' }}>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>💡 Discrepancy Insight:</span>
                {" "}Reviews where 3-star customers expressed negative complaints about motor noise or missing parts are correctly caught and tagged as NEGATIVE sentiment rather than defaulting to positive.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Recurring Complaints & Extracted Topics */}
      {activeTab === 'complaints' && (
        <div className="analytics-tab-content">
          <div className="analytics-two-col-grid">
            {/* Topics Frequency List with Click to Filter */}
            <div className="glass-panel">
              <div className="panel-header">
                <div className="panel-title">
                  <Tag size={17} color="#7c3aed" />
                  <span>Top Customer Drivers &amp; Extracted Topics</span>
                </div>
                <span className="panel-title-badge">Extracted via Groq Llama 3.1</span>
              </div>

              <p style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '1rem' }}>
                Click any topic pill below to automatically filter the audit stream and view matching customer reviews:
              </p>

              <div className="topic-frequency-list">
                {sortedTopics.map(([topic, count]) => {
                  const pct = Math.round((count / maxTopicCount) * 100);
                  return (
                    <div 
                      key={topic} 
                      className="topic-freq-item clickable"
                      onClick={() => onSelectTopicFilter && onSelectTopicFilter(topic)}
                      title={`Click to filter reviews containing #${topic}`}
                    >
                      <span className="topic-label">#{topic}</span>
                      <div className="topic-bar-bg">
                        <div className="topic-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="topic-count-badge">
                        {count}x
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Critical Complaints Leaderboard */}
            <div className="glass-panel">
              <div className="panel-header">
                <div className="panel-title">
                  <AlertCircle size={17} color="#e11d48" />
                  <span>Critical Root-Cause Complaints Feed</span>
                </div>
                <span className="panel-title-badge" style={{ background: '#fff1f2', color: '#e11d48', borderColor: '#fecdd3' }}>
                  Llama 3.1 Structured JSON
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {complaintsList.map((item, idx) => (
                  <div key={idx} className="complaint-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
                        {item.product}
                      </span>
                      <span className="severity-badge high">
                        {item.rating}★ Review
                      </span>
                    </div>

                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#be123c', marginBottom: '0.3rem' }}>
                      &ldquo;{item.complaint}&rdquo;
                    </p>

                    <p style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic' }}>
                      Summary: {item.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Product Performance Leaderboard */}
      {activeTab === 'products' && (
        <div className="analytics-tab-content">
          <div className="glass-panel">
            <div className="panel-header">
              <div className="panel-title">
                <Package size={18} color="#0284c7" />
                <span>Product Sentiment &amp; Issue Leaderboard</span>
              </div>
              <span className="panel-title-badge">SQL View: products_by_sentiment</span>
            </div>

            <div className="product-table-wrap">
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>Product Model</th>
                    <th style={{ width: '90px' }}>Total Reviews</th>
                    <th style={{ width: '100px' }}>Avg Rating</th>
                    <th style={{ width: '170px' }}>Sentiment Ratio</th>
                    <th>Primary Identified Issue / Complaint</th>
                    <th style={{ width: '90px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {productList.map((prod, idx) => {
                    const avg = (prod.ratingsSum / prod.total).toFixed(1);
                    const posRate = Math.round((prod.posCount / prod.total) * 100);
                    const negRate = 100 - posRate;

                    return (
                      <tr key={idx}>
                        <td>
                          <span style={{ fontWeight: 600, color: '#0f172a', display: 'block' }}>
                            {prod.name}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{prod.total}</span>
                        </td>
                        <td>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#b45309', fontWeight: 700 }}>
                            <Star size={13} fill="#f59e0b" color="#f59e0b" />
                            <span>{avg}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <div style={{ height: '7px', display: 'flex', borderRadius: '999px', overflow: 'hidden' }}>
                              <div style={{ width: `${posRate}%`, background: '#10b981' }} />
                              <div style={{ width: `${negRate}%`, background: '#f43f5e' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b' }}>
                              <span style={{ color: '#059669' }}>{posRate}% pos</span>
                              <span style={{ color: '#e11d48' }}>{negRate}% neg</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          {prod.sampleComplaint ? (
                            <span style={{ fontSize: '0.78rem', color: '#be123c', fontWeight: 500 }}>
                              {prod.sampleComplaint}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: '#059669' }}>
                              High satisfaction &bull; No critical defects
                            </span>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => onSelectProductFilter && onSelectProductFilter(prod.name)}
                            style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                          >
                            Filter
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: PostgreSQL Views & Slack Digest */}
      {activeTab === 'sql_views' && (
        <div className="analytics-tab-content">
          <div className="analytics-two-col-grid">
            {/* SQL Views Explorer */}
            <div className="glass-panel">
              <div className="panel-header">
                <div className="panel-title">
                  <Database size={18} color="#0284c7" />
                  <span>PostgreSQL &amp; Supabase Analytical Views</span>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => copySqlToClipboard(sqlViews[sqlViewTab].sql)}
                >
                  {copiedSql ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                  <span>{copiedSql ? 'Copied!' : 'Copy View SQL'}</span>
                </button>
              </div>

              {/* View Sub-Tabs */}
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {Object.keys(sqlViews).map(key => (
                  <button
                    key={key}
                    type="button"
                    className={`mode-pill ${sqlViewTab === key ? 'active' : ''}`}
                    onClick={() => setSqlViewTab(key)}
                  >
                    {key}
                  </button>
                ))}
              </div>

              <p style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.85rem' }}>
                {sqlViews[sqlViewTab].description}
              </p>

              <pre className="sql-code-block">
                <code>{sqlViews[sqlViewTab].sql}</code>
              </pre>
            </div>

            {/* Automated Slack Digest Live Preview */}
            <div className="glass-panel">
              <div className="panel-header">
                <div className="panel-title">
                  <MessageSquare size={18} color="#10b981" />
                  <span>Automated Slack Digest Preview</span>
                </div>
                <span className="panel-title-badge" style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}>
                  n8n Cron (0 9 * * *)
                </span>
              </div>

              <div className="slack-digest-preview-card">
                <div className="slack-channel-bar">
                  <span style={{ color: '#059669', fontWeight: 700 }}>#</span>
                  <span style={{ fontWeight: 600 }}>customer-review-insights</span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: 'auto' }}>APP &bull; 9:00 AM</span>
                </div>

                <div className="slack-message-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>📊</span>
                    <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>
                      Daily Customer Review &amp; Sentiment Digest
                    </strong>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: '#334155', marginBottom: '0.6rem' }}>
                    <strong>Sentiment Overview:</strong><br />
                    &bull; Total Ingested: <strong>{total} reviews</strong><br />
                    &bull; Positive: <strong>{posPct}%</strong> 🟢 | Negative: <strong>{negPct}%</strong> 🔴<br />
                    &bull; Flagged for Audit (&lt; 0.60 Conf): <strong>{flagged} reviews</strong> ⚠️
                  </p>

                  <p style={{ fontSize: '0.82rem', color: '#334155', marginBottom: '0.6rem' }}>
                    <strong>Top Recurring Complaints:</strong><br />
                    {sortedTopics.slice(0, 3).map(([t, c]) => (
                      <span key={t} style={{ display: 'block' }}>
                        &bull; <em>#{t}</em>: {c} negative customer mentions
                      </span>
                    ))}
                  </p>

                  <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#64748b' }}>
                    Generated automatically by n8n scheduled workflow querying Supabase Postgres views.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
