-- Add Stripe Subscription Support to Zenjin Maths Database
-- Migration to add Stripe-related columns and tables
-- Created: 2025-06-02

-- ========================================
-- ADD STRIPE COLUMNS TO APP_USERS TABLE
-- ========================================
ALTER TABLE app_users 
ADD COLUMN IF NOT EXISTS stripe_customer_id text UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id text UNIQUE,
ADD COLUMN IF NOT EXISTS subscription_status text CHECK (subscription_status IN ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid', 'canceling')),
ADD COLUMN IF NOT EXISTS subscription_period_end timestamptz,
ADD COLUMN IF NOT EXISTS subscription_cancel_at timestamptz;

-- Create indexes for Stripe columns
CREATE INDEX IF NOT EXISTS idx_app_users_stripe_customer_id ON app_users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_app_users_stripe_subscription_id ON app_users(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_app_users_subscription_status ON app_users(subscription_status);

-- ========================================
-- SUBSCRIPTION EVENTS TABLE
-- ========================================
-- Track all subscription-related events for audit and debugging
CREATE TABLE IF NOT EXISTS subscription_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app_users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  
  -- Index for querying events
  INDEX idx_subscription_events_user_id (user_id),
  INDEX idx_subscription_events_event_type (event_type),
  INDEX idx_subscription_events_created_at (created_at)
);

-- ========================================
-- SUBSCRIPTION PRICES TABLE
-- ========================================
-- Cache of Stripe price information for quick lookup
CREATE TABLE IF NOT EXISTS subscription_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_price_id text NOT NULL UNIQUE,
  plan_id text NOT NULL,
  plan_name text NOT NULL,
  amount integer NOT NULL, -- Amount in cents
  currency text NOT NULL DEFAULT 'usd',
  interval text NOT NULL CHECK (interval IN ('month', 'quarter', 'year')),
  interval_count integer NOT NULL DEFAULT 1,
  features jsonb DEFAULT '[]'::jsonb,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ========================================
-- ROW LEVEL SECURITY
-- ========================================
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_prices ENABLE ROW LEVEL SECURITY;

-- Users can only view their own subscription events
CREATE POLICY "Users can view own subscription events" ON subscription_events
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Everyone can view subscription prices (public information)
CREATE POLICY "Anyone can view subscription prices" ON subscription_prices
  FOR SELECT USING (true);

-- Only service role can modify subscription data
CREATE POLICY "Service role can manage subscription events" ON subscription_events
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage subscription prices" ON subscription_prices
  FOR ALL USING (auth.role() = 'service_role');

-- ========================================
-- UPDATE TRIGGERS
-- ========================================
CREATE TRIGGER update_subscription_prices_updated_at 
  BEFORE UPDATE ON subscription_prices 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- COMMENTS
-- ========================================
COMMENT ON COLUMN app_users.stripe_customer_id IS 'Stripe customer ID for payment processing';
COMMENT ON COLUMN app_users.stripe_subscription_id IS 'Active Stripe subscription ID';
COMMENT ON COLUMN app_users.subscription_status IS 'Current subscription status from Stripe';
COMMENT ON COLUMN app_users.subscription_period_end IS 'When the current subscription period ends';
COMMENT ON COLUMN app_users.subscription_cancel_at IS 'When the subscription will be canceled (if scheduled)';
COMMENT ON TABLE subscription_events IS 'Audit log of all subscription-related events';
COMMENT ON TABLE subscription_prices IS 'Cache of Stripe price/plan information';

-- ========================================
-- SEED DEFAULT SUBSCRIPTION PRICES
-- ========================================
-- Note: Replace these with your actual Stripe price IDs
INSERT INTO subscription_prices (stripe_price_id, plan_id, plan_name, amount, currency, interval, features) VALUES
  ('price_monthly_placeholder', 'premium-monthly', 'Premium Monthly', 999, 'usd', 'month', 
   '["Unlimited questions", "All learning paths", "Progress tracking", "Priority support"]'::jsonb),
  ('price_quarterly_placeholder', 'premium-quarterly', 'Premium Quarterly', 2697, 'usd', 'quarter',
   '["Unlimited questions", "All learning paths", "Progress tracking", "Priority support", "10% discount"]'::jsonb),
  ('price_annual_placeholder', 'premium-annual', 'Premium Annual', 9588, 'usd', 'year',
   '["Unlimited questions", "All learning paths", "Progress tracking", "Priority support", "20% discount"]'::jsonb)
ON CONFLICT (stripe_price_id) DO NOTHING;