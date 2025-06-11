-- Create blockchain_data table for multi-chain data
CREATE TABLE IF NOT EXISTS blockchain_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  blockchain TEXT NOT NULL,
  transaction_data JSONB DEFAULT '[]',
  balance DECIMAL(20,8) DEFAULT 0,
  first_transaction TIMESTAMP WITH TIME ZONE,
  last_transaction TIMESTAMP WITH TIME ZONE,
  defi_interactions JSONB DEFAULT '[]',
  nft_holdings JSONB DEFAULT '[]',
  crawled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(wallet_address, blockchain)
);

-- Create social_data table for social media analysis
CREATE TABLE IF NOT EXISTS social_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  username TEXT NOT NULL,
  wallet_address TEXT,
  profile_data JSONB NOT NULL,
  posts_data JSONB DEFAULT '[]',
  sentiment_analysis JSONB,
  credibility_score INTEGER DEFAULT 0,
  crawled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(platform, username)
);

-- Create identity_matches table for cross-platform identity linking
CREATE TABLE IF NOT EXISTS identity_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  twitter_handle TEXT,
  email TEXT,
  confidence_score DECIMAL(3,2) DEFAULT 0.5,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_method TEXT,
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(wallet_address, twitter_handle)
);

-- Create comprehensive_scores table for multi-source scoring
CREATE TABLE IF NOT EXISTS comprehensive_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT,
  twitter_handle TEXT,
  score INTEGER NOT NULL CHECK (score >= 300 AND score <= 850),
  breakdown JSONB NOT NULL,
  confidence DECIMAL(3,2) DEFAULT 0.5,
  data_sources JSONB DEFAULT '[]',
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create semantic_analysis table for advanced text analysis
CREATE TABLE IF NOT EXISTS semantic_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'tweet', 'post', etc.
  content_text TEXT NOT NULL,
  sentiment_score DECIMAL(3,2),
  sentiment_label TEXT,
  financial_keywords JSONB DEFAULT '[]',
  crypto_mentions JSONB DEFAULT '[]',
  risk_indicators JSONB DEFAULT '[]',
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cross_chain_analysis table for multi-blockchain insights
CREATE TABLE IF NOT EXISTS cross_chain_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  total_chains INTEGER DEFAULT 0,
  total_balance_usd DECIMAL(20,2) DEFAULT 0,
  activity_score INTEGER DEFAULT 0,
  diversification_score INTEGER DEFAULT 0,
  risk_score INTEGER DEFAULT 0,
  bridge_usage JSONB DEFAULT '[]',
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(wallet_address)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blockchain_data_wallet ON blockchain_data(wallet_address);
CREATE INDEX IF NOT EXISTS idx_blockchain_data_blockchain ON blockchain_data(blockchain);
CREATE INDEX IF NOT EXISTS idx_social_data_username ON social_data(username);
CREATE INDEX IF NOT EXISTS idx_social_data_wallet ON social_data(wallet_address);
CREATE INDEX IF NOT EXISTS idx_identity_matches_wallet ON identity_matches(wallet_address);
CREATE INDEX IF NOT EXISTS idx_identity_matches_twitter ON identity_matches(twitter_handle);
CREATE INDEX IF NOT EXISTS idx_comprehensive_scores_wallet ON comprehensive_scores(wallet_address);
CREATE INDEX IF NOT EXISTS idx_semantic_analysis_content ON semantic_analysis(content_id);
CREATE INDEX IF NOT EXISTS idx_cross_chain_wallet ON cross_chain_analysis(wallet_address);

-- Enable RLS on new tables
ALTER TABLE blockchain_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE comprehensive_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE semantic_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_chain_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blockchain_data
CREATE POLICY "Users can view their own blockchain data" ON blockchain_data
  FOR SELECT USING (
    wallet_address IN (
      SELECT wallet_address FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all blockchain data" ON blockchain_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- RLS Policies for social_data
CREATE POLICY "Users can view their own social data" ON social_data
  FOR SELECT USING (
    wallet_address IN (
      SELECT wallet_address FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all social data" ON social_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Similar policies for other tables...
CREATE POLICY "Users can view their own identity matches" ON identity_matches
  FOR SELECT USING (
    wallet_address IN (
      SELECT wallet_address FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own comprehensive scores" ON comprehensive_scores
  FOR SELECT USING (
    wallet_address IN (
      SELECT wallet_address FROM users WHERE id = auth.uid()
    )
  );
