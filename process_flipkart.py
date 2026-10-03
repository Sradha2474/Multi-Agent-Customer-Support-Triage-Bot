import pandas as pd
import re
import datetime

# Target consumer brands to sample across
TARGET_BRANDS = ["CROMPTON", "HINDWARE", "BOAT", "MIVI", "JBL", "CANON", "SYMPHONY"]

def get_brand(name):
    first_word = str(name).strip().split()[0].upper()
    return first_word if first_word in TARGET_BRANDS else "OTHER"

def clean_prod_name(raw):
    raw = str(raw).encode('ascii', 'ignore').decode('ascii')
    raw = re.sub(r'[\?\~]+', ' ', raw)
    raw = re.sub(r'<[^>]*>', ' ', raw)
    raw = raw.split('??')[0].strip()
    return re.sub(r'\s+', ' ', raw)[:55]

def sanitize_text(s):
    if not isinstance(s, str):
        return ''
    s = s.encode('ascii', 'ignore').decode('ascii')
    s = re.sub(r'[\?\~]+', ' ', s)
    s = re.sub(r'<[^>]*>', ' ', s)
    s = s.replace('&quot;', '"').replace('&amp;', '&').replace('&#39;', "'")
    return re.sub(r'\s+', ' ', s).strip()

def build_flipkart_dataset():
    print("Sampling balanced multi-brand reviews from NLP_CASE_STUDY/Dataset.csv...")
    
    # We want 100 per rating (1 to 5) = 500 reviews total
    # Distributed across top brands
    target_per_rating = 100
    samples = {1: [], 2: [], 3: [], 4: [], 5: []}
    
    chunksize = 25000
    total_processed = 0

    for chunk in pd.read_csv('NLP_CASE_STUDY/Dataset.csv', encoding='latin1', on_bad_lines='skip', chunksize=chunksize):
        chunk['Rate'] = pd.to_numeric(chunk['Rate'], errors='coerce')
        chunk = chunk.dropna(subset=['Rate', 'Summary', 'Product_name'])
        chunk['Rate'] = chunk['Rate'].astype(int)
        chunk = chunk[(chunk['Rate'] >= 1) & (chunk['Rate'] <= 5)]
        
        chunk['brand'] = chunk['Product_name'].apply(get_brand)
        chunk['Product_name'] = chunk['Product_name'].apply(clean_prod_name)
        chunk['Summary'] = chunk['Summary'].apply(sanitize_text)
        chunk['Review'] = chunk['Review'].apply(sanitize_text)
        
        # Valid length
        chunk = chunk[chunk['Summary'].str.len() >= 25]
        
        # Only take target brands if available in chunk
        brand_chunk = chunk[chunk['brand'] != "OTHER"]
        if brand_chunk.empty:
            brand_chunk = chunk
            
        for rating in range(1, 6):
            needed = target_per_rating - sum(len(df) for df in samples[rating])
            if needed > 0:
                rc = brand_chunk[brand_chunk['Rate'] == rating]
                if not rc.empty:
                    # Take up to 25 per chunk per rating to ensure cross-brand mix
                    take_count = min(needed, 25)
                    samples[rating].append(rc.head(take_count))
                    
        total_collected = sum(sum(len(df) for df in s) for s in samples.values())
        total_processed += len(chunk)
        print(f"Processed {total_processed} rows, collected {total_collected} reviews...")
        if all(sum(len(df) for df in s) >= target_per_rating for s in samples.values()):
            break

    # Combine into single DataFrame
    all_dfs = []
    for rating in range(1, 6):
        combined = pd.concat(samples[rating]).head(target_per_rating)
        all_dfs.append(combined)
        
    df_sample = pd.concat(all_dfs).sample(frac=1, random_state=42).reset_index(drop=True)
    
    # Format matching pipeline schema
    df_sample['id'] = range(1, len(df_sample) + 1)
    df_sample = df_sample.rename(columns={
        'Product_name': 'product_name',
        'Rate': 'rating',
        'Review': 'review_summary',
        'Summary': 'review_text'
    })
    
    # Generate realistic timestamps across last 30 days
    base_time = datetime.datetime(2024, 9, 1, 9, 0, 0)
    df_sample['uploaded_at'] = [
        (base_time + datetime.timedelta(hours=i * 1.4)).strftime('%Y-%m-%d %H:%M:%S')
        for i in range(len(df_sample))
    ]
    
    cols = ['id', 'product_name', 'rating', 'review_summary', 'review_text', 'uploaded_at']
    df_sample = df_sample[cols]
    
    # Save 500-row sample
    sample_file = 'flipkart_reviews_sample_500.csv'
    df_sample.to_csv(sample_file, index=False, encoding='utf-8')
    print(f"\nSaved {len(df_sample)} rows to {sample_file}")
    
    # Save 10-row test dataset (2 of each rating)
    test_file = 'flipkart_reviews_test_10.csv'
    df_test = df_sample.groupby('rating').head(2).sample(frac=1, random_state=42).reset_index(drop=True)
    df_test['id'] = range(1, len(df_test) + 1)
    df_test.to_csv(test_file, index=False, encoding='utf-8')
    print(f"Saved {len(df_test)} test rows to {test_file}")

    print("\nRating distribution in 500-row file:")
    print(df_sample['rating'].value_counts().sort_index())
    
    print("\nProduct distribution in 500-row file:")
    print(df_sample['product_name'].value_counts().head(8))

if __name__ == '__main__':
    build_flipkart_dataset()
