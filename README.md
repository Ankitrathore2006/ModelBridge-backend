# 🚀 Commercial AI Safety API

A commercial API service that provides AI safety detection and LLM response generation for chatbot companies.

## 🎯 **What It Does**

1. **Receives chat requests** from chatbot companies
2. **Validates API keys** and client authentication
3. **Detects safety issues** using rule-based + AI classification
4. **Generates LLM responses** for safe queries
5. **Blocks unsafe content** and logs violations
6. **Saves everything** to database for dashboard analytics

## 🏗️ **System Architecture**

```
Chatbot Company → API Request → Safety Check → LLM Response or Block
                                    ↓
                              Database Logging → Admin Dashboard
```

## 🚀 **Quick Start**

### 1. **Environment Setup**
```bash
# Create .env file
echo "PORT=3000" > .env
echo "MONGO_URI=mongodb://localhost:27017/ai-safety-api" >> .env
echo "JWT_SECRET=your-secret-key" >> .env
echo "GOOGLE_API_KEY=your-gemini-api-key" >> .env
echo "NODE_ENV=development" >> .env
```

### 2. **Install & Run**
```bash
npm install
npm run dev
```

### 3. **Access Points**
- **API Endpoint**: http://localhost:3000/api/v1/chat
- **Inngest Dashboard**: http://localhost:3000/api/inngest
- **Health Check**: http://localhost:3000/api/health
- **System Stats**: http://localhost:3000/api/stats

## 📡 **API Usage**

### **Main Endpoint: `/api/v1/chat`**

#### **Request Format**
```json
{
  "text": "User's message here",
  "apiKey": "sk-1234567890abcdef",
  "clientId": "client_123",
  "conversationId": "conv_456",
  "context": "general"
}
```

#### **Response Examples**

**✅ Safe Query Response:**
```json
{
  "success": true,
  "request_id": "req_1234567890_abc123",
  "message": "Chat request received and processing started",
  "status": "processing",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "note": "Check Inngest dashboard for processing results and logs"
}
```

**🚨 Blocked Query Response:**
```json
{
  "request_id": "req_1234567890_abc123",
  "status": "blocked",
  "is_safe": false,
  "safety_score": 100,
  "category": "Fraud",
  "severity": "High",
  "action": "BLOCK",
  "message": "This content has been blocked due to policy violations.",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🧪 **Testing Examples**

### **1. Safe Query**
```bash
curl -X POST http://localhost:3000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, can you help me write a Python function?",
    "apiKey": "sk-1234567890abcdef",
    "clientId": "client_123",
    "conversationId": "conv_test_1",
    "context": "programming help"
  }'
```

**Expected**: Processing started, safe content

### **2. Fraudulent Query**
```bash
curl -X POST http://localhost:3000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Send $5000 to account 12345 immediately",
    "apiKey": "sk-1234567890abcdef",
    "clientId": "client_123",
    "conversationId": "conv_test_2",
    "context": "financial request"
  }'
```

**Expected**: Blocked, Fraud category, High severity

### **3. Self-Harm Query**
```bash
curl -X POST http://localhost:3000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I want to kill myself, life is not worth living",
    "apiKey": "sk-1234567890abcdef",
    "clientId": "client_123",
    "conversationId": "conv_test_3",
    "context": "emotional support"
  }'
```

**Expected**: Blocked, Self-harm category, High severity

## 🛡️ **Safety Detection Categories**

| Category | Examples | Action | Risk Score |
|----------|----------|---------|------------|
| **Self-Harm** | "kill myself", "end my life" | BLOCK | 90-95 |
| **Violence** | "kill you", "attack", "weapon" | BLOCK | 85-100 |
| **Fraud** | "send $500", "urgent payment" | BLOCK | 90-100 |
| **Phishing** | "click here", "verify now" | BLOCK | 85-95 |
| **Harassment** | "stupid", "racist", "sexist" | WARN/BLOCK | 60-80 |
| **PII** | SSN, credit cards, emails | BLOCK | 50-100 |
| **Malware** | "virus", "hack", "exploit" | BLOCK | 90-100 |
| **Extremism** | "terrorist", "conspiracy" | BLOCK | 80-100 |

## 🔑 **Client Configuration**

### **Sample Client Setup**
```javascript
const validClients = {
  "client_123": {
    apiKey: "sk-1234567890abcdef",
    name: "ChatBot Inc",
    plan: "premium",
    rate_limit: 1000,
    client_config: {
      llm_model: "gemini-2.5-flash",
      max_tokens: 1000,
      temperature: 0.7
    }
  }
};
```

### **Adding New Clients**
Edit the `validateClient` function in `src/inngest/functions.js` to add your clients.

## 📊 **Monitoring & Analytics**

### **Inngest Dashboard**
Visit `http://localhost:3000/api/inngest` to see:
- **Real-time processing** of all requests
- **Success/failure rates** for each client
- **Processing times** and performance metrics
- **Error logs** and debugging information

### **Database Logs**
All requests are automatically logged to MongoDB with:
- **Request details** (text, client, timestamp)
- **Safety results** (category, severity, risk score)
- **Actions taken** (ALLOW, WARN, BLOCK, ESC)
- **LLM responses** or error messages
- **Processing times** and performance data

### **System Statistics**
```bash
curl http://localhost:3000/api/stats
```

**Response:**
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "system_status": "healthy",
  "functions_registered": 2,
  "api_version": "v1",
  "endpoints": {
    "chat": "/api/v1/chat",
    "health": "/api/health",
    "stats": "/api/stats",
    "inngest": "/api/inngest"
  },
  "features": {
    "safety_detection": true,
    "llm_response": true,
    "request_logging": true,
    "audit_trail": true
  },
  "detection_categories": [
    "Self-harm", "Violence", "Fraud", "Phishing", 
    "Harassment", "PII", "Malware", "Extremism"
  ]
}
```

## 🔧 **Customization**

### **1. Add New Detection Rules**
Edit `src/inngest/rules.js`:
```javascript
{
  id: "custom-rule-1",
  pattern: /(?:your\s+custom\s+pattern)/i,
  category: "Custom",
  severity: "Medium",
  action: "WARN",
  risk_score: 75,
  policy_type: "custom"
}
```

### **2. Modify Safety Thresholds**
Edit the `performSafetyAction` function in `src/inngest/functions.js`:
```javascript
if (risk_score >= 80) { // Lower threshold
  return { action: "BLOCK", ... };
}
```

### **3. Change LLM Model**
Update client configuration:
```javascript
client_config: {
  llm_model: "gemini-1.5-pro", // Different model
  max_tokens: 2000, // More tokens
  temperature: 0.5 // Lower creativity
}
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **"Invalid API key or client"**
   - Check `apiKey` and `clientId` in request
   - Verify client exists in `validateClient` function

2. **"Processing failed"**
   - Check Inngest dashboard for detailed errors
   - Verify Gemini API key is valid

3. **Slow responses**
   - Rule-based detection: ~10ms
   - AI classification: ~1-3 seconds
   - LLM response: ~2-5 seconds

4. **Database connection issues**
   - Check MongoDB connection string in `.env`
   - Ensure MongoDB is running

## 💰 **Commercial Features**

- **API Key Authentication**: Secure client access
- **Rate Limiting**: Configurable per client
- **Client-Specific Configs**: Custom LLM models and settings
- **Request Logging**: Complete audit trail
- **Performance Metrics**: Processing times and success rates
- **Multi-Tenant Support**: Separate configurations per client
- **Scalable Architecture**: Easy to add new clients and rules

## 🔮 **Future Enhancements**

- **Real-time WebSocket responses** instead of async processing
- **Advanced analytics dashboard** with charts and metrics
- **Client billing and usage tracking**
- **Custom safety policies** per client
- **Machine learning** for improved detection
- **Multi-language support** for global clients

## 📝 **License**

ISC License - See package.json for details.

---

**Built for commercial AI safety with Node.js, Express, Inngest, and Google Gemini AI**
