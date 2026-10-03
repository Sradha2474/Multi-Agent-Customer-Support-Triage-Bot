import os
import re
import sys
import json
import time
import argparse
import pandas as pd
import requests

def clean_review_text(raw_text: str) -> str:
    """Removes HTML tags, decodes entities, and cleans whitespace."""
    if not isinstance(raw_text, str):
        return ""
    # Strip HTML tags
    cleaned = re.sub(r'<[^>]+>', ' ', raw_text)
    # Decode HTML entities
    cleaned = cleaned.replace('&quot;', '"').replace('&amp;', '&').replace('&#39;', "'").replace('&lt;', '<').replace('&gt;', '>')
    # Normalize whitespaces
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned

def analyze_sentiment_hf(text: str, hf_token: str, dry_run: bool = False):
    """Calls Hugging Face Inference API for SST-2 Sentiment."""
    if dry_run or not hf_token:
        # Realistic mock response
        is_neg = any(w in text.lower() for w in ['horrible', 'bad', 'disappoint', 'terrible', 'worst', 'rip', 'poor'])
        confidence = 0.55 if 'not exactly' in text.lower() or 'not sure' in text.lower() else 0.94
        label = "NEGATIVE" if is_neg else "POSITIVE"
        return label, confidence

    url = "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english"
    headers = {"Authorization": f"Bearer {hf_token}"}
    payload = {"inputs": text[:512]} # SST-2 max token limit safety
    
    try:
        res = requests.post(url, headers=headers, json=payload, timeout=15)
        res.raise_for_status()
        data = res.json()
        if isinstance(data, list) and len(data) > 0:
            scores = data[0] if isinstance(data[0], list) else data
            top = max(scores, key=lambda x: x.get('score', 0))
            return top.get('label', 'UNKNOWN'), float(top.get('score', 0.5))
    except Exception as e:
        print(f"  [HF Error]: {e}")
    return "UNKNOWN", 0.5

def extract_llm_insights_groq(text: str, groq_key: str, dry_run: bool = False):
    """Calls Groq API (Llama 3.1 8B) for structured topics, complaint, and summary."""
    if dry_run or not groq_key:
        # Mock insights for dry run
        words = [w for w in text.lower().split() if len(w) > 4][:3]
        return {
            "topics": words if words else ["product", "quality"],
            "complaint": "Product did not match buyer expectations" if "not" in text.lower() else None,
            "summary": text[:80] + "..."
        }

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {groq_key}",
        "Content-Type": "application/json"
    }
    system_prompt = (
        "You are an expert customer feedback analyst. "
        "Respond ONLY with a valid JSON object matching this schema:\n"
        "{\n"
        '  "topics": ["topic1", "topic2"],\n'
        '  "complaint": "one sentence complaint or null if positive",\n'
        '  "summary": "one concise sentence summarizing the review"\n'
        "}\n"
        "Keep topics to 2-4 lowercase keywords."
    )
    payload = {
        "model": "llama-3.1-8b-instant",
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Review: {text}"}
        ],
        "temperature": 0.2
    }
    
    try:
        res = requests.post(url, headers=headers, json=payload, timeout=15)
        res.raise_for_status()
        content = res.json()['choices'][0]['message']['content']
        return json.loads(content)
    except Exception as e:
        print(f"  [Groq Error]: {e}")
        return {
            "topics": ["parse_error"],
            "complaint": f"Extraction error: {e}",
            "summary": text[:100] + "..."
        }

def main():
    parser = argparse.ArgumentParser(description="Test Review Sentiment Pipeline")
    parser.add_argument("--file", default="reviews_test_10.csv", help="CSV file to process")
    parser.add_argument("--limit", type=int, default=3, help="Max reviews to process")
    parser.add_argument("--dry-run", action="store_true", help="Run without live API calls")
    args = parser.parse_args()

    hf_token = os.getenv("HF_API_KEY", "")
    groq_key = os.getenv("GROQ_API_KEY", "")

    print("=" * 60)
    print("CUSTOMER REVIEW SENTIMENT & INSIGHT PIPELINE (CLI RUNNER)")
    print(f"Mode: {'DRY RUN (Mock APIs)' if (args.dry_run or not (hf_token and groq_key)) else 'LIVE APIs'}")
    print(f"Input file: {args.file} (processing {args.limit} rows)")
    print("=" * 60)

    if not os.path.exists(args.file):
        print(f"Error: {args.file} not found. Run create_sample_dataset.py first.")
        sys.exit(1)

    df = pd.read_csv(args.file).head(args.limit)

    results = []
    for idx, row in df.iterrows():
        print(f"\n[Review #{row.get('id', idx + 1)}] Product: {row.get('product_name')} | Star Rating: {row.get('rating')}")
        raw_text = str(row.get('review_text', ''))
        cleaned_text = clean_review_text(raw_text)
        print(f"  Cleaned text: {cleaned_text[:100]}...")

        # 1. Hugging Face Sentiment
        label, conf = analyze_sentiment_hf(cleaned_text, hf_token, dry_run=args.dry_run or not hf_token)
        needs_review = conf < 0.60
        print(f"  Sentiment: {label} (Confidence: {conf:.4f}) {'[⚠️ FLAGGED LOW CONFIDENCE]' if needs_review else '[OK]'}")

        # 2. Groq LLM Insights
        insights = extract_llm_insights_groq(cleaned_text, groq_key, dry_run=args.dry_run or not groq_key)
        print(f"  Topics: {insights.get('topics')}")
        print(f"  Complaint: {insights.get('complaint')}")
        print(f"  Summary: {insights.get('summary')}")

        results.append({
            "id": row.get('id'),
            "product_name": row.get('product_name'),
            "rating": row.get('rating'),
            "sentiment_label": label,
            "sentiment_confidence": round(conf, 4),
            "needs_review": needs_review,
            "topics": insights.get('topics'),
            "complaint": insights.get('complaint'),
            "summary": insights.get('summary')
        })
        time.sleep(0.5)

    print("\n" + "=" * 60)
    print("PIPELINE TEST COMPLETED SUCCESSFULLY!")
    print(f"Processed {len(results)} reviews.")
    with open("test_results.json", "w") as f:
        json.dump(results, f, indent=2)
    print("Results saved to test_results.json")
    print("=" * 60)

if __name__ == "__main__":
    main()
