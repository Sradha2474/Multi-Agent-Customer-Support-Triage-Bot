import fs from 'fs';

const rawList = JSON.parse(fs.readFileSync('../flipkart_reviews_50.json', 'utf8'));

function cleanText(raw) {
  if (!raw) return '';
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

const enriched = rawList.map((r, idx) => {
  const rating = Number(r.rating) || 3;
  const cleaned = cleanText(r.review_text);
  const lower = cleaned.toLowerCase();
  
  // Ambiguous phrasing detection
  const isAmbiguous = [
    'not exactly', 'average', 'not sure', 'works okay', 'just okay', 
    'fair', 'moderate', 'could be way better', '50-50', 'decent product'
  ].some(p => lower.includes(p) || (r.review_summary && r.review_summary.toLowerCase().includes(p)));
  
  let sentiment = 'POSITIVE';
  let confidence = 0.95;
  if (rating <= 2) {
    sentiment = 'NEGATIVE';
    confidence = isAmbiguous ? 0.582 : (0.91 + (idx % 8) * 0.01);
  } else if (rating >= 4) {
    sentiment = 'POSITIVE';
    confidence = isAmbiguous ? 0.591 : (0.93 + (idx % 6) * 0.01);
  } else {
    // 3 stars
    const negWords = ['poor', 'issue', 'bad', 'problem', 'defect', 'noise', 'missing', 'small', 'cable', 'disappoint', 'slow', 'waste', 'creek', 'horrible'];
    const hasNeg = negWords.some(w => lower.includes(w));
    sentiment = hasNeg ? 'NEGATIVE' : 'POSITIVE';
    confidence = isAmbiguous ? 0.574 : 0.685;
  }
  
  const needsReview = confidence < 0.60;
  
  // Extract domain-specific topics
  let topics = [];
  const prod = r.product_name.toLowerCase();
  if (prod.includes('fan')) topics.push('ceiling fan', 'speed', 'air throw');
  else if (prod.includes('cooler')) topics.push('cooling', 'water tank', 'noise level');
  else if (prod.includes('processor')) topics.push('motor power', 'plastic build', 'jar blade');
  else if (prod.includes('theatre') || prod.includes('boat')) topics.push('bass quality', 'bluetooth', 'audio clarity');
  else if (prod.includes('mop') || prod.includes('broom') || prod.includes('cloth') || prod.includes('duster')) topics.push('cleaning', 'durability', 'material quality');
  else if (prod.includes('glove')) topics.push('grip', 'tear resistance', 'kitchen use');
  else if (prod.includes('bat')) topics.push('wood balance', 'cricket bat', 'handle stroke');
  else topics.push('product quality', 'performance');
  
  if (lower.includes('delivery') || lower.includes('ekart') || lower.includes('courier')) topics.push('delivery speed');
  if (lower.includes('pack') || lower.includes('box')) topics.push('packaging');
  if (lower.includes('cable') || lower.includes('wire')) topics.push('cord length');
  if (lower.includes('bracket') || lower.includes('part') || lower.includes('screw')) topics.push('mounting parts');
  if (lower.includes('smell') || lower.includes('creek') || lower.includes('sound')) topics.push('fan noise');
  
  topics = [...new Set(topics)].slice(0, 4);
  
  let complaint = null;
  if (sentiment === 'NEGATIVE' || rating <= 3) {
    if (r.review_summary && r.review_summary.length > 5 && !r.review_summary.includes('Fair') && !r.review_summary.includes('Nice')) {
      complaint = r.review_summary;
    } else {
      complaint = cleaned.length > 80 ? cleaned.slice(0, 80) + '...' : cleaned;
    }
  }
  
  const summary = cleaned.length > 95 ? cleaned.slice(0, 95) + '...' : cleaned;
  
  return {
    id: 100 + r.id,
    product_name: r.product_name,
    rating,
    raw_text: r.review_text,
    cleaned_text: cleaned,
    sentiment_label: sentiment,
    sentiment_confidence: Number(confidence.toFixed(3)),
    needs_review: needsReview,
    topics,
    complaint,
    summary,
    created_at: r.uploaded_at || '2024-09-03 12:00:00',
    sql_status: 'COMMITTED'
  };
});

const fileContent = `// Pre-seeded realistic dataset from Flipkart balanced reviews
// Automatically generated and structured for PostgreSQL / Supabase processed_reviews schema

export const INITIAL_REVIEWS = ${JSON.stringify(enriched, null, 2)};

export const SAMPLE_PRESETS = [
  {
    id: "severe-defect",
    name: "🔴 Severe Defect (boAt 1★)",
    product: "boAt Blitz 1500 Multimedia 50 W Bluetooth Home Theatre",
    rating: 1,
    text: "<p>Defective subwoofer! Loud buzzing humming noise continuously. Bluetooth keeps disconnecting every 2 minutes. Requested replacement immediately.</p>"
  },
  {
    id: "perfect-praise",
    name: "🟢 5-Star Praise (Crompton 5★)",
    product: "Crompton Hill Briz Deco 1200 mm 3 Blade Ceiling Fan",
    rating: 5,
    text: "Excellent product! High air throw, perfectly silent copper motor, and elegant champagne finish. Ekart delivered within 18 hours with safe bubble wrap."
  },
  {
    id: "ambiguous-audit",
    name: "🟡 Ambiguous Quality Gate (3★)",
    product: "Inalsa Inox 1000 1000 W Food Processor (Silver:Black)",
    rating: 3,
    text: "Not sure about this machine. Build is average, dough mixer works fine but chopper blade feels somewhat loose. Might keep it or might replace."
  },
  {
    id: "missing-part",
    name: "🟠 Missing Parts (Fan 2★)",
    product: "Crompton Hill Briz Deco 1200 mm 3 Blade Ceiling Fan",
    rating: 2,
    text: "Fan blade arrived with deep scratches on paint and canopy cover was missing from the box. Disappointed with warehouse quality check."
  }
];
`;

fs.writeFileSync('src/data/initialReviews.js', fileContent, 'utf8');
console.log('Successfully generated initialReviews.js with', enriched.length, 'reviews');
