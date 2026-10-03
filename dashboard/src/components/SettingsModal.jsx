import React, { useState } from 'react';
import { Settings, Key, Database, Radio, Check, X, ExternalLink } from 'lucide-react';

export default function SettingsModal({ config, onSaveConfig, onClose }) {
  const [hfToken, setHfToken] = useState(config.hfToken || '');
  const [groqKey, setGroqKey] = useState(config.groqKey || '');
  const [supabaseUri, setSupabaseUri] = useState(config.supabaseUri || '');
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState(config.n8nWebhookUrl || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveConfig({
      hfToken: hfToken.trim(),
      groqKey: groqKey.trim(),
      supabaseUri: supabaseUri.trim(),
      n8nWebhookUrl: n8nWebhookUrl.trim()
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <div className="panel-title">
            <Settings size={20} color="#6366f1" />
            <span>API &amp; Webhook Configurations</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Configure live credentials for Hugging Face, Groq LLM, Supabase Database, or connect to your local n8n Webhook node. If left blank, the dashboard runs in fast local simulation mode with 100% faithful pipeline telemetry.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Hugging Face Token */}
          <div className="form-group">
            <label className="form-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Key size={13} color="#f59e0b" /> Hugging Face Access Token (Optional)
              </span>
              <a 
                href="https://huggingface.co/settings/tokens" 
                target="_blank" 
                rel="noreferrer"
                style={{ color: '#818cf8', fontSize: '0.72rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
              >
                Get token <ExternalLink size={10} />
              </a>
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter HuggingFace token..."
              value={hfToken}
              onChange={(e) => setHfToken(e.target.value)}
            />
          </div>

          {/* Groq Key */}
          <div className="form-group">
            <label className="form-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Key size={13} color="#a855f7" /> Groq API Key (Optional)
              </span>
              <a 
                href="https://console.groq.com/keys" 
                target="_blank" 
                rel="noreferrer"
                style={{ color: '#818cf8', fontSize: '0.72rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
              >
                Get free key <ExternalLink size={10} />
              </a>
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter Groq API key..."
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
            />
          </div>

          {/* Supabase Pooler URI */}
          <div className="form-group">
            <label className="form-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Database size={13} color="#06b6d4" /> Supabase Connection Pooler URI
              </span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="postgresql://postgres.[project-ref]:[password]@aws-0-pooler.supabase.com:6543/postgres"
              value={supabaseUri}
              onChange={(e) => setSupabaseUri(e.target.value)}
            />
          </div>

          {/* n8n Webhook URL */}
          <div className="form-group">
            <label className="form-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Radio size={13} color="#10b981" /> n8n Ingestion Webhook URL
              </span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="http://localhost:5678/webhook/review-ingest"
              value={n8nWebhookUrl}
              onChange={(e) => setN8nWebhookUrl(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {savedSuccess ? (
                <>
                  <Check size={16} /> Saved!
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
