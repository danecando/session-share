import type { JsonValue } from "./types";
import type {
  EditFileEntry,
  MessageEntry,
  PlanEntry,
  QuestionnaireEntry,
  SessionEntry,
  SessionSchema,
  SummaryEntry,
  TaskEntry,
  ThinkingEntry,
  TodoListEntry,
  ToolCallEntry,
  ToolOutput,
  WriteFileEntry,
} from "./session-schema";

// MARK: Types

/**
 * Types of secrets that can be detected
 */
export type SecretType =
  | "api_key"
  | "bearer_token"
  | "aws_credential"
  | "private_key"
  | "connection_string"
  | "password"
  | "generic_secret";

/**
 * Information about a detected secret in text
 */
export interface DetectedSecret {
  /** Type of secret detected */
  type: SecretType;
  /** Starting index in the original text */
  startIndex: number;
  /** Ending index in the original text (exclusive) */
  endIndex: number;
  /** The matched text (for debugging, not stored) */
  match: string;
}

/**
 * A pattern definition for detecting secrets
 */
export interface PatternDefinition {
  /** Unique identifier for the pattern */
  id: string;
  /** Type of secret this pattern detects */
  type: SecretType;
  /** Regular expression pattern */
  pattern: RegExp;
  /** Human-readable description */
  description: string;
}

// MARK: Patterns

/**
 * Pattern definitions for detecting various types of secrets
 */
export const PATTERNS: Array<PatternDefinition> = [
  // OpenAI API keys
  {
    id: "openai_api_key",
    type: "api_key",
    pattern: /sk-[A-Za-z0-9]{20,}/g,
    description: "OpenAI API key",
  },

  // Anthropic API keys
  {
    id: "anthropic_api_key",
    type: "api_key",
    pattern: /sk-ant-[A-Za-z0-9_-]{20,}/g,
    description: "Anthropic API key",
  },

  // GitHub tokens
  {
    id: "github_pat",
    type: "api_key",
    pattern: /ghp_[A-Za-z0-9]{36,}/g,
    description: "GitHub personal access token",
  },
  {
    id: "github_oauth",
    type: "api_key",
    pattern: /gho_[A-Za-z0-9]{36,}/g,
    description: "GitHub OAuth token",
  },
  {
    id: "github_pat_fine",
    type: "api_key",
    pattern: /github_pat_[A-Za-z0-9_]{22,}/g,
    description: "GitHub fine-grained personal access token",
  },

  // Slack tokens
  {
    id: "slack_bot",
    type: "api_key",
    pattern: /xoxb-[A-Za-z0-9-]{24,}/g,
    description: "Slack bot token",
  },
  {
    id: "slack_user",
    type: "api_key",
    pattern: /xoxp-[A-Za-z0-9-]{24,}/g,
    description: "Slack user token",
  },

  // NPM tokens
  {
    id: "npm_token",
    type: "api_key",
    pattern: /npm_[A-Za-z0-9]{36,}/g,
    description: "NPM access token",
  },

  // AWS credentials
  {
    id: "aws_access_key",
    type: "aws_credential",
    pattern: /AKIA[A-Z0-9]{16}/g,
    description: "AWS access key ID",
  },

  // Bearer tokens in headers/config
  {
    id: "bearer_token",
    type: "bearer_token",
    pattern: /Bearer\s+[A-Za-z0-9_-]{20,}/gi,
    description: "Bearer authentication token",
  },

  // Private keys (RSA, OpenSSH, etc.)
  {
    id: "rsa_private_key",
    type: "private_key",
    pattern: /-----BEGIN RSA PRIVATE KEY-----[\s\S]*?-----END RSA PRIVATE KEY-----/g,
    description: "RSA private key",
  },
  {
    id: "openssh_private_key",
    type: "private_key",
    pattern: /-----BEGIN OPENSSH PRIVATE KEY-----[\s\S]*?-----END OPENSSH PRIVATE KEY-----/g,
    description: "OpenSSH private key",
  },
  {
    id: "generic_private_key",
    type: "private_key",
    pattern:
      /-----BEGIN (?:EC |DSA |ENCRYPTED )?PRIVATE KEY-----[\s\S]*?-----END (?:EC |DSA |ENCRYPTED )?PRIVATE KEY-----/g,
    description: "Generic private key",
  },
  {
    id: "pgp_private_key",
    type: "private_key",
    pattern: /-----BEGIN PGP PRIVATE KEY BLOCK-----[\s\S]*?-----END PGP PRIVATE KEY BLOCK-----/g,
    description: "PGP private key",
  },

  // Connection strings with credentials
  {
    id: "postgres_url",
    type: "connection_string",
    pattern: /postgres(?:ql)?:\/\/[^:]+:[^@]+@[^\s"']+/gi,
    description: "PostgreSQL connection string with credentials",
  },
  {
    id: "mysql_url",
    type: "connection_string",
    pattern: /mysql:\/\/[^:]+:[^@]+@[^\s"']+/gi,
    description: "MySQL connection string with credentials",
  },
  {
    id: "mongodb_url",
    type: "connection_string",
    pattern: /mongodb(?:\+srv)?:\/\/[^:]+:[^@]+@[^\s"']+/gi,
    description: "MongoDB connection string with credentials",
  },
  {
    id: "redis_url",
    type: "connection_string",
    pattern: /redis:\/\/[^:]*:[^@]+@[^\s"']+/gi,
    description: "Redis connection string with credentials",
  },

  // Password assignments (in config files, env vars, etc.)
  {
    id: "password_assignment",
    type: "password",
    pattern: /(?:password|passwd|pwd|secret)[\s]*[=:][\s]*["']?[^\s"']{8,}["']?/gi,
    description: "Password assignment",
  },

  // Generic API key patterns (env var style)
  {
    id: "generic_api_key",
    type: "generic_secret",
    pattern: /(?:API_KEY|APIKEY|api_key|apiKey)[\s]*[=:][\s]*["']?[A-Za-z0-9_-]{16,}["']?/g,
    description: "Generic API key assignment",
  },
  {
    id: "generic_secret_key",
    type: "generic_secret",
    pattern: /(?:SECRET_KEY|SECRETKEY|secret_key|secretKey)[\s]*[=:][\s]*["']?[A-Za-z0-9_-]{16,}["']?/g,
    description: "Generic secret key assignment",
  },
  {
    id: "generic_auth_token",
    type: "generic_secret",
    pattern: /(?:AUTH_TOKEN|AUTHTOKEN|auth_token|authToken)[\s]*[=:][\s]*["']?[A-Za-z0-9_-]{16,}["']?/g,
    description: "Generic auth token assignment",
  },
  {
    id: "generic_access_token",
    type: "generic_secret",
    pattern: /(?:ACCESS_TOKEN|ACCESSTOKEN|access_token|accessToken)[\s]*[=:][\s]*["']?[A-Za-z0-9_-]{16,}["']?/g,
    description: "Generic access token assignment",
  },
];

// MARK: Detection

/**
 * Detects secrets in the given text using pattern matching.
 * Returns an array of detected secrets with their positions.
 * Handles overlapping matches by keeping the longer match.
 */
export function detectSecrets(text: string): Array<DetectedSecret> {
  const allMatches: Array<DetectedSecret> = [];

  for (const patternDef of PATTERNS) {
    // Reset regex state for each pattern (important for global regexes)
    const regex = new RegExp(patternDef.pattern.source, patternDef.pattern.flags);

    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      allMatches.push({
        type: patternDef.type,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        match: match[0],
      });
    }
  }

  // Sort by start index, then by length (longer first)
  allMatches.sort((a, b) => {
    if (a.startIndex !== b.startIndex) {
      return a.startIndex - b.startIndex;
    }
    // For same start, prefer longer matches
    return b.endIndex - b.startIndex - (a.endIndex - a.startIndex);
  });

  // Remove overlapping matches (keep longer/earlier ones)
  const filtered: Array<DetectedSecret> = [];
  let lastEnd = -1;

  for (const secret of allMatches) {
    // Skip if this match overlaps with a previous one
    if (secret.startIndex < lastEnd) {
      continue;
    }
    filtered.push(secret);
    lastEnd = secret.endIndex;
  }

  return filtered;
}

// MARK: Redaction

/**
 * The placeholder text used to replace detected secrets
 */
export const REDACTION_PLACEHOLDER = "[REDACTED]";

/**
 * Redacts detected secrets from text by replacing them with [REDACTED].
 * Processes matches in reverse order to preserve indices.
 */
export function redactText(text: string, secrets: Array<DetectedSecret>): string {
  if (secrets.length === 0) {
    return text;
  }

  // Sort by start index in reverse order to process from end to beginning
  // This preserves indices as we make replacements
  const sortedSecrets = [...secrets].sort((a, b) => b.startIndex - a.startIndex);

  let result = text;
  for (const secret of sortedSecrets) {
    result = result.slice(0, secret.startIndex) + REDACTION_PLACEHOLDER + result.slice(secret.endIndex);
  }

  return result;
}

// MARK: Sanitization Helpers

/**
 * Sanitizes a text string by detecting and redacting secrets.
 */
export function sanitizeText(text: string): string {
  const secrets = detectSecrets(text);
  return redactText(text, secrets);
}

/**
 * Recursively sanitizes a JsonValue, redacting secrets in all string values.
 */
function sanitizeJsonValue(value: JsonValue): JsonValue {
  if (value === null) {
    return null;
  }

  if (typeof value === "string") {
    return sanitizeText(value);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeJsonValue);
  }

  // Object
  const result: { [key: string]: JsonValue } = {};
  for (const [key, val] of Object.entries(value)) {
    result[key] = sanitizeJsonValue(val);
  }
  return result;
}

/**
 * Sanitizes a ToolOutput by redacting secrets in text and json data.
 */
function sanitizeToolOutput(output: ToolOutput): ToolOutput {
  switch (output.type) {
    case "text":
      return { type: "text", text: sanitizeText(output.text) };
    case "json":
      return { type: "json", data: sanitizeJsonValue(output.data) };
    case "error":
      return {
        type: "error",
        message: sanitizeText(output.message),
        ...(output.data !== undefined && { data: sanitizeJsonValue(output.data) }),
      };
  }
}

// MARK: Entry Sanitizers

/**
 * Sanitizes a MessageEntry by redacting secrets in content.
 */
function sanitizeMessageEntry(entry: MessageEntry): MessageEntry {
  return {
    ...entry,
    content: entry.content.map(sanitizeText),
  };
}

/**
 * Sanitizes a ThinkingEntry by redacting secrets in content.
 */
function sanitizeThinkingEntry(entry: ThinkingEntry): ThinkingEntry {
  return {
    ...entry,
    content: entry.content.map(sanitizeText),
    ...(entry.description && { description: sanitizeText(entry.description) }),
  };
}

/**
 * Sanitizes a ToolCallEntry by redacting secrets in input and result.
 */
function sanitizeToolCallEntry(entry: ToolCallEntry): ToolCallEntry {
  return {
    ...entry,
    input: sanitizeJsonValue(entry.input),
    ...(entry.result && { result: sanitizeToolOutput(entry.result) }),
    ...(entry.description && { description: sanitizeText(entry.description) }),
  };
}

/**
 * Sanitizes a SummaryEntry by redacting secrets in content.
 */
function sanitizeSummaryEntry(entry: SummaryEntry): SummaryEntry {
  return {
    ...entry,
    content: sanitizeText(entry.content),
  };
}

/**
 * Sanitizes a WriteFileEntry by redacting secrets in content.
 */
function sanitizeWriteFileEntry(entry: WriteFileEntry): WriteFileEntry {
  return {
    ...entry,
    content: sanitizeText(entry.content),
  };
}

/**
 * Sanitizes an EditFileEntry by redacting secrets in old and new content.
 */
function sanitizeEditFileEntry(entry: EditFileEntry): EditFileEntry {
  return {
    ...entry,
    oldContent: sanitizeText(entry.oldContent),
    newContent: sanitizeText(entry.newContent),
  };
}

/**
 * Sanitizes a TodoListEntry by redacting secrets in todo content.
 */
function sanitizeTodoListEntry(entry: TodoListEntry): TodoListEntry {
  return {
    ...entry,
    todos: entry.todos.map((todo) => ({
      ...todo,
      content: sanitizeText(todo.content),
    })),
  };
}

/**
 * Sanitizes a TaskEntry by redacting secrets in content and nested tool calls.
 */
function sanitizeTaskEntry(entry: TaskEntry): TaskEntry {
  return {
    ...entry,
    content: entry.content.map(sanitizeText),
    ...(entry.toolCalls && {
      toolCalls: entry.toolCalls.map(sanitizeToolCallEntry),
    }),
  };
}

/**
 * Sanitizes a PlanEntry by redacting secrets in content and feedback.
 */
function sanitizePlanEntry(entry: PlanEntry): PlanEntry {
  return {
    ...entry,
    content: sanitizeText(entry.content),
    ...(entry.feedback && { feedback: sanitizeText(entry.feedback) }),
  };
}

/**
 * Sanitizes a QuestionnaireEntry by redacting secrets in questions and answers.
 */
function sanitizeQuestionnaireEntry(entry: QuestionnaireEntry): QuestionnaireEntry {
  return {
    ...entry,
    questions: entry.questions.map((qa) => ({
      question: sanitizeText(qa.question),
      ...(qa.answer && { answer: sanitizeText(qa.answer) }),
    })),
  };
}

/**
 * Sanitizes a single session entry based on its type.
 */
function sanitizeEntry(entry: SessionEntry): SessionEntry {
  switch (entry.type) {
    case "message":
      return sanitizeMessageEntry(entry);
    case "thinking":
      return sanitizeThinkingEntry(entry);
    case "tool_call":
      return sanitizeToolCallEntry(entry);
    case "summary":
      return sanitizeSummaryEntry(entry);
    case "write_file":
      return sanitizeWriteFileEntry(entry);
    case "edit_file":
      return sanitizeEditFileEntry(entry);
    case "todo_list":
      return sanitizeTodoListEntry(entry);
    case "task":
      return sanitizeTaskEntry(entry);
    case "plan":
      return sanitizePlanEntry(entry);
    case "questionnaire":
      return sanitizeQuestionnaireEntry(entry);
  }
}

// MARK: Main Export

/**
 * Sanitizes an entire session by redacting secrets from all entries.
 * This is the main entry point for session sanitization.
 */
export function sanitizeSession(session: SessionSchema): SessionSchema {
  return {
    ...session,
    entries: session.entries.map(sanitizeEntry),
  };
}
