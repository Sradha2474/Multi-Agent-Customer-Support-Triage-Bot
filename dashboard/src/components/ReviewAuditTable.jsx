import React, { useState } from 'react';
import { 
  FileText, Search, ChevronDown, ChevronUp, AlertTriangle, 
  CheckCircle, ShieldCheck, Database, Star, MessageSquare,
  Copy, Check, Sparkles, Filter, ChevronLeft, ChevronRight
} from 'lucide-react';
import { generatePostgresSQL } from '../utils/pipelineEngine';

export default function ReviewAuditTable({ 
  reviews, 
  onToggleAuditFlag,
  filterTab = 'ALL',
  onFilterTabChange
}) {
  const [internalTab, setInternalTab] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);
  const [copiedSqlId, setCopiedSqlId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const currentTab = onFilterTabChange ? filterTab : internalTab;
  const setTab = onFilterTabChange || setInternalTab;

  // Filter Logic
  const filtered = reviews.filter(r => {
    if (currentTab === 'POSITIVE' && r.sentiment_label !== 'POSITIVE') return false;
    if (currentTab === 'NEGATIVE' && r.sentiment_label !== 'NEGATIVE') return false;
    if (currentTab === 'FLAGGED' && !r.needs_review) return false;
    return true;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const paginatedReviews = filtered.slice(startIndex, startIndex + itemsPerPage);

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleCopySql = (e, review) => {
    e.stopPropagation();
    const sql = generatePostgresSQL(review);
    navigator.clipboard.writeText(sql);
    setCopiedSqlId(review.id);
    setTimeout(() => setCopiedSqlId(null), 2000);
  };

  return (
    <div className="glass-panel" id="audit-stream">
      <div className="panel-header">
        <div className="panel-title">
          <FileText size={18} color="#0284c7" />
          <span>Processed Reviews Audit Stream</span>
        </div>
        <span className="panel-title-badge">
          {filtered.length} Records In Scope
        </span>
      </div>

      {/* Tabs and Quick Filter Row */}
      <div className="audit-table-toolbar">
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All Reviews' },
            { id: 'POSITIVE', label: 'Positive 🟢' },
            { id: 'NEGATIVE', label: 'Negative 🔴' },
            { id: 'FLAGGED', label: '⚠️ Flagged for Audit (< 0.60)' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`mode-pill ${currentTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                setTab(tab.id);
                setCurrentPage(1);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Pagination Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', color: '#475569' }}>
          <span>Page <strong>{safePage}</strong> of <strong>{totalPages}</strong></span>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              style={{ padding: '4px 8px' }}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              style={{ padding: '4px 8px' }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="audit-table-container">
        <table className="audit-table">
          <thead>
            <tr>
              <th style={{ width: '45px' }}>#</th>
              <th>Product Name</th>
              <th style={{ width: '85px' }}>Rating</th>
              <th style={{ width: '115px' }}>Sentiment</th>
              <th style={{ width: '95px' }}>Confidence</th>
              <th>Extracted Topics &amp; Summary</th>
              <th style={{ width: '130px' }}>Quality Gate</th>
              <th style={{ width: '45px' }}></th>
            </tr>
          </thead>
          <tbody>
            {paginatedReviews.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                  No reviews match the selected filter criteria.
                </td>
              </tr>
            ) : (
              paginatedReviews.map((r, idx) => {
                const isExpanded = expandedId === r.id;
                const isCopied = copiedSqlId === r.id;

                return (
                  <React.Fragment key={r.id}>
                    <tr 
                      className={`audit-row ${isExpanded ? 'expanded' : ''}`}
                      onClick={() => toggleExpand(r.id)}
                    >
                      <td style={{ color: '#64748b', fontSize: '0.78rem' }}>
                        #{r.id}
                      </td>

                      <td>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>
                          {r.product_name}
                        </span>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                          {r.created_at || '2024-09-03'}
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: '#b45309', fontWeight: 700 }}>
                          <span>{r.rating}</span>
                          <Star size={12} fill="#f59e0b" color="#f59e0b" />
                        </div>
                      </td>

                      <td>
                        <span className={`sentiment-badge ${r.sentiment_label.toLowerCase()}`}>
                          {r.sentiment_label === 'POSITIVE' ? '🟢 POSITIVE' : '🔴 NEGATIVE'}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontWeight: 600, fontSize: '0.82rem', color: r.sentiment_confidence < 0.60 ? '#d97706' : '#059669' }}>
                          {(r.sentiment_confidence * 100).toFixed(1)}%
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span style={{ fontSize: '0.82rem', color: '#334155' }}>
                            {r.summary || r.cleaned_text?.slice(0, 85) + '...'}
                          </span>
                          {r.topics && r.topics.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                              {r.topics.slice(0, 3).map(t => (
                                <span key={t} className="table-topic-pill">
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      <td>
                        {r.needs_review ? (
                          <span className="quality-gate-badge flagged">
                            <AlertTriangle size={11} />
                            <span>Audit Gate</span>
                          </span>
                        ) : (
                          <span className="quality-gate-badge verified">
                            <ShieldCheck size={11} />
                            <span>Passed</span>
                          </span>
                        )}
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="expand-btn"
                          aria-label="Toggle details"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Drawer Row */}
                    {isExpanded && (
                      <tr className="expanded-detail-row">
                        <td colSpan="8">
                          <div className="audit-detail-drawer">
                            {/* Raw vs Sanitized Comparison */}
                            <div className="drawer-two-col">
                              <div className="drawer-panel">
                                <span className="drawer-label">Raw Review Input (Pre-Sanitization):</span>
                                <div className="drawer-text-box raw">
                                  {r.raw_text || r.cleaned_text}
                                </div>
                              </div>
                              <div className="drawer-panel">
                                <span className="drawer-label">Cleaned &amp; Normalized Text (PostgreSQL raw_reviews):</span>
                                <div className="drawer-text-box clean">
                                  {r.cleaned_text}
                                </div>
                              </div>
                            </div>

                            {/* Llama 3.1 LLM Extractions */}
                            <div className="drawer-two-col" style={{ marginTop: '0.75rem' }}>
                              <div className="drawer-panel">
                                <span className="drawer-label">Extracted Root-Cause Complaint (Groq Llama 3.1):</span>
                                <div className="drawer-text-box" style={{ color: r.complaint ? '#be123c' : '#059669', fontWeight: 500 }}>
                                  {r.complaint ? `⚠️ ${r.complaint}` : '✅ No severe negative complaint detected.'}
                                </div>
                              </div>

                              <div className="drawer-panel">
                                <span className="drawer-label">Executive One-Sentence Summary:</span>
                                <div className="drawer-text-box">
                                  {r.summary || 'Summary generated via LLM prompt.'}
                                </div>
                              </div>
                            </div>

                            {/* Actions and Generated SQL */}
                            <div className="drawer-actions-bar">
                              <div style={{ display: 'flex', gap: '0.6rem' }}>
                                <button
                                  type="button"
                                  className={`btn ${r.needs_review ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleAuditFlag(r.id);
                                  }}
                                >
                                  <ShieldCheck size={14} />
                                  <span>{r.needs_review ? 'Approve & Clear Flag' : 'Flag for Audit'}</span>
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={(e) => handleCopySql(e, r)}
                                >
                                  {isCopied ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                                  <span>{isCopied ? 'SQL Copied!' : 'Copy Supabase SQL'}</span>
                                </button>
                              </div>

                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                SQL Schema: <code>public.processed_reviews</code> &bull; Foreign Key: <code>raw_review_id #{r.id}</code>
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Pagination Bar */}
      {filtered.length > itemsPerPage && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', fontSize: '0.82rem', color: '#475569' }}>
          <span>Showing <strong>{startIndex + 1}</strong> to <strong>{Math.min(startIndex + itemsPerPage, filtered.length)}</strong> of <strong>{filtered.length}</strong> reviews</span>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
