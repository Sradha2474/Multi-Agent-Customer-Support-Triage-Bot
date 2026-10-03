import React, { useState } from 'react';
import { 
  Grid2X2, 
  List, 
  ArrowDownWideNarrow, 
  Filter, 
  Copy, 
  Check, 
  ShieldAlert, 
  ShieldCheck, 
  Star, 
  AlertTriangle, 
  ExternalLink, 
  Download,
  Search,
  X,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { generatePostgresSQL } from '../../utils/pipelineEngine';

export default function DemostackCardView({
  reviews = [],
  onToggleAuditFlag,
  searchQuery,
  onSearchChange,
  selectedBrand,
  onBrandChange,
  selectedRating,
  onRatingChange,
  selectedSentiment,
  onSentimentChange,
  selectedAuditGate,
  onAuditGateChange,
  onResetFilters,
  onExportCsv
}) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [sortMode, setSortMode] = useState('recent'); // 'recent' | 'rating-desc' | 'rating-asc' | 'confidence'
  const [copiedId, setCopiedId] = useState(null);
  const [activeCapsule, setActiveCapsule] = useState('ALL');
  const [expandedListId, setExpandedListId] = useState(null);

  // Capsule filter logic
  const capsuleFiltered = reviews.filter(r => {
    if (activeCapsule === 'FLAGGED' && !r.needs_review) return false;
    if (activeCapsule === 'VERIFIED' && r.needs_review) return false;
    if (activeCapsule === 'COMPLAINTS' && !r.complaint) return false;
    if (activeCapsule === 'POSITIVE' && r.sentiment_label !== 'POSITIVE') return false;
    if (activeCapsule === 'NEGATIVE' && r.sentiment_label !== 'NEGATIVE') return false;
    return true;
  });

  // Sorting
  const sortedReviews = [...capsuleFiltered].sort((a, b) => {
    if (sortMode === 'rating-desc') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
    if (sortMode === 'rating-asc') return (Number(a.rating) || 0) - (Number(b.rating) || 0);
    if (sortMode === 'confidence') return (Number(b.sentiment_confidence) || 0) - (Number(a.sentiment_confidence) || 0);
    return (b.id || 0) - (a.id || 0);
  });

  const handleCopySql = (review) => {
    const sql = generatePostgresSQL(review);
    navigator.clipboard.writeText(sql);
    setCopiedId(review.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getInitials = (name) => {
    if (!name) return 'PR';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="demostack-cardview-root">
      {/* Top Header Row with Demostack Capsule Tabs */}
      <div className="demostack-cardview-header">
        <div className="demostack-cardview-title-group">
          <h2 className="demostack-cardview-title">Customer Reviews Collection</h2>
          <span className="demostack-cardview-badge">{sortedReviews.length} in scope</span>
        </div>

        {/* Demostack Pill Capsule Tabs */}
        <div className="demostack-capsule-tabs">
          {[
            { id: 'ALL', label: `All Reviews (${reviews.length})` },
            { id: 'FLAGGED', label: `⚠️ Flagged (< 0.60)` },
            { id: 'COMPLAINTS', label: `🚨 With Complaints` },
            { id: 'POSITIVE', label: `🟢 Positive` },
            { id: 'NEGATIVE', label: `🔴 Negative` }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`demostack-capsule-tab ${activeCapsule === tab.id ? 'active' : ''}`}
              onClick={() => setActiveCapsule(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Demostack Interactive Toolbar */}
      <div className="demostack-toolbar">
        <div className="demostack-toolbar-filters">
          {/* Brand Filter */}
          <div className="demostack-select-wrap">
            <span className="demostack-select-label">Brand:</span>
            <select
              className="demostack-toolbar-select"
              value={selectedBrand}
              onChange={(e) => onBrandChange(e.target.value)}
            >
              <option value="ALL">All Brands (Amazon &amp; Flipkart)</option>
              <option value="CROMPTON">Crompton</option>
              <option value="BOAT">boAt Audio</option>
              <option value="INALSA">Inalsa</option>
              <option value="SCOTCH-BRITE">Scotch-Brite</option>
              <option value="MILTON">Milton</option>
              <option value="SPOTZERO">Spotzero</option>
              <option value="DDARSH">Ddarsh</option>
              <option value="CEAT">Ceat</option>
              <option value="OTHER">Other Brands</option>
            </select>
          </div>

          {/* Star Rating Filter */}
          <div className="demostack-select-wrap">
            <span className="demostack-select-label">Rating:</span>
            <select
              className="demostack-toolbar-select"
              value={selectedRating}
              onChange={(e) => onRatingChange(e.target.value)}
            >
              <option value="ALL">All Ratings (1 - 5 ★)</option>
              <option value="5">5 Stars Only</option>
              <option value="4">4 Stars Only</option>
              <option value="3">3 Stars Only</option>
              <option value="2">2 Stars Only</option>
              <option value="1">1 Star Only</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="demostack-select-wrap">
            <ArrowDownWideNarrow size={14} className="demostack-sort-icon" />
            <select
              className="demostack-toolbar-select"
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
            >
              <option value="recent">Sort by Recent</option>
              <option value="rating-desc">Rating: High to Low</option>
              <option value="rating-asc">Rating: Low to High</option>
              <option value="confidence">Confidence Score</option>
            </select>
          </div>
        </div>

        {/* View Mode & Export Actions */}
        <div className="demostack-toolbar-actions">
          {/* CSV Export */}
          <button
            type="button"
            className="demostack-action-pill-btn"
            onClick={onExportCsv}
            title="Export filtered dataset to CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          {/* Grid / List View Toggle */}
          <div className="demostack-view-toggle-group">
            <button
              type="button"
              className={`demostack-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Demostack Grid Cards View"
              aria-label="Grid view"
            >
              <Grid2X2 size={16} />
            </button>
            <button
              type="button"
              className={`demostack-view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Dense Audit Table View"
              aria-label="List view"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid or List Display */}
      {sortedReviews.length === 0 ? (
        <div className="demostack-empty-state">
          <div className="demostack-empty-icon-wrap">
            <Filter size={24} color="#64748b" />
          </div>
          <p className="demostack-empty-title">No reviews match current filters</p>
          <p className="demostack-empty-subtitle">Try adjusting your brand, rating, or search parameters.</p>
          <button type="button" className="demostack-reset-filters-btn" onClick={onResetFilters}>
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* ================= DEMOSTACK GRID CARDS VIEW ================= */
        <div className="demostack-grid-container">
          {sortedReviews.map((review) => {
            const isNegative = review.sentiment_label === 'NEGATIVE';
            const isFlagged = review.needs_review;

            return (
              <article key={review.id} className="demostack-card">
                {/* Card Top Banner / Visual Header */}
                <div className="demostack-card-top-bar">
                  <div className="demostack-card-brand-tag">
                    <span className="demostack-card-avatar">{getInitials(review.product_name)}</span>
                    <span className="demostack-card-product-title" title={review.product_name}>
                      {review.product_name || "Unspecified Product"}
                    </span>
                  </div>

                  <div className="demostack-card-meta-badges">
                    <span className="demostack-star-badge">
                      ★ {review.rating}/5
                    </span>
                  </div>
                </div>

                {/* Card Core Content */}
                <div className="demostack-card-body">
                  {/* Sentiment & Confidence Row */}
                  <div className="demostack-card-sentiment-row">
                    <span className={`demostack-sentiment-chip ${review.sentiment_label?.toLowerCase()}`}>
                      {isNegative ? '🔴 NEGATIVE' : '🟢 POSITIVE'}
                    </span>
                    <span className="demostack-confidence-chip">
                      {review.sentiment_confidence ? (review.sentiment_confidence * 100).toFixed(0) : '94'}% conf
                    </span>
                    {isFlagged ? (
                      <span className="demostack-qa-tag flagged" title="Confidence < 0.60. Flagged for review.">
                        ⚠️ AUDIT
                      </span>
                    ) : (
                      <span className="demostack-qa-tag passed" title="Passed automated quality gate">
                        ✓ VERIFIED
                      </span>
                    )}
                  </div>

                  {/* Root Cause Complaint Box (if any) */}
                  {review.complaint && (
                    <div className="demostack-card-complaint">
                      <span className="demostack-complaint-label">LLM Root Cause:</span>
                      <p className="demostack-complaint-body">&ldquo;{review.complaint}&rdquo;</p>
                    </div>
                  )}

                  {/* Review Text / Summary */}
                  <p className="demostack-card-text">
                    {review.summary || review.cleaned_text || review.raw_text}
                  </p>

                  {/* Topics Chips */}
                  {review.topics && review.topics.length > 0 && (
                    <div className="demostack-card-topics">
                      {review.topics.slice(0, 3).map((topic, i) => (
                        <span key={i} className="demostack-card-topic-tag">#{topic}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="demostack-card-footer">
                  <button
                    type="button"
                    className={`demostack-card-verify-btn ${isFlagged ? 'flagged' : 'verified'}`}
                    onClick={() => onToggleAuditFlag(review.id)}
                    title={isFlagged ? "Click to verify review" : "Click to flag for QA audit"}
                  >
                    {isFlagged ? (
                      <>
                        <ShieldAlert size={13} />
                        <span>Sign-off / Verify</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={13} />
                        <span>Verified</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="demostack-card-sql-btn"
                    onClick={() => handleCopySql(review)}
                    title="Copy PostgreSQL INSERT SQL statement"
                  >
                    {copiedId === review.id ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                    <span>{copiedId === review.id ? "Copied SQL" : "SQL"}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* ================= DEMOSTACK LIST ROW VIEW ================= */
        <div className="demostack-list-container">
          <div className="demostack-list-table-wrapper">
            <table className="demostack-table">
              <thead>
                <tr>
                  <th>Product &amp; Rating</th>
                  <th>Sentiment &amp; Score</th>
                  <th>Quality Gate</th>
                  <th>LLM Complaint &amp; Topics</th>
                  <th>Summary</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedReviews.map((review) => {
                  const isNegative = review.sentiment_label === 'NEGATIVE';
                  const isFlagged = review.needs_review;
                  const isExpanded = expandedListId === review.id;

                  return (
                    <React.Fragment key={review.id}>
                      <tr 
                        className={`demostack-tr ${isFlagged ? 'row-flagged' : ''}`}
                        onClick={() => setExpandedListId(isExpanded ? null : review.id)}
                      >
                        <td style={{ maxWidth: '240px' }}>
                          <div className="demostack-table-product-row">
                            <span className="demostack-star-small">★ {review.rating}</span>
                            <span className="demostack-table-product-name" title={review.product_name}>
                              {review.product_name}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className={`demostack-sentiment-chip small ${review.sentiment_label?.toLowerCase()}`}>
                              {isNegative ? '🔴 NEG' : '🟢 POS'}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              {(review.sentiment_confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </td>

                        <td>
                          {isFlagged ? (
                            <span className="demostack-qa-tag flagged small">⚠️ AUDIT</span>
                          ) : (
                            <span className="demostack-qa-tag passed small">✓ PASSED</span>
                          )}
                        </td>

                        <td style={{ maxWidth: '280px' }}>
                          <div className="demostack-table-complaint-cell">
                            {review.complaint ? (
                              <span className="demostack-complaint-highlight">&ldquo;{review.complaint}&rdquo;</span>
                            ) : (
                              <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.78rem' }}>None</span>
                            )}
                            {review.topics && (
                              <div style={{ display: 'flex', gap: '4px', marginTop: '3px' }}>
                                {review.topics.slice(0, 2).map((t, i) => (
                                  <span key={i} className="demostack-topic-mini">#{t}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>

                        <td style={{ maxWidth: '260px' }}>
                          <p className="demostack-table-summary">
                            {review.summary || review.cleaned_text}
                          </p>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              type="button"
                              className="demostack-table-action-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleAuditFlag(review.id);
                              }}
                              title={isFlagged ? "Verify review" : "Flag review"}
                            >
                              {isFlagged ? <ShieldCheck size={14} color="#059669" /> : <ShieldAlert size={14} color="#f59e0b" />}
                            </button>
                            <button
                              type="button"
                              className="demostack-table-action-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopySql(review);
                              }}
                              title="Copy SQL INSERT statement"
                            >
                              {copiedId === review.id ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Details Drawer */}
                      {isExpanded && (
                        <tr className="demostack-expanded-row">
                          <td colSpan={6}>
                            <div className="demostack-expanded-box">
                              <div className="demostack-expanded-col">
                                <span className="demostack-expanded-title">Raw Review Text</span>
                                <p className="demostack-expanded-text">{review.raw_text || review.cleaned_text}</p>
                              </div>
                              <div className="demostack-expanded-col">
                                <span className="demostack-expanded-title">Generated PostgreSQL SQL</span>
                                <pre className="demostack-expanded-sql">{generatePostgresSQL(review)}</pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
