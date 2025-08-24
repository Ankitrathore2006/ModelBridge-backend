import { gemini, createAgent, createNetwork, createState } from "@inngest/agent-kit";

// Utility function to classify text using LLM
export async function classifyText(text, context, systemPrompt) {
  try {
    const state = createState({ results: {} }, { messages: [] });

    const agent = createAgent({
      name: "classifier-agent",
      description: "Text classification agent",
      system: systemPrompt,
      model: gemini({ model: "gemini-2.5-flash" }),
    });

    const network = createNetwork({
      name: "classifier-network",
      agents: [agent],
      defaultState: state,
      maxIter: 3,
    });

    const userPrompt = `Analyze the following text and context:

Text: "${text}"
Context: ${context || "No additional context provided"}

Please classify this text according to the system prompt and respond in valid JSON format.`;

    const result = await network.run(userPrompt, { state });

    let output;
    try {
      output = JSON.parse(result.output[0].content);
    } catch (err) {
      console.error("Failed to parse classification response:", err);
      output = { 
        category: "Unknown", 
        severity: "Medium", 
        action: "WARN",
        error: "Failed to parse response"
      };
    }

    return output;
  } catch (error) {
    console.error("Error in classifyText:", error);
    return {
      category: "Unknown",
      severity: "Medium",
      action: "WARN",
      error: error.message
    };
  }
}

// Utility function to validate JSON response
export function validateJSONResponse(response) {
  try {
    if (typeof response === 'string') {
      return JSON.parse(response);
    }
    return response;
  } catch (error) {
    console.error("JSON validation failed:", error);
    return null;
  }
}

// Utility function to sanitize input text
export function sanitizeText(text) {
  if (typeof text !== 'string') {
    return '';
  }
  
  // Remove null bytes and control characters
  return text
    .replace(/\0/g, '')
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    .trim();
}

// Utility function to calculate text complexity score
export function calculateTextComplexity(text) {
  if (!text || typeof text !== 'string') {
    return 0;
  }

  let score = 0;
  
  // Length factor
  score += Math.min(text.length / 100, 1) * 20;
  
  // Special characters factor
  const specialCharCount = (text.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
  score += Math.min(specialCharCount / 10, 1) * 30;
  
  // Word complexity factor
  const words = text.split(/\s+/);
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  score += Math.min(avgWordLength / 10, 1) * 25;
  
  // Entropy factor (randomness)
  const charFreq = {};
  for (const char of text) {
    charFreq[char] = (charFreq[char] || 0) + 1;
  }
  const entropy = Object.values(charFreq).reduce((sum, freq) => {
    const p = freq / text.length;
    return sum - p * Math.log2(p);
  }, 0);
  score += Math.min(entropy / 5, 1) * 25;
  
  return Math.round(score);
}

// Utility function to detect language
export function detectLanguage(text) {
  if (!text || typeof text !== 'string') {
    return 'unknown';
  }

  // Simple language detection based on character sets
  const patterns = {
    english: /^[a-zA-Z\s.,!?;:'"()\-]+$/,
    chinese: /[\u4e00-\u9fff]/,
    japanese: /[\u3040-\u309f\u30a0-\u30ff]/,
    korean: /[\uac00-\ud7af]/,
    arabic: /[\u0600-\u06ff]/,
    cyrillic: /[\u0400-\u04ff]/,
    hindi: /[\u0900-\u097f]/,
    thai: /[\u0e00-\u0e7f]/,
    hebrew: /[\u0590-\u05ff]/,
    greek: /[\u0370-\u03ff]/
  };

  for (const [lang, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) {
      return lang;
    }
  }

  return 'unknown';
}

// Utility function to extract entities from text
export function extractEntities(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const entities = [];
  
  // Email addresses
  const emails = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [];
  entities.push(...emails.map(email => ({ type: 'email', value: email })));
  
  // URLs
  const urls = text.match(/https?:\/\/[^\s]+/g) || [];
  entities.push(...urls.map(url => ({ type: 'url', value: url })));
  
  // Phone numbers
  const phones = text.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g) || [];
  entities.push(...phones.map(phone => ({ type: 'phone', value: phone })));
  
  // Credit card numbers (basic pattern)
  const cards = text.match(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g) || [];
  entities.push(...cards.map(card => ({ type: 'credit_card', value: card })));
  
  // IP addresses
  const ips = text.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g) || [];
  entities.push(...ips.map(ip => ({ type: 'ip_address', value: ip })));
  
  return entities;
}

// Utility function to rate limit check
export function createRateLimiter(maxRequests = 100, windowMs = 60000) {
  const requests = new Map();
  
  return function checkRateLimit(identifier) {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    for (const [key, timestamp] of requests.entries()) {
      if (timestamp < windowStart) {
        requests.delete(key);
      }
    }
    
    // Check current requests
    const currentRequests = requests.get(identifier) || 0;
    if (currentRequests >= maxRequests) {
      return false; // Rate limited
    }
    
    // Increment counter
    requests.set(identifier, currentRequests + 1);
    return true; // Allowed
  };
}
