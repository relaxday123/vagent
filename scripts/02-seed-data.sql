-- Insert sample users
INSERT INTO users (wallet_address, email) VALUES
('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8e1', 'alice@example.com'),
('0x8ba1f109551bD432803012645Hac136c9c1e4e5', 'bob@example.com'),
('0x1234567890abcdef1234567890abcdef12345678', 'charlie@example.com')
ON CONFLICT (wallet_address) DO NOTHING;

-- Insert sample wallet data
INSERT INTO wallet_data (user_id, wallet_address, blockchain, balance, transaction_count, first_transaction_date, last_transaction_date, defi_protocols, token_holdings)
SELECT 
  u.id,
  u.wallet_address,
  'ethereum',
  CASE 
    WHEN u.wallet_address = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8e1' THEN 15.5
    WHEN u.wallet_address = '0x8ba1f109551bD432803012645Hac136c9c1e4e5' THEN 8.2
    ELSE 3.1
  END,
  CASE 
    WHEN u.wallet_address = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8e1' THEN 450
    WHEN u.wallet_address = '0x8ba1f109551bD432803012645Hac136c9c1e4e5' THEN 280
    ELSE 120
  END,
  NOW() - INTERVAL '2 years',
  NOW() - INTERVAL '1 day',
  CASE 
    WHEN u.wallet_address = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8e1' THEN '["Uniswap", "Aave", "Compound"]'::jsonb
    WHEN u.wallet_address = '0x8ba1f109551bD432803012645Hac136c9c1e4e5' THEN '["Uniswap", "SushiSwap"]'::jsonb
    ELSE '["Uniswap"]'::jsonb
  END,
  CASE 
    WHEN u.wallet_address = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8e1' THEN '[{"token": "ETH", "amount": 15.5}, {"token": "USDC", "amount": 5000}]'::jsonb
    WHEN u.wallet_address = '0x8ba1f109551bD432803012645Hac136c9c1e4e5' THEN '[{"token": "ETH", "amount": 8.2}, {"token": "DAI", "amount": 2000}]'::jsonb
    ELSE '[{"token": "ETH", "amount": 3.1}]'::jsonb
  END
FROM users u;

-- Insert sample off-chain data
INSERT INTO off_chain_data (user_id, kyc_verified, social_score, credit_history_score, risk_flags)
SELECT 
  u.id,
  CASE 
    WHEN u.wallet_address = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8e1' THEN TRUE
    WHEN u.wallet_address = '0x8ba1f109551bD432803012645Hac136c9c1e4e5' THEN TRUE
    ELSE FALSE
  END,
  CASE 
    WHEN u.wallet_address = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8e1' THEN 85
    WHEN u.wallet_address = '0x8ba1f109551bD432803012645Hac136c9c1e4e5' THEN 72
    ELSE 45
  END,
  CASE 
    WHEN u.wallet_address = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8e1' THEN 750
    WHEN u.wallet_address = '0x8ba1f109551bD432803012645Hac136c9c1e4e5' THEN 680
    ELSE 0
  END,
  CASE 
    WHEN u.wallet_address = '0x1234567890abcdef1234567890abcdef12345678' THEN '["low_activity"]'::jsonb
    ELSE '[]'::jsonb
  END
FROM users u;
