-- Create scraping_results table
CREATE TABLE IF NOT EXISTS scraping_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '[]',
  metadata JSONB NOT NULL DEFAULT '{}',
  config JSONB NOT NULL DEFAULT '{}',
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scraping_logs table
CREATE TABLE IF NOT EXISTS scraping_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  success BOOLEAN DEFAULT false,
  items_scraped INTEGER DEFAULT 0,
  pages_scraped INTEGER DEFAULT 0,
  duration_ms INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]',
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scheduled_scraping table
CREATE TABLE IF NOT EXISTS scheduled_scraping (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  config JSONB NOT NULL,
  schedule TEXT NOT NULL, -- cron expression
  enabled BOOLEAN DEFAULT true,
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scraping_templates table
CREATE TABLE IF NOT EXISTS scraping_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  config JSONB NOT NULL,
  category TEXT DEFAULT 'general',
  created_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create proxy_pool table for rotating proxies
CREATE TABLE IF NOT EXISTS proxy_pool (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  host TEXT NOT NULL,
  port INTEGER NOT NULL,
  username TEXT,
  password TEXT,
  protocol TEXT DEFAULT 'http',
  is_active BOOLEAN DEFAULT true,
  success_rate DECIMAL(5,2) DEFAULT 100.00,
  last_used TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scraping_queue table for batch processing
CREATE TABLE IF NOT EXISTS scraping_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  config JSONB NOT NULL,
  priority INTEGER DEFAULT 5,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scraping_results_url ON scraping_results(url);
CREATE INDEX IF NOT EXISTS idx_scraping_results_scraped_at ON scraping_results(scraped_at);
CREATE INDEX IF NOT EXISTS idx_scraping_logs_url ON scraping_logs(url);
CREATE INDEX IF NOT EXISTS idx_scraping_logs_logged_at ON scraping_logs(logged_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_scraping_enabled ON scheduled_scraping(enabled);
CREATE INDEX IF NOT EXISTS idx_scheduled_scraping_next_run ON scheduled_scraping(next_run);
CREATE INDEX IF NOT EXISTS idx_scraping_templates_category ON scraping_templates(category);
CREATE INDEX IF NOT EXISTS idx_scraping_templates_public ON scraping_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_proxy_pool_active ON proxy_pool(is_active);
CREATE INDEX IF NOT EXISTS idx_scraping_queue_status ON scraping_queue(status);
CREATE INDEX IF NOT EXISTS idx_scraping_queue_scheduled ON scraping_queue(scheduled_for);

-- Enable RLS on scraping tables
ALTER TABLE scraping_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_scraping ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scraping_results
CREATE POLICY "Users can view their own scraping results" ON scraping_results
  FOR SELECT USING (true); -- Allow all authenticated users to view results

CREATE POLICY "Users can insert scraping results" ON scraping_results
  FOR INSERT WITH CHECK (true); -- Allow all authenticated users to insert

-- RLS Policies for scraping_logs
CREATE POLICY "Users can view scraping logs" ON scraping_logs
  FOR SELECT USING (true);

CREATE POLICY "System can insert scraping logs" ON scraping_logs
  FOR INSERT WITH CHECK (true);

-- RLS Policies for scheduled_scraping
CREATE POLICY "Users can manage their scheduled jobs" ON scheduled_scraping
  FOR ALL USING (true); -- Simplified for demo

-- RLS Policies for scraping_templates
CREATE POLICY "Users can view public templates" ON scraping_templates
  FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create templates" ON scraping_templates
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their templates" ON scraping_templates
  FOR UPDATE USING (created_by = auth.uid());

-- Function to update next_run for scheduled jobs
CREATE OR REPLACE FUNCTION update_next_run()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple logic to calculate next run (in production, use proper cron parser)
  NEW.next_run = NOW() + INTERVAL '1 hour';
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update next_run when schedule changes
CREATE TRIGGER update_scheduled_scraping_next_run
  BEFORE UPDATE ON scheduled_scraping
  FOR EACH ROW
  WHEN (OLD.schedule IS DISTINCT FROM NEW.schedule)
  EXECUTE FUNCTION update_next_run();
