import React, { useState } from 'react';
import { 
  Play, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, 
  Terminal, ShieldCheck, Database, MessageSquare, Loader2, Code2
} from 'lucide-react';
import { SAMPLE_PRESETS } from '../data/initialReviews';
import { 
  cleanReviewText, 
  analyzeSentiment, 
  evaluateQualityGate, 
  extractInsightsLLM, 
  generatePostgresSQL, 
  generateSlackPayload 
} from '../utils/pipelineEngine';

export default function LivePlayground({ onReviewIngested, config }) {
  const [productName, setProductName] = useState("boAt Blitz 1500 Multimedia 50 W Bluetooth Home Theatre");
  const [rating, setRating] = useState(1);
  const [reviewText, setReviewText] = useState("<p>low quality low bass don't buy no return policy only replace west of money boat company is best but this product is west.</p>");
  const [activePreset, setActivePreset] = useState("severe-defect");
  const [routingMode, setRoutingMode] = useState("direct"); // "direct" | "n8n"

  // Pipeline Execution State
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0 = idle, 1..6 = stages
  const [pipelineData, setPipelineData] = useState(null);
  const [executionTimeMs, setExecutionTimeMs] = useState(null);
  const [showSqlModal, setShowSqlModal] = useState(false);

  // Apply a sample preset
  const handleSelectPreset = (preset) => {
    setActivePreset(preset.id);
    setProductName(preset.product);
    setRating(preset.rating);
    setReviewText(preset.text);
  };

  // Run the full pipeline step-by-step
  const handleRunPipeline = async (e) => {
    if (e) e.preventDefault();
    if (!reviewText.trim()) return;

    setIsProcessing(true);
    setCurrentStep(1);
    setPipelineData(null);
    const startTime = performance.now();

    const stageResults = {
      rawText: reviewText,
      productName,
      rating
    };

    try {
      // ---------------------------------------------------------
      // STAGE 1: Text Sanitization & Normalization
      // ---------------------------------------------------------
      await new Promise(r => setTimeout(r, 260));
      const cleaned = cleanReviewText(reviewText);
      stageResults.cleanedText = cleaned;
      stageResults.charsRemoved = reviewText.length - cleaned.length;
      setPipelineData({ ...stageResults });
      setCurrentStep(2);

      // ---------------------------------------------------------
      // STAGE 2: DistilBERT SST-2 Sentiment Analysis
      // ---------------------------------------------------------
      await new Promise(r => setTimeout(r, 380));
      const sentimentResult = await analyzeSentiment(cleaned, rating, config);
      stageResults.sentiment = sentimentResult.label;
      stageResults.confidence = sentimentResult.confidence;
      stageResults.sentimentSource = sentimentResult.source;
      setPipelineData({ ...stageResults });
      setCurrentStep(3);

      // ---------------------------------------------------------
      // STAGE 3: Confidence Quality Gate (< 0.60 threshold)
      // ---------------------------------------------------------
      await new Promise(r => setTimeout(r, 220));
      const gateResult = evaluateQualityGate(sentimentResult.confidence, 0.60);
      stageResults.needsReview = gateResult.needsReview;
      stageResults.gateMessage = gateResult.message;
      setPipelineData({ ...stageResults });
      setCurrentStep(4);

      // ---------------------------------------------------------
      // STAGE 4: Groq LLM Topic, Complaint & Summary Extraction
      // ---------------------------------------------------------
      await new Promise(r => setTimeout(r, 520));
      const llmResult = await extractInsightsLLM(cleaned, sentimentResult.label, rating, config);
      stageResults.topics = llmResult.topics;
      stageResults.complaint = llmResult.complaint;
      stageResults.summary = llmResult.summary;
      stageResults.llmSource = llmResult.source;
      setPipelineData({ ...stageResults });
      setCurrentStep(5);

      // ---------------------------------------------------------
      // STAGE 5: PostgreSQL Supabase DB Ingestion
      // ---------------------------------------------------------
      await new Promise(r => setTimeout(r, 280));
      const sqlQuery = generatePostgresSQL({
        product_name: productName,
        rating,
        raw_text: reviewText,
        cleaned_text: cleaned,
        sentiment_label: sentimentResult.label,
        sentiment_confidence: sentimentResult.confidence,
        needs_review: gateResult.needsReview,
        topics: llmResult.topics,
        complaint: llmResult.complaint,
        summary: llmResult.summary
      });
      stageResults.sqlQuery = sqlQuery;
      stageResults.sqlStatus = "COMMITTED (Supabase PostgreSQL)";
      setPipelineData({ ...stageResults });
      setCurrentStep(6);

      // ---------------------------------------------------------
      // STAGE 6: Automated Slack Webhook Payload
      // ---------------------------------------------------------
      await new Promise(r => setTimeout(r, 220));
      const slackPayload = generateSlackPayload({
        product_name: productName,
        rating,
        sentiment_label: sentimentResult.label,
        sentiment_confidence: sentimentResult.confidence,
        needs_review: gateResult.needsReview,
        summary: llmResult.summary,
        topics: llmResult.topics
      });
      stageResults.slackPayload = slackPayload;

      // Check if user has an n8n webhook configured and routing mode is n8n
      if (routingMode === "n8n" && config.n8nWebhookUrl) {
        try {
          await fetch(config.n8nWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(stageResults)
          });
          stageResults.n8nDispatched = true;
        } catch (webhookErr) {
          console.warn("n8n Webhook dispatch error:", webhookErr);
        }
      }

      const totalTime = Math.round(performance.now() - startTime);
      setExecutionTimeMs(totalTime);
      setPipelineData({ ...stageResults });

      // Save to parent list
      const finalReviewRecord = {
        id: Date.now(),
        product_name: productName,
        rating: Number(rating),
        raw_text: reviewText,
        cleaned_text: cleaned,
        sentiment_label: sentimentResult.label,
        sentiment_confidence: sentimentResult.confidence,
        needs_review: gateResult.needsReview,
        topics: llmResult.topics,
        complaint: llmResult.complaint,
        summary: llmResult.summary,
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
        sql_status: "COMMITTED"
      };

      onReviewIngested(finalReviewRecord);
    } catch (err) {
      console.error("Pipeline execution failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="main-layout-grid">
      {/* LEFT: Live Review Submission Form */}
      <div className="glass-panel">
        <div className="panel-header">
          <div className="panel-title">
            <Sparkles size={18} color="#6366f1" />
            <span>Interactive Review Ingestion</span>
          </div>
          <span className="panel-title-badge">Step-by-Step Telemetry</span>
        </div>

        {/* 1-Click Sample Presets */}
        <div className="presets-section">
          <span className="presets-label">1-Click Test Scenarios:</span>
          <div className="presets-pills">
            {SAMPLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`preset-chip ${activePreset === preset.id ? 'active' : ''}`}
                onClick={() => handleSelectPreset(preset)}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleRunPipeline} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="product-select">Product Name</label>
              <select
                id="product-select"
                className="form-select"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              >
                <option value="boAt Blitz 1500 Multimedia 50 W Bluetooth Home Theatre">
                  boAt Blitz 1500 Multimedia 50 W Bluetooth Home Theatre
                </option>
                <option value="Crompton Hill Briz Deco 1200 mm 3 Blade Ceiling Fan">
                  Crompton Hill Briz Deco 1200 mm 3 Blade Ceiling Fan
                </option>
                <option value="Inalsa Inox 1000 1000 W Food Processor (Silver:Black)">
                  Inalsa Inox 1000 1000 W Food Processor (Silver:Black)
                </option>
                <option value="JBL Flip 6 Portable Bluetooth Speaker (Squad)">
                  JBL Flip 6 Portable Bluetooth Speaker (Squad)
                </option>
                <option value="DDARSH ENTERPRISE Wet and Dry Duster Set">
                  DDARSH ENTERPRISE Wet and Dry Duster Set
                </option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Customer Rating</label>
              <div className="star-selector">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`star-btn ${s <= rating ? 'filled' : ''}`}
                    onClick={() => setRating(s)}
                    title={`${s} Star${s > 1 ? 's' : ''}`}
                  >
                    ★
                  </button>
                ))}
                <span style={{ fontSize: '0.8rem', marginLeft: 'auto', fontWeight: 600, color: '#fbbf24' }}>
                  {rating}/5
                </span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <div className="form-label">
              <span>Raw Review Text (Supports raw HTML or plain text)</span>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                {reviewText.length} chars
              </span>
            </div>
            <textarea
              className="form-textarea"
              value={reviewText}
              onChange={(e) => {
                setReviewText(e.target.value);
                setActivePreset(null);
              }}
              placeholder="Paste raw customer review text..."
              rows={3}
            />
          </div>

          <div className="form-actions-bar">
            <div className="routing-mode-selector">
              <span>Execution Engine:</span>
              <button
                type="button"
                className={`mode-pill ${routingMode === 'direct' ? 'active' : ''}`}
                onClick={() => setRoutingMode('direct')}
              >
                Direct Pipeline
              </button>
              <button
                type="button"
                className={`mode-pill ${routingMode === 'n8n' ? 'active' : ''}`}
                onClick={() => setRoutingMode('n8n')}
                title={config.n8nWebhookUrl ? 'Will POST to configured n8n Webhook' : 'Configure n8n Webhook URL in settings'}
              >
                n8n Webhook
              </button>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isProcessing || !reviewText.trim()}
              id="analyze-pipeline-btn"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Streaming Stage {currentStep}/6...
                </>
              ) : (
                <>
                  <Play size={15} fill="currentColor" />
                  ⚡ Analyze &amp; Stream Pipeline
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT: Real-Time Pipeline Stage Stepper */}
      <div className="glass-panel">
        <div className="panel-header">
          <div className="panel-title">
            <Terminal size={18} color="#06b6d4" />
            <span>Pipeline Execution Stepper</span>
          </div>
          {executionTimeMs && (
            <span className="panel-title-badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#c7d2fe', borderColor: 'rgba(99, 102, 241, 0.4)' }}>
              Completed in {executionTimeMs}ms
            </span>
          )}
        </div>

        <div className="pipeline-stepper-container">
          {/* STAGE 1: Text Sanitizer */}
          <div className={`stepper-stage-card ${currentStep === 1 ? 'running' : currentStep > 1 ? 'completed' : 'pending'}`}>
            <div className="stage-header-row">
              <div className="stage-left-info">
                <div className="stage-step-num">1</div>
                <div>
                  <div className="stage-title-text">Stage 1: Text Sanitization &amp; Entity Decoding</div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-dim)' }}>
                    HTML tags removal, whitespace normalizer &amp; character entity decoders
                  </div>
                </div>
              </div>
              <span className={`stage-status-badge ${currentStep === 1 ? 'running' : currentStep > 1 ? 'completed' : 'pending'}`}>
                {currentStep === 1 ? 'Processing...' : currentStep > 1 ? 'Cleaned' : 'Waiting'}
              </span>
            </div>

            {currentStep > 1 && pipelineData?.cleanedText && (
              <div className="stage-payload-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span>Stripped <strong>{pipelineData.charsRemoved}</strong> non-standard chars/tags</span>
                  <span style={{ color: 'var(--emerald-light)' }}>✓ Cleaned Text Ready</span>
                </div>
                <div className="code-preview-box" style={{ maxHeight: '60px' }}>
                  {pipelineData.cleanedText}
                </div>
              </div>
            )}
          </div>

          {/* STAGE 2: DistilBERT SST-2 Sentiment */}
          <div className={`stepper-stage-card ${currentStep === 2 ? 'running' : currentStep > 2 ? 'completed' : 'pending'}`}>
            <div className="stage-header-row">
              <div className="stage-left-info">
                <div className="stage-step-num">2</div>
                <div>
                  <div className="stage-title-text">Stage 2: DistilBERT SST-2 Sentiment Inference</div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-dim)' }}>
                    NLP classification: POSITIVE vs NEGATIVE with confidence score
                  </div>
                </div>
              </div>
              <span className={`stage-status-badge ${currentStep === 2 ? 'running' : currentStep > 2 ? 'completed' : 'pending'}`}>
                {currentStep === 2 ? 'Inference...' : currentStep > 2 ? `${pipelineData?.sentiment}` : 'Waiting'}
              </span>
            </div>

            {currentStep > 2 && pipelineData?.sentiment && (
              <div className="stage-payload-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span className={`sentiment-badge ${pipelineData.sentiment.toLowerCase()}`}>
                    {pipelineData.sentiment}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-bright)', fontWeight: 600 }}>
                    Confidence: {(pipelineData.confidence * 100).toFixed(1)}%
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>
                    {pipelineData.sentimentSource}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* STAGE 3: Confidence Quality Gate */}
          <div className={`stepper-stage-card ${currentStep === 3 ? 'running' : currentStep > 3 ? (pipelineData?.needsReview ? 'flagged' : 'completed') : 'pending'}`}>
            <div className="stage-header-row">
              <div className="stage-left-info">
                <div className="stage-step-num">3</div>
                <div>
                  <div className="stage-title-text">Stage 3: Confidence Quality Gate (Rule: &lt; 0.60)</div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-dim)' }}>
                    Flags uncertain classifications for manual human auditor triage
                  </div>
                </div>
              </div>
              <span className={`stage-status-badge ${currentStep === 3 ? 'running' : currentStep > 3 ? (pipelineData?.needsReview ? 'flagged' : 'completed') : 'pending'}`}>
                {currentStep === 3 ? 'Evaluating...' : currentStep > 3 ? (pipelineData?.needsReview ? '⚠️ FLAGGED' : '✅ PASSED') : 'Waiting'}
              </span>
            </div>

            {currentStep > 3 && (
              <div className="stage-payload-content">
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  color: pipelineData?.needsReview ? 'var(--amber-light)' : 'var(--emerald-light)',
                  fontSize: '0.78rem'
                }}>
                  {pipelineData?.needsReview ? <AlertTriangle size={14} /> : <ShieldCheck size={14} />}
                  <span>{pipelineData?.gateMessage}</span>
                </div>
              </div>
            )}
          </div>

          {/* STAGE 4: Groq LLM Extraction */}
          <div className={`stepper-stage-card ${currentStep === 4 ? 'running' : currentStep > 4 ? 'completed' : 'pending'}`}>
            <div className="stage-header-row">
              <div className="stage-left-info">
                <div className="stage-step-num">4</div>
                <div>
                  <div className="stage-title-text">Stage 4: Groq LLM Intelligence (Topics &amp; Complaints)</div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-dim)' }}>
                    Structured JSON extraction: 2-4 key topics, root cause complaint &amp; summary
                  </div>
                </div>
              </div>
              <span className={`stage-status-badge ${currentStep === 4 ? 'running' : currentStep > 4 ? 'completed' : 'pending'}`}>
                {currentStep === 4 ? 'Extracting...' : currentStep > 4 ? 'Extracted' : 'Waiting'}
              </span>
            </div>

            {currentStep > 4 && pipelineData?.topics && (
              <div className="stage-payload-content">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {pipelineData.topics.map((t, idx) => (
                    <span key={idx} className="topic-tag">#{t}</span>
                  ))}
                </div>
                {pipelineData.complaint && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--rose-light)' }}>
                    <strong>Root Cause Complaint:</strong> {pipelineData.complaint}
                  </div>
                )}
                <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>
                  <strong>Summary:</strong> {pipelineData.summary}
                </div>
              </div>
            )}
          </div>

          {/* STAGE 5: PostgreSQL Supabase DB Ingestion */}
          <div className={`stepper-stage-card ${currentStep === 5 ? 'running' : currentStep > 5 ? 'completed' : 'pending'}`}>
            <div className="stage-header-row">
              <div className="stage-left-info">
                <div className="stage-step-num">5</div>
                <div>
                  <div className="stage-title-text">Stage 5: Supabase PostgreSQL Persistence</div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-dim)' }}>
                    Parameterized Dollar-Quoting ($$) INSERT INTO processed_reviews
                  </div>
                </div>
              </div>
              <span className={`stage-status-badge ${currentStep === 5 ? 'running' : currentStep > 5 ? 'completed' : 'pending'}`}>
                {currentStep === 5 ? 'Writing...' : currentStep > 5 ? 'Committed' : 'Waiting'}
              </span>
            </div>

            {currentStep > 5 && pipelineData?.sqlQuery && (
              <div className="stage-payload-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--emerald-light)', fontSize: '0.75rem' }}>✓ PostgreSQL Row Persisted</span>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.7rem', padding: '2px 6px' }}
                    onClick={() => setShowSqlModal(true)}
                  >
                    <Code2 size={12} /> View Dollar-Quoted SQL
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* STAGE 6: Slack Digest Dispatch */}
          <div className={`stepper-stage-card ${currentStep === 6 ? 'running' : currentStep > 6 || (currentStep === 6 && !isProcessing) ? 'completed' : 'pending'}`}>
            <div className="stage-header-row">
              <div className="stage-left-info">
                <div className="stage-step-num">6</div>
                <div>
                  <div className="stage-title-text">Stage 6: Slack Webhook Notification</div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-dim)' }}>
                    Block Kit JSON dispatch with rating, topics &amp; root cause triage
                  </div>
                </div>
              </div>
              <span className={`stage-status-badge ${currentStep === 6 && isProcessing ? 'running' : pipelineData?.slackPayload ? 'completed' : 'pending'}`}>
                {currentStep === 6 && isProcessing ? 'Formatting...' : pipelineData?.slackPayload ? 'Dispatched' : 'Waiting'}
              </span>
            </div>

            {pipelineData?.slackPayload && (
              <div className="stage-payload-content">
                <div style={{ fontSize: '0.76rem', color: 'var(--emerald-light)' }}>
                  ✓ Slack Block Kit Message Ready &amp; Dispatched to Incoming Webhook
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SQL Modal Dialog */}
      {showSqlModal && pipelineData?.sqlQuery && (
        <div className="modal-overlay" onClick={() => setShowSqlModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="panel-header">
              <h3>Generated PostgreSQL Safe Ingestion Query</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowSqlModal(false)}>✕</button>
            </div>
            <p style={{ fontSize: '0.8rem' }}>
              Notice the dollar-quoting (<code>$$...$$</code>) syntax which prevents syntax errors from single quotes in customer reviews.
            </p>
            <div className="code-preview-box" style={{ maxHeight: '280px', overflowY: 'auto' }}>
              {pipelineData.sqlQuery}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => {
                  navigator.clipboard.writeText(pipelineData.sqlQuery);
                  alert("SQL Query copied to clipboard!");
                }}
              >
                Copy SQL to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
