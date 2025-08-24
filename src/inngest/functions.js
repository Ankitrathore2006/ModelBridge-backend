import { DETECTOR_PROMPT } from "./prompt.js";
import { inngest } from "./client.js";
import { rules } from "./rules.js";
import Log from "../models/log.model.js";

// ============================================================
// Main Chat Processing Function - Commercial API Service
// ============================================================
export const chatProcessor = inngest.createFunction(
  { id: "chat-processor", name: "Chat Processing & Safety Check" },
  { event: "chat/process" },
  async ({ event }) => {
    const { 
      text, 
      apiKey, 
      clientId, 
      conversationId, 
      requestId,
      timestamp 
    } = event.data;
    
    const startTime = Date.now();
    
    try {
      // Step 1: Validate API Key and Client
      const clientValidation = await validateClient(apiKey, clientId);
      if (!clientValidation.valid) {
        await logRequest({
          requestId,
          clientId,
          conversationId,
          text,
          safetyResult: { error: "Invalid API key or client" },
          action: "ERROR",
          response: "Authentication failed",
          timestamp,
          processingTimeMs: Date.now() - startTime
        });

        return {
          request_id: requestId,
          status: "error",
          error: "Invalid API key or client",
          timestamp: new Date().toISOString()
        };
      }

      // Step 2: Safety Detection
      const safetyResult = await detectSafetyIssues(text);
      
      // Step 3: Process based on safety result
      if (safetyResult.is_safe) {
        // Safe query - Generate LLM response
        const llmResponse = await generateLLMResponse(text, clientValidation.client_config);
        
        // Log successful request
        await logRequest({
          requestId,
          clientId,
          conversationId,
          text,
          safetyResult,
          action: "ALLOW",
          response: llmResponse,
          timestamp,
          processingTimeMs: Date.now() - startTime
        });

        return {
          request_id: requestId,
          status: "success",
          is_safe: true,
          safety_score: safetyResult.risk_score,
          response: llmResponse,
          timestamp: new Date().toISOString()
        };
      } else {
        // Unsafe query - Block and log
        const actionResult = await performSafetyAction(safetyResult, clientValidation.client_config);
        
        // Log blocked request
        await logRequest({
          requestId,
          clientId,
          conversationId,
          text,
          safetyResult,
          action: actionResult.action,
          response: actionResult.message,
          timestamp,
          processingTimeMs: Date.now() - startTime
        });

        return {
          request_id: requestId,
          status: "blocked",
          is_safe: false,
          safety_score: safetyResult.risk_score,
          category: safetyResult.category,
          severity: safetyResult.severity,
          action: actionResult.action,
          message: actionResult.message,
          timestamp: new Date().toISOString()
        };
      }
      
    } catch (error) {
      console.error("Chat processing error:", error);
      
      // Log error
      await logRequest({
        requestId,
        clientId,
        conversationId,
        text,
        safetyResult: { error: error.message },
        action: "ERROR",
        response: "Processing failed",
        timestamp,
        processingTimeMs: Date.now() - startTime
      });

      return {
        request_id: requestId,
        status: "error",
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
);

// ============================================================
// Safety Detection Function
// ============================================================
export const safetyDetector = inngest.createFunction(
  { id: "safety-detector", name: "Safety Detection Engine" },
  { event: "safety/detect" },
  async ({ event }) => {
    const { text, context } = event.data;
    
    try {
      // Step 1: Rule-based detection (fast)
      const ruleMatch = rules.find(rule => rule.pattern.test(text));
      if (ruleMatch) {
        return {
          is_safe: false,
          category: ruleMatch.category,
          severity: ruleMatch.severity,
          risk_score: ruleMatch.risk_score,
          detection_method: "rule-based",
          flagged_keywords: text.match(ruleMatch.pattern) || [],
          rule_id: ruleMatch.id,
          timestamp: new Date().toISOString()
        };
      }

      // Step 2: AI-powered classification (comprehensive)
      const aiResult = await classifyTextWithAI(text, context);
      
      return {
        is_safe: aiResult.action === "ALLOW",
        category: aiResult.category || "Unknown",
        severity: aiResult.severity || "Medium",
        risk_score: aiResult.risk_score || calculateRiskScore(text),
        detection_method: "ai-classification",
        confidence: aiResult.confidence || 0.7,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error("Safety detection error:", error);
      return {
        is_safe: false,
        category: "Unknown",
        severity: "High",
        risk_score: 100,
        detection_method: "fallback",
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
);

// ============================================================
// Helper Functions
// ============================================================

// Validate API key and client
export async function validateClient(apiKey, clientId) {
  try {
    // This would query your database for valid clients
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

    const client = validClients[clientId];
    if (client && client.apiKey === apiKey) {
      return {
        valid: true,
        client_config: client.client_config,
        client_info: {
          id: clientId,
          name: client.name,
          plan: client.plan
        }
      };
    }

    return { valid: false };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

// Detect safety issues
export async function detectSafetyIssues(text) {
  try {
    // Rule-based detection first
    const ruleMatch = rules.find(rule => rule.pattern.test(text));
    if (ruleMatch) {
      return {
        is_safe: false,
        category: ruleMatch.category,
        severity: ruleMatch.severity,
        risk_score: ruleMatch.risk_score,
        detection_method: "rule-based",
        flagged_keywords: text.match(ruleMatch.pattern) || [],
        rule_id: ruleMatch.id
      };
    }

    // AI-based detection if no rule match
    const aiResult = await classifyTextWithAI(text);
    
    return {
      is_safe: aiResult.action === "ALLOW",
      category: aiResult.category || "Unknown",
      severity: aiResult.severity || "Medium",
      risk_score: aiResult.risk_score || calculateRiskScore(text),
      detection_method: "ai-classification",
      confidence: aiResult.confidence || 0.7
    };
    
  } catch (error) {
    console.error("Safety detection error:", error);
    return {
      is_safe: false,
      category: "Unknown",
      severity: "High",
      risk_score: 100,
      detection_method: "fallback",
      error: error.message
    };
  }
}

// Generate LLM response for safe queries
export async function generateLLMResponse(text, clientConfig) {
  try {
    // For now, use a simple mock response system
    // TODO: Integrate with real LLM API (OpenAI, Anthropic, etc.)
    
    const mockResponses = {
      greeting: [
        "Hello! I'm doing well, thank you for asking. How are you today?",
        "Hi there! I'm here and ready to help you with anything you need.",
        "Hello! I'm doing great. What can I assist you with today?"
      ],
      question: [
        "That's a great question! Let me help you with that.",
        "I'd be happy to help you with that. Here's what I know...",
        "That's an interesting topic. Let me provide some information..."
      ],
      help: [
        "I'm here to help! What specific assistance do you need?",
        "Of course! I'd be happy to help you with that.",
        "I'm ready to assist you. What would you like to know?"
      ],
      default: [
        "I'm here to help you with your request.",
        "Thank you for reaching out. How can I assist you?",
        "I'm ready to help. What would you like to know?"
      ]
    };

    // Determine response type based on text content
    let responseType = "default";
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes("hello") || lowerText.includes("hi") || lowerText.includes("how are you")) {
      responseType = "greeting";
    } else if (lowerText.includes("how") || lowerText.includes("what") || lowerText.includes("why")) {
      responseType = "question";
    } else if (lowerText.includes("help") || lowerText.includes("assist")) {
      responseType = "help";
    }

    // Get random response from appropriate category
    const responses = mockResponses[responseType];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      content: randomResponse,
      model: "mock-llm-v1",
      generated_at: new Date().toISOString()
    };
    
  } catch (error) {
    console.error("LLM generation error:", error);
    return {
      content: "I apologize, but I'm unable to generate a response at the moment. Please try again later.",
      model: "fallback",
      error: error.message,
      generated_at: new Date().toISOString()
    };
  }
}



// AI classification fallback
async function classifyTextWithAI(text, context = "") {
  try {
    // Simple text analysis for common safe patterns first
    const safePatterns = [
      /^(hello|hi|hey|good\s+(morning|afternoon|evening))/i,
      /^(how\s+are\s+you|how\s+do\s+you\s+do|what's\s+up)/i,
      /^(can\s+you\s+help|please\s+help|i\s+need\s+help)/i,
      /^(what\s+is|how\s+to|explain|describe|tell\s+me)/i,
      /^(thank\s+you|thanks|appreciate|grateful)/i,
      /^(goodbye|bye|see\s+you|take\s+care)/i
    ];

    // Check if text matches safe patterns
    for (const pattern of safePatterns) {
      if (pattern.test(text.trim())) {
        return {
          category: "Safe",
          severity: "Low",
          action: "ALLOW",
          confidence: 0.95,
          risk_score: 5
        };
      }
    }

    // For now, use simple rule-based classification instead of AI
    // TODO: Integrate with real AI classification API
    
    // Check for obvious unsafe patterns
    const unsafePatterns = [
      { pattern: /(hack|exploit|vulnerability|backdoor)/i, category: "Security", severity: "High", action: "BLOCK", risk_score: 90 },
      { pattern: /(kill|murder|assassinate|bomb|shoot)/i, category: "Violence", severity: "High", action: "BLOCK", risk_score: 100 },
      { pattern: /(suicide|self.?harm|kill.?myself)/i, category: "Self-harm", severity: "High", action: "BLOCK", risk_score: 95 },
      { pattern: /(scam|fraud|steal|cheat)/i, category: "Fraud", severity: "High", action: "BLOCK", risk_score: 85 },
      { pattern: /(spam|free.?money|lottery|winner)/i, category: "Spam", severity: "Medium", action: "WARN", risk_score: 70 }
    ];

    // Check if text matches any unsafe patterns
    for (const unsafePattern of unsafePatterns) {
      if (unsafePattern.pattern.test(text)) {
        return {
          category: unsafePattern.category,
          severity: unsafePattern.severity,
          action: unsafePattern.action,
          confidence: 0.9,
          risk_score: unsafePattern.risk_score
        };
      }
    }

    // If no unsafe patterns found, it's safe
    const output = {
      category: "Safe",
      severity: "Low",
      action: "ALLOW",
      confidence: 0.95,
      risk_score: 5
    };

    return output;
    
  } catch (error) {
    console.error("AI classification error:", error);
    // Fallback to safe if AI fails completely
    return {
      category: "Safe",
      severity: "Low", 
      action: "ALLOW",
      confidence: 0.5,
      risk_score: 15,
      error: error.message
    };
  }
}

// Updated safety action
export async function performSafetyAction(safetyResult, clientConfig) {
  const { category, severity, risk_score, action } = safetyResult;

  // If AI already says ALLOW, no need to WARN
  if (action === "ALLOW") {
    return {
      action: "ALLOW",
      message: "Content is safe.",
      reason: category,
      admin_review_required: false
    };
  }

  if (risk_score >= 90 || severity === "High") {
    return {
      action: "BLOCK",
      message: "This content has been blocked due to policy violations.",
      reason: category,
      admin_review_required: true
    };
  }

  if (risk_score >= 70 || severity === "Medium") {
    return {
      action: "WARN",
      message: "This content has been flagged for review.",
      reason: category,
      admin_review_required: false
    };
  }

  return {
    action: "ALLOW",
    message: "Content processed with caution.",
    reason: category,
    admin_review_required: false
  };
}


// Calculate risk score
function calculateRiskScore(text) {
  let score = 0;
  
  // Length factor
  score += Math.min(text.length / 100, 1) * 20;
  
  // Special characters factor
  const specialCharCount = (text.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
  score += Math.min(specialCharCount / 10, 1) * 30;
  
  return Math.round(score);
}


// Log request to database
export async function logRequest(logData) {
  try {
    const logEntry = {
      request_id: logData.requestId,
      client_id: logData.clientId,
      conversation_id: logData.conversationId,
      text: logData.text,
      context: logData.context || "general",
      safety_result: logData.safetyResult,
      action: logData.action,
      response: logData.response,
      timestamp: new Date(logData.timestamp),
      processing_time_ms: logData.processingTimeMs || 0,
      ip_address: "127.0.0.1", // Would get from request
      user_agent: "API-Client/1.0" // Would get from request
    };
    
    // Save to MongoDB
    await Log.create(logEntry);
    
    console.log("Request logged successfully:", logEntry.request_id);
    return true;
  } catch (error) {
    console.error("Logging error:", error);
    return false;
  }
}
