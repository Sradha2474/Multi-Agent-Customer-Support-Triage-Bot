import React from 'react';
import { Search, Filter, X, Download, RefreshCw, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function GlobalFilterBar({
  reviews,
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
  // Extract unique brands from reviews
  const brands = React.useMemo(() => {
    const set = new Set();
    reviews.forEach(r => {
      const p = (r.product_name || '').trim();
      const first = p.split(' ')[0].toUpperCase();
      if (['CROMPTON', 'BOAT', 'INALSA', 'SCOTCH-BRITE', 'MILTON', 'SPOTZERO', 'DDARSH', 'CEAT', 'USHA', 'JBL'].includes(first)) {
        set.add(first);
      } else {
        set.add('OTHER');
      }
    });
    return ['ALL', ...Array.from(set).sort()];
  }, [reviews]);

  const activeFiltersCount = 
    (searchQuery ? 1 : 0) + 
    (selectedBrand !== 'ALL' ? 1 : 0) + 
    (selectedRating !== 'ALL' ? 1 : 0) + 
    (selectedSentiment !== 'ALL' ? 1 : 0) + 
    (selectedAuditGate !== 'ALL' ? 1 : 0);

  return (
    <div className="filter-toolbar-container">
      <div className="filter-toolbar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div className="filter-icon-badge">
            <Filter size={15} color="#0284c7" />
          </div>
          <div>
            <h3 className="filter-title">Intelligence Telemetry &amp; Data Filter</h3>
            <p className="filter-subtitle">Drill down into reviews by brand, star rating, sentiment classification, and confidence gate.</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {activeFiltersCount > 0 && (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={onResetFilters}
              style={{ color: '#e11d48', borderColor: '#fecdd3', background: '#fff1f2' }}
            >
              <X size={13} />
              Reset Filters ({activeFiltersCount})
            </button>
          )}

          <button 
            className="btn btn-secondary btn-sm"
            onClick={onExportCsv}
            title="Export filtered dataset to CSV"
          >
            <Download size={13} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Control Inputs Row */}
      <div className="filter-controls-row">
        {/* Search Input */}
        <div className="search-input-wrap">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search products, complaints, keywords..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="search-clear-btn" 
              onClick={() => onSearchChange('')}
              title="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Brand Selector */}
        <div className="filter-select-group">
          <label className="filter-group-label">Brand:</label>
          <select 
            className="filter-select"
            value={selectedBrand}
            onChange={(e) => onBrandChange(e.target.value)}
          >
            {brands.map(b => (
              <option key={b} value={b}>
                {b === 'ALL' ? 'All Brands' : b}
              </option>
            ))}
          </select>
        </div>

        {/* Rating Pills */}
        <div className="filter-select-group">
          <label className="filter-group-label">Rating:</label>
          <div className="filter-pills-row">
            {['ALL', '5', '4', '3', '2', '1'].map(r => (
              <button
                key={r}
                type="button"
                className={`filter-pill ${selectedRating === r ? 'active' : ''}`}
                onClick={() => onRatingChange(r)}
              >
                {r === 'ALL' ? 'All' : `${r}★`}
              </button>
            ))}
          </div>
        </div>

        {/* Sentiment Filter */}
        <div className="filter-select-group">
          <label className="filter-group-label">Sentiment:</label>
          <div className="filter-pills-row">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'POSITIVE', label: 'Positive 🟢' },
              { id: 'NEGATIVE', label: 'Negative 🔴' }
            ].map(s => (
              <button
                key={s.id}
                type="button"
                className={`filter-pill ${selectedSentiment === s.id ? 'active' : ''}`}
                onClick={() => onSentimentChange(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Gate Filter */}
        <div className="filter-select-group">
          <label className="filter-group-label">Quality Gate:</label>
          <div className="filter-pills-row">
            {[
              { id: 'ALL', label: 'All Records' },
              { id: 'FLAGGED', label: '⚠️ Audit (< 0.60)' },
              { id: 'VERIFIED', label: 'High Conf' }
            ].map(g => (
              <button
                key={g.id}
                type="button"
                className={`filter-pill ${selectedAuditGate === g.id ? 'active' : ''}`}
                onClick={() => onAuditGateChange(g.id)}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
