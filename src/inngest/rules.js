// Security Rules for Pattern-Based Detection
// These rules provide fast, deterministic detection before LLM analysis

export const rules = [
  // ============================================================
  // SELF-HARM DETECTION
  // ============================================================
  {
    id: "self-harm-1",
    pattern: /(?:kill\s+myself|end\s+my\s+life|commit\s+suicide|want\s+to\s+die)/i,
    category: "Self-harm",
    severity: "High",
    action: "BLOCK",
    risk_score: 95,
    policy_type: "safety"
  },
  {
    id: "self-harm-2",
    pattern: /(?:hurt\s+myself|self\s+harm|cut\s+myself|overdose)/i,
    category: "Self-harm",
    severity: "High",
    action: "BLOCK",
    risk_score: 90,
    policy_type: "safety"
  },
  {
    id: "self-harm-3",
    pattern: /(?:life\s+isn't\s+worth|no\s+reason\s+to\s+live|better\s+off\s+dead)/i,
    category: "Self-harm",
    severity: "Medium",
    action: "WARN",
    risk_score: 75,
    policy_type: "safety"
  },

  // ============================================================
  // VIOLENCE DETECTION
  // ============================================================
  {
    id: "violence-1",
    pattern: /(?:kill\s+(?:you|them|him|her)|murder|assassinate|bomb|shoot)/i,
    category: "Violence",
    severity: "High",
    action: "BLOCK",
    risk_score: 100,
    policy_type: "safety"
  },
  {
    id: "violence-2",
    pattern: /(?:attack|assault|beat\s+up|fight|violence)/i,
    category: "Violence",
    severity: "High",
    action: "BLOCK",
    risk_score: 85,
    policy_type: "safety"
  },
  {
    id: "violence-3",
    pattern: /(?:weapon|gun|knife|explosive|terrorist)/i,
    category: "Violence",
    severity: "Medium",
    action: "WARN",
    risk_score: 70,
    policy_type: "safety"
  },

  // ============================================================
  // HARASSMENT DETECTION
  // ============================================================
  {
    id: "harassment-1",
    pattern: /(?:stupid|idiot|moron|dumb|retard)/i,
    category: "Harassment",
    severity: "Medium",
    action: "WARN",
    risk_score: 65,
    policy_type: "conduct"
  },
  {
    id: "harassment-2",
    pattern: /(?:hate\s+you|disgusting|awful|terrible)/i,
    category: "Harassment",
    severity: "Medium",
    action: "WARN",
    risk_score: 60,
    policy_type: "conduct"
  },
  {
    id: "harassment-3",
    pattern: /(?:racist|sexist|homophobic|discriminatory)/i,
    category: "Harassment",
    severity: "High",
    action: "BLOCK",
    risk_score: 80,
    policy_type: "conduct"
  },

  // ============================================================
  // PII DETECTION
  // ============================================================
  {
    id: "pii-1",
    pattern: /\b\d{3}-\d{2}-\d{4}\b/,
    category: "PII",
    severity: "High",
    action: "BLOCK",
    risk_score: 95,
    policy_type: "privacy"
  },
  {
    id: "pii-2",
    pattern: /\b\d{3}\s\d{2}\s\d{4}\b/,
    category: "PII",
    severity: "High",
    action: "BLOCK",
    risk_score: 95,
    policy_type: "privacy"
  },
  {
    id: "pii-3",
    pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/,
    category: "PII",
    severity: "High",
    action: "BLOCK",
    risk_score: 100,
    policy_type: "privacy"
  },
  {
    id: "pii-4",
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
    category: "PII",
    severity: "Medium",
    action: "WARN",
    risk_score: 50,
    policy_type: "privacy"
  },

  // ============================================================
  // MALWARE DETECTION
  // ============================================================
  {
    id: "malware-1",
    pattern: /(?:virus|malware|trojan|worm|spyware|keylogger)/i,
    category: "Malware",
    severity: "High",
    action: "BLOCK",
    risk_score: 100,
    policy_type: "security"
  },
  {
    id: "malware-2",
    pattern: /(?:hack|exploit|vulnerability|backdoor|rootkit)/i,
    category: "Malware",
    severity: "High",
    action: "BLOCK",
    risk_score: 90,
    policy_type: "security"
  },
  {
    id: "malware-3",
    pattern: /(?:ddos|botnet|ransomware|cryptojacking)/i,
    category: "Malware",
    severity: "High",
    action: "BLOCK",
    risk_score: 95,
    policy_type: "security"
  },

  // ============================================================
  // EXTREMISM DETECTION
  // ============================================================
  {
    id: "extremism-1",
    pattern: /(?:extremist|radical|terrorist|jihad|hate\s+group)/i,
    category: "Extremism",
    severity: "High",
    action: "BLOCK",
    risk_score: 100,
    policy_type: "content"
  },
  {
    id: "extremism-2",
    pattern: /(?:conspiracy|government\s+coverup|deep\s+state|illuminati)/i,
    category: "Extremism",
    severity: "Medium",
    action: "WARN",
    risk_score: 70,
    policy_type: "content"
  },

  // ============================================================
  // PHISHING DETECTION
  // ============================================================
  {
    id: "phishing-1",
    pattern: /(?:your\s+(?:bank|account|password|credit\s*card)\s+(?:is|has\s+been)\s+(?:locked|suspended|compromised))/i,
    category: "Phishing",
    severity: "High",
    action: "BLOCK",
    risk_score: 95,
    policy_type: "security"
  },
  {
    id: "phishing-2",
    pattern: /(?:click\s+(?:here|now)|login\s+(?:here|now)|verify\s+(?:here|now))/i,
    category: "Phishing",
    severity: "High",
    action: "BLOCK",
    risk_score: 90,
    policy_type: "security"
  },
  {
    id: "phishing-3",
    pattern: /(?:https?:\/\/[^\s]*(?:bank|paypal|amazon|google|microsoft|apple)[^\s]*)/i,
    category: "Phishing",
    severity: "High",
    action: "BLOCK",
    risk_score: 85,
    policy_type: "security"
  },

  // ============================================================
  // FRAUD DETECTION
  // ============================================================
  {
    id: "fraud-1",
    pattern: /(?:send\s+\$\d+|transfer\s+\$\d+|pay\s+\$\d+)/i,
    category: "Fraud",
    severity: "High",
    action: "BLOCK",
    risk_score: 100,
    policy_type: "security"
  },
  {
    id: "fraud-2",
    pattern: /(?:urgent|immediate|asap|emergency)\s+(?:payment|transfer|action)/i,
    category: "Fraud",
    severity: "High",
    action: "BLOCK",
    risk_score: 90,
    policy_type: "security"
  },
  {
    id: "fraud-3",
    pattern: /(?:lottery|winner|prize|inheritance|million\s+dollars)/i,
    category: "Fraud",
    severity: "High",
    action: "BLOCK",
    risk_score: 95,
    policy_type: "security"
  },

  // ============================================================
  // TECHNICAL THREAT DETECTION
  // ============================================================
  {
    id: "tech-threat-1",
    pattern: /(?:union\s+select|drop\s+table|insert\s+into|delete\s+from)/i,
    category: "Technical Threat",
    severity: "High",
    action: "BLOCK",
    risk_score: 100,
    policy_type: "security"
  },
  {
    id: "tech-threat-2",
    pattern: /(?:'|"|;|--|\/\*|\*\/|xp_|sp_)/i,
    category: "Technical Threat",
    severity: "High",
    action: "BLOCK",
    risk_score: 90,
    policy_type: "security"
  },
  {
    id: "tech-threat-3",
    pattern: /(?:<script|javascript:|on\w+\s*=|alert\s*\()/i,
    category: "Technical Threat",
    severity: "High",
    action: "BLOCK",
    risk_score: 95,
    policy_type: "security"
  },
  {
    id: "tech-threat-4",
    pattern: /(?:&&|\|\||`|;|\$\(|eval\s*\()/i,
    category: "Technical Threat",
    severity: "High",
    action: "BLOCK",
    risk_score: 100,
    policy_type: "security"
  },

  // ============================================================
  // SUSPICIOUS PATTERNS
  // ============================================================
  {
    id: "suspicious-1",
    pattern: /\.(?:exe|bat|cmd|com|pif|scr|vbs|js|jar|dll|sh|php|asp|jsp)\b/i,
    category: "Suspicious",
    severity: "Medium",
    action: "WARN",
    risk_score: 50,
    policy_type: "security"
  },
  {
    id: "suspicious-2",
    pattern: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{5,}/,
    category: "Suspicious",
    severity: "Medium",
    action: "WARN",
    risk_score: 40,
    policy_type: "security"
  },
  {
    id: "suspicious-3",
    pattern: /^[\w!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{20,}$/,
    category: "Suspicious",
    severity: "Medium",
    action: "WARN",
    risk_score: 30,
    policy_type: "security"
  }
];

// =======================
// Helper functions
// =======================

export const findMatchingRule = (text) =>
  rules.find(rule => rule.pattern.test(text));

export const calculateRiskScore = (text) => {
  const rule = findMatchingRule(text);
  return rule ? rule.risk_score : 0;
};

export const getRulesByPolicyType = (policyType) =>
  rules.filter(rule => rule.policy_type === policyType);

export const getRulesByCategory = (category) =>
  rules.filter(rule => rule.category === category);

export const getRulesBySeverity = (severity) =>
  rules.filter(rule => rule.severity === severity);
