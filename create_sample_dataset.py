import pandas as pd
import datetime

def sample_reviews():
    chunksize = 20000
    target_per_rating = 100  # 100 * 5 = 500 total rows
    samples = {1: [], 2: [], 3: [], 4: [], 5: []}
    
    print("Reading and sampling from Reviews.csv...")
    for chunk in pd.read_csv('Reviews.csv', chunksize=chunksize, usecols=['Id', 'ProductId', 'Score', 'Time', 'Summary', 'Text']):
        # Clean basic nulls and very short text
        chunk = chunk.dropna(subset=['Text', 'Score'])
        chunk['Text'] = chunk['Text'].astype(str)
        chunk['Summary'] = chunk['Summary'].fillna('').astype(str)
        chunk = chunk[chunk['Text'].str.len() >= 25]  # at least reasonable length
        
        for rating in range(1, 6):
            needed = target_per_rating - len(samples[rating])
            if needed > 0:
                rating_chunk = chunk[chunk['Score'] == rating]
                if not rating_chunk.empty:
                    take = rating_chunk.head(needed)
                    samples[rating].append(take)
                    
        total_collected = sum(len(pd.concat(s)) for s in samples.values() if s)
        print(f"Collected {total_collected} reviews so far...")
        if all(sum(len(df) for df in s) >= target_per_rating for s in samples.values()):
            break

    # Combine into single DataFrame
    all_dfs = []
    for rating in range(1, 6):
        if samples[rating]:
            combined_rating = pd.concat(samples[rating]).head(target_per_rating)
            all_dfs.append(combined_rating)
            
    df_sample = pd.concat(all_dfs).sample(frac=1, random_state=42).reset_index(drop=True)
    
    # Rename and reformat columns
    df_sample['id'] = range(1, len(df_sample) + 1)
    df_sample['uploaded_at'] = df_sample['Time'].apply(
        lambda t: datetime.datetime.fromtimestamp(t, tz=datetime.timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
    )
    df_sample = df_sample.rename(columns={
        'ProductId': 'product_name',
        'Score': 'rating',
        'Summary': 'review_summary',
        'Text': 'review_text'
    })[['id', 'product_name', 'rating', 'review_summary', 'review_text', 'uploaded_at']]

    # Save 500-row sample
    sample_file = 'reviews_sample_500.csv'
    df_sample.to_csv(sample_file, index=False)
    print(f"Saved {len(df_sample)} rows to {sample_file}")
    
    # Save a small 10-row test dataset (2 of each rating) for initial n8n test
    test_file = 'reviews_test_10.csv'
    df_test = df_sample.groupby('rating').head(2).sample(frac=1, random_state=42).reset_index(drop=True)
    df_test['id'] = range(1, len(df_test) + 1)
    df_test.to_csv(test_file, index=False)
    print(f"Saved {len(df_test)} test rows to {test_file}")

    print("\nSample rating distribution in 500-row file:")
    print(df_sample['rating'].value_counts().sort_index())
    
    print("\nSample rating distribution in 10-row test file:")
    print(df_test['rating'].value_counts().sort_index())

if __name__ == '__main__':
    sample_reviews()
