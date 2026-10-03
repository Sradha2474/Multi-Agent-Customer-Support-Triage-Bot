-- ========================================================
-- Automated Customer Review Sentiment & Insight Pipeline
-- PostgreSQL / Supabase Schema & Analytical Views
-- ========================================================

-- 1. Create raw_reviews table
CREATE TABLE IF NOT EXISTS raw_reviews (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_summary TEXT,
    review_text TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create processed_reviews table
CREATE TABLE IF NOT EXISTS processed_reviews (
    id SERIAL PRIMARY KEY,
    raw_review_id INTEGER REFERENCES raw_reviews(id) ON DELETE CASCADE,
    product_name VARCHAR(100),
    sentiment_label VARCHAR(20) NOT NULL,            -- 'POSITIVE' or 'NEGATIVE'
    sentiment_confidence NUMERIC(5, 4) NOT NULL,      -- e.g. 0.9845
    topics JSONB DEFAULT '[]'::jsonb,                -- Array of keyword strings: ["flavor", "packaging"]
    complaint_summary TEXT,                          -- One sentence or NULL
    review_summary TEXT,                             -- Generated 1-sentence summary
    needs_review BOOLEAN DEFAULT FALSE,              -- True if confidence < 0.6 or parse warning
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance and dashboard queries
CREATE INDEX IF NOT EXISTS idx_processed_sentiment ON processed_reviews(sentiment_label);
CREATE INDEX IF NOT EXISTS idx_processed_needs_review ON processed_reviews(needs_review);
CREATE INDEX IF NOT EXISTS idx_processed_product ON processed_reviews(product_name);
CREATE INDEX IF NOT EXISTS idx_processed_created_at ON processed_reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_processed_topics ON processed_reviews USING GIN (topics);

-- ========================================================
-- Analytical Views for Metabase Dashboard & Slack Digest
-- ========================================================

-- View 1: Overall Sentiment Breakdown
CREATE OR REPLACE VIEW sentiment_summary AS
SELECT 
    sentiment_label,
    COUNT(*) AS total_reviews,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS percentage,
    ROUND(AVG(sentiment_confidence)::numeric, 3) AS avg_confidence,
    SUM(CASE WHEN needs_review THEN 1 ELSE 0 END) AS flagged_for_review
FROM processed_reviews
GROUP BY sentiment_label;

-- View 2: Top Topics / Keyword Extraction (Unnested from JSONB)
CREATE OR REPLACE VIEW top_topics AS
SELECT 
    LOWER(TRIM(topic.value::text, '" ')) AS topic_name,
    COUNT(*) AS mention_count,
    SUM(CASE WHEN sentiment_label = 'NEGATIVE' THEN 1 ELSE 0 END) AS negative_mentions,
    SUM(CASE WHEN sentiment_label = 'POSITIVE' THEN 1 ELSE 0 END) AS positive_mentions
FROM processed_reviews,
LATERAL jsonb_array_elements(topics) AS topic
WHERE topic.value::text IS NOT NULL AND topic.value::text <> '""'
GROUP BY LOWER(TRIM(topic.value::text, '" '))
ORDER BY mention_count DESC
LIMIT 20;

-- View 3: Daily Review Volume and Sentiment Trend
CREATE OR REPLACE VIEW daily_trend AS
SELECT 
    DATE(created_at) AS review_date,
    COUNT(*) AS total_reviews,
    SUM(CASE WHEN sentiment_label = 'POSITIVE' THEN 1 ELSE 0 END) AS positive_count,
    SUM(CASE WHEN sentiment_label = 'NEGATIVE' THEN 1 ELSE 0 END) AS negative_count,
    ROUND(AVG(sentiment_confidence)::numeric, 3) AS avg_confidence,
    SUM(CASE WHEN needs_review THEN 1 ELSE 0 END) AS low_confidence_count
FROM processed_reviews
GROUP BY DATE(created_at)
ORDER BY review_date DESC;

-- View 4: Products with Most Complaints (Critical for Business Signals)
CREATE OR REPLACE VIEW products_by_sentiment AS
SELECT 
    product_name,
    COUNT(*) AS total_reviews,
    SUM(CASE WHEN sentiment_label = 'NEGATIVE' THEN 1 ELSE 0 END) AS negative_count,
    SUM(CASE WHEN sentiment_label = 'POSITIVE' THEN 1 ELSE 0 END) AS positive_count,
    ROUND(
        (SUM(CASE WHEN sentiment_label = 'NEGATIVE' THEN 1 ELSE 0 END) * 100.0 / COUNT(*))::numeric, 1
    ) AS complaint_rate_pct
FROM processed_reviews
WHERE product_name IS NOT NULL
GROUP BY product_name
HAVING COUNT(*) >= 2
ORDER BY negative_count DESC, total_reviews DESC;
