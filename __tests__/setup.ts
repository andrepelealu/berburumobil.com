// Test setup file
process.env.NODE_ENV = 'test'

// Mock environment variables for testing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test_anon_key_123456789'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key_123456789'
process.env.OPENAI_API_KEY = 'sk-test-key-123456789'
process.env.TELEGRAM_BOT_TOKEN = 'test_telegram_token'
process.env.TELEGRAM_CHAT_ID = 'test_chat_id'