# Environment Variables Setup

## Required API Keys

To fully use all features of Aikadin, you need to obtain and configure the following API keys:

### 1. OpenAI API Key (Required for AI Assistant)
- Sign up at: https://platform.openai.com/
- Create API key in dashboard
- Add to environment: `EXPO_PUBLIC_OPENAI_API_KEY=your_key_here`

### 2. Replicate API Token (Required for Virtual Try-On)
- Sign up at: https://replicate.com/
- Get API token from account settings
- Add to environment: `EXPO_PUBLIC_REPLICATE_API_TOKEN=your_token_here`

## Environment Variables Template

Create a `.env.local` file in the root directory with:

```bash
# Aikadin Environment Variables
# Copy this template and add your actual API keys

# OpenAI API Configuration
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here

# Replicate API Configuration  
EXPO_PUBLIC_REPLICATE_API_TOKEN=your_replicate_api_token_here

# Firebase Configuration (Optional - defaults are in config)
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyBlsHaWN-Jh1E7OrIVnnxZQzQD98tMtfkI
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=aikadin.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=aikadin
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=aikadin.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=930852067894
EXPO_PUBLIC_FIREBASE_APP_ID=1:930852067894:web:e607d3e9f65b10aac71697
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XJ42Q30MHY

# Development Settings
NODE_ENV=development
EXPO_PUBLIC_APP_ENV=development
```

## Security Notes

1. **Never commit API keys to version control**
2. **Add `.env.local` to your `.gitignore` file**
3. **Use different keys for development and production**
4. **Regularly rotate your API keys**

## Testing Without API Keys

The app includes test modes that work without real API keys:
- AI Assistant: Uses simulated responses
- Virtual Try-On: Shows example results
- All other features work normally 