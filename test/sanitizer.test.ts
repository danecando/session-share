import { describe, expect, it } from "vitest";
import type { SessionSchema } from "@/lib/session-schema";
import { REDACTION_PLACEHOLDER, detectSecrets, redactText, sanitizeSession, sanitizeText } from "@/lib/sanitizer";

describe("detectSecrets", () => {
  describe("API keys", () => {
    it("detects OpenAI API keys", () => {
      const text = "My key is sk-abcdef1234567890abcdef1234567890abcdef12345678";
      const secrets = detectSecrets(text);
      expect(secrets).toHaveLength(1);
      expect(secrets[0].type).toBe("api_key");
      expect(secrets[0].match).toContain("sk-");
    });

    it("detects Anthropic API keys", () => {
      // Test the bare key (without assignment prefix)
      const text = "sk-ant-api03-abcdefghijklmnopqrstuvwxyz";
      const secrets = detectSecrets(text);
      expect(secrets).toHaveLength(1);
      expect(secrets[0].type).toBe("api_key");
      expect(secrets[0].match).toContain("sk-ant-");
    });

    it("detects Anthropic API keys in env var assignments", () => {
      // When in an assignment, the generic pattern may match - either way it gets redacted
      const text = "export ANTHROPIC_API_KEY=sk-ant-api03-abcdefghijklmnopqrstuvwxyz";
      const secrets = detectSecrets(text);
      expect(secrets.length).toBeGreaterThanOrEqual(1);
      // The secret is detected (either as api_key or generic_secret)
      expect(secrets[0].match).toContain("sk-ant-");
    });

    it("detects GitHub personal access tokens", () => {
      const text = "token: ghp_abcdefghijklmnopqrstuvwxyz1234567890";
      const secrets = detectSecrets(text);
      expect(secrets).toHaveLength(1);
      expect(secrets[0].type).toBe("api_key");
      expect(secrets[0].match).toContain("ghp_");
    });

    it("detects GitHub OAuth tokens", () => {
      const text = "token: gho_abcdefghijklmnopqrstuvwxyz1234567890";
      const secrets = detectSecrets(text);
      expect(secrets).toHaveLength(1);
      expect(secrets[0].type).toBe("api_key");
    });

    it("detects GitHub fine-grained PATs", () => {
      const text = "GITHUB_TOKEN=github_pat_11ABCDEFGH_0123456789abcdefghijklmn";
      const secrets = detectSecrets(text);
      expect(secrets).toHaveLength(1);
      expect(secrets[0].type).toBe("api_key");
    });

    it("detects Slack bot tokens", () => {
      const text = "SLACK_TOKEN=xoxb-123456789012-123456789012-abcdefghijklmnopqrstuvwx";
      const secrets = detectSecrets(text);
      expect(secrets).toHaveLength(1);
      expect(secrets[0].type).toBe("api_key");
    });

    it("detects Slack user tokens", () => {
      const text = "token=xoxp-123456789012-123456789012-abcdefghijklmnopqrstuvwx";
      const secrets = detectSecrets(text);
      expect(secrets).toHaveLength(1);
      expect(secrets[0].type).toBe("api_key");
    });

    it("detects NPM tokens", () => {
      // Test the bare token (without assignment)
      const text = "npm_abcdefghijklmnopqrstuvwxyz0123456789";
      const secrets = detectSecrets(text);
      expect(secrets).toHaveLength(1);
      expect(secrets[0].type).toBe("api_key");
    });

    it("detects NPM tokens in npmrc files", () => {
      // In config file format, may match generic pattern - either way it gets redacted
      const text = "//registry.npmjs.org/:_authToken=npm_abcdefghijklmnopqrstuvwxyz0123456789";
      const secrets = detectSecrets(text);
      expect(secrets.length).toBeGreaterThanOrEqual(1);
      expect(secrets[0].match).toContain("npm_");
    });
  });

  describe("AWS credentials", () => {
    it("detects AWS access key IDs", () => {
      const text = "AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE";
      const secrets = detectSecrets(text);
      expect(secrets).toHaveLength(1);
      expect(secrets[0].type).toBe("aws_credential");
      expect(secrets[0].match).toBe("AKIAIOSFODNN7EXAMPLE");
    });
  });

  describe("Bearer tokens", () => {
    it("detects Bearer tokens in headers", () => {
      const text = "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
      const secrets = detectSecrets(text);
      expect(secrets).toHaveLength(1);
      expect(secrets[0].type).toBe("bearer_token");
    });

    it("detects Bearer tokens case-insensitively", () => {
      const text = "authorization: bearer abc123def456ghi789jkl012mno345";
      const secrets = detectSecrets(text);
      expect(secrets).toHaveLength(1);
      expect(secrets[0].type).toBe("bearer_token");
    });
  });

  describe("Private keys", () => {
    it("detects RSA private keys", () => {
      const text = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA0m59l2u9iDnMbrXHfqkOrn2dVQ3vfBJqcDuFUK03d+1PZGbV
-----END RSA PRIVATE KEY-----`;
      const secrets = detectSecrets(text);
      expect(secrets).toHaveLength(1);
      expect(secrets[0].type).toBe("private_key");
    });

    it("detects OpenSSH private keys", () => {
      const text = `-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAA
-----END OPENSSH PRIVATE KEY-----`;
      const secrets = detectSecrets(text);
      expect(secrets).toHaveLength(1);
      expect(secrets[0].type).toBe("private_key");
    });

    it("detects EC private keys", () => {
      const text = `-----BEGIN EC PRIVATE KEY-----
MHQCAQEEICJxApEhZgfxXasGpR+zcPNsK9sW1pA
-----END EC PRIVATE KEY-----`;
      const secrets = detectSecrets(text);
      expect(secrets).toHaveLength(1);
      expect(secrets[0].type).toBe("private_key");
    });

    it("detects PGP private key blocks", () => {
      const text = `-----BEGIN PGP PRIVATE KEY BLOCK-----
lQPGBF5H5VcBCADHaEF
-----END PGP PRIVATE KEY BLOCK-----`;
      const secrets = detectSecrets(text);
      expect(secrets).toHaveLength(1);
      expect(secrets[0].type).toBe("private_key");
    });
  });

  describe("Connection strings", () => {
    it("detects PostgreSQL connection strings", () => {
      const text = "DATABASE_URL=postgres://user:password123@localhost:5432/mydb";
      const secrets = detectSecrets(text);
      expect(secrets).toHaveLength(1);
      expect(secrets[0].type).toBe("connection_string");
    });

    it("detects MySQL connection strings", () => {
      const text = "MYSQL_URL=mysql://admin:secretpass@db.example.com/production";
      const secrets = detectSecrets(text);
      expect(secrets).toHaveLength(1);
      expect(secrets[0].type).toBe("connection_string");
    });

    it("detects MongoDB connection strings", () => {
      const text = "MONGO_URI=mongodb://user:pass@cluster0.mongodb.net/db";
      const secrets = detectSecrets(text);
      expect(secrets).toHaveLength(1);
      expect(secrets[0].type).toBe("connection_string");
    });

    it("detects MongoDB+srv connection strings", () => {
      const text = "MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db";
      const secrets = detectSecrets(text);
      expect(secrets).toHaveLength(1);
      expect(secrets[0].type).toBe("connection_string");
    });

    it("detects Redis connection strings", () => {
      const text = "REDIS_URL=redis://:mypassword@redis.example.com:6379/0";
      const secrets = detectSecrets(text);
      expect(secrets).toHaveLength(1);
      expect(secrets[0].type).toBe("connection_string");
    });
  });

  describe("Password assignments", () => {
    it("detects password= assignments", () => {
      const text = "password=supersecret123";
      const secrets = detectSecrets(text);
      expect(secrets).toHaveLength(1);
      expect(secrets[0].type).toBe("password");
    });

    it("detects PASSWORD= assignments", () => {
      const text = 'PASSWORD="MySecret123!"';
      const secrets = detectSecrets(text);
      expect(secrets).toHaveLength(1);
      expect(secrets[0].type).toBe("password");
    });

    it("detects pwd= assignments", () => {
      const text = "pwd: mypassword123";
      const secrets = detectSecrets(text);
      expect(secrets).toHaveLength(1);
      expect(secrets[0].type).toBe("password");
    });

    it("detects secret= assignments", () => {
      const text = "secret=verysecretvalue123";
      const secrets = detectSecrets(text);
      expect(secrets).toHaveLength(1);
      expect(secrets[0].type).toBe("password");
    });
  });

  describe("Generic secrets", () => {
    it("detects API_KEY= assignments", () => {
      const text = "API_KEY=abcdef1234567890abcd";
      const secrets = detectSecrets(text);
      expect(secrets).toHaveLength(1);
      expect(secrets[0].type).toBe("generic_secret");
    });

    it("detects SECRET_KEY= assignments", () => {
      const text = "SECRET_KEY=mysupersecretkey123456";
      const secrets = detectSecrets(text);
      expect(secrets).toHaveLength(1);
      expect(secrets[0].type).toBe("generic_secret");
    });

    it("detects AUTH_TOKEN= assignments", () => {
      const text = "AUTH_TOKEN=token1234567890abcdef";
      const secrets = detectSecrets(text);
      expect(secrets).toHaveLength(1);
      expect(secrets[0].type).toBe("generic_secret");
    });

    it("detects ACCESS_TOKEN= assignments", () => {
      const text = "ACCESS_TOKEN=access_token_value_12345";
      const secrets = detectSecrets(text);
      expect(secrets).toHaveLength(1);
      expect(secrets[0].type).toBe("generic_secret");
    });
  });

  describe("Multiple secrets", () => {
    it("detects multiple secrets in same text", () => {
      const text = `DATABASE_URL=postgres://user:pass@localhost/db
GITHUB_TOKEN=ghp_abcdefghijklmnopqrstuvwxyz1234567890
API_KEY=mysupersecretapikey1234`;
      const secrets = detectSecrets(text);
      expect(secrets).toHaveLength(3);
    });
  });

  describe("False positive avoidance", () => {
    it("does not flag regular git commit hashes", () => {
      const text = "commit 8432362a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e";
      const secrets = detectSecrets(text);
      expect(secrets).toHaveLength(0);
    });

    it("does not flag UUIDs", () => {
      const text = "session-id: 550e8400-e29b-41d4-a716-446655440000";
      const secrets = detectSecrets(text);
      expect(secrets).toHaveLength(0);
    });

    it("does not flag base64 encoded images", () => {
      const text = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk";
      const secrets = detectSecrets(text);
      expect(secrets).toHaveLength(0);
    });

    it("does not flag short strings", () => {
      const text = "api_key=abc123"; // Too short to be a real secret
      const secrets = detectSecrets(text);
      expect(secrets).toHaveLength(0);
    });

    it("does not flag URLs without credentials", () => {
      const text = "postgres://localhost:5432/mydb";
      const secrets = detectSecrets(text);
      expect(secrets).toHaveLength(0);
    });
  });
});

describe("redactText", () => {
  it("replaces detected secrets with [REDACTED]", () => {
    const text = "My API key is sk-abcdefghijklmnopqrstuvwxyz123456";
    const secrets = detectSecrets(text);
    const result = redactText(text, secrets);
    expect(result).toBe(`My API key is ${REDACTION_PLACEHOLDER}`);
    expect(result).not.toContain("sk-");
  });

  it("handles multiple secrets", () => {
    const text = "Key1: sk-abc123456789012345678901 Key2: ghp_xyz123456789012345678901234567890123";
    const secrets = detectSecrets(text);
    const result = redactText(text, secrets);
    expect(result).toBe(`Key1: ${REDACTION_PLACEHOLDER} Key2: ${REDACTION_PLACEHOLDER}`);
  });

  it("returns original text when no secrets found", () => {
    const text = "This is normal text without secrets";
    const secrets = detectSecrets(text);
    const result = redactText(text, secrets);
    expect(result).toBe(text);
  });

  it("handles empty text", () => {
    const result = redactText("", []);
    expect(result).toBe("");
  });
});

describe("sanitizeText", () => {
  it("detects and redacts secrets in one call", () => {
    const text = "export OPENAI_API_KEY=sk-proj-abcdefghijklmnopqrstuvwxyz1234567890";
    const result = sanitizeText(text);
    expect(result).toContain(REDACTION_PLACEHOLDER);
    expect(result).not.toContain("sk-proj-");
  });
});

describe("sanitizeSession", () => {
  const createMinimalSession = (entries: SessionSchema["entries"]): SessionSchema => ({
    schemaVersion: "1",
    meta: { id: "test-session" },
    entries,
  });

  it("sanitizes message entries", () => {
    const session = createMinimalSession([
      {
        type: "message",
        role: "user",
        content: ["Here is my API key: sk-test123456789012345678901234"],
      },
    ]);

    const result = sanitizeSession(session);
    const entry = result.entries[0];
    expect(entry.type).toBe("message");
    if (entry.type === "message") {
      expect(entry.content[0]).toBe(`Here is my API key: ${REDACTION_PLACEHOLDER}`);
    }
  });

  it("sanitizes thinking entries", () => {
    const session = createMinimalSession([
      {
        type: "thinking",
        content: ["The user provided API_KEY=secretvalue12345678"],
      },
    ]);

    const result = sanitizeSession(session);
    const entry = result.entries[0];
    expect(entry.type).toBe("thinking");
    if (entry.type === "thinking") {
      expect(entry.content[0]).toContain(REDACTION_PLACEHOLDER);
    }
  });

  it("sanitizes tool_call entries", () => {
    const session = createMinimalSession([
      {
        type: "tool_call",
        name: "Bash",
        input: { command: "export API_KEY=mysecretkey1234567890" },
        result: { type: "text", text: "Key set to sk-abcdef123456789012345678" },
      },
    ]);

    const result = sanitizeSession(session);
    const entry = result.entries[0];
    expect(entry.type).toBe("tool_call");
    if (entry.type === "tool_call") {
      const input = entry.input as { command: string };
      expect(input.command).toContain(REDACTION_PLACEHOLDER);
      expect(entry.result?.type).toBe("text");
      if (entry.result?.type === "text") {
        expect(entry.result.text).toContain(REDACTION_PLACEHOLDER);
      }
    }
  });

  it("sanitizes summary entries", () => {
    const session = createMinimalSession([
      {
        type: "summary",
        content: "User configured their OPENAI_API_KEY=sk-secret12345678901234567890",
      },
    ]);

    const result = sanitizeSession(session);
    const entry = result.entries[0];
    expect(entry.type).toBe("summary");
    if (entry.type === "summary") {
      expect(entry.content).toContain(REDACTION_PLACEHOLDER);
    }
  });

  it("sanitizes write_file entries", () => {
    const session = createMinimalSession([
      {
        type: "write_file",
        path: ".env",
        content: "API_KEY=supersecretapikey12345678\nDEBUG=true",
      },
    ]);

    const result = sanitizeSession(session);
    const entry = result.entries[0];
    expect(entry.type).toBe("write_file");
    if (entry.type === "write_file") {
      expect(entry.content).toContain(REDACTION_PLACEHOLDER);
      expect(entry.content).toContain("DEBUG=true");
    }
  });

  it("sanitizes edit_file entries", () => {
    const session = createMinimalSession([
      {
        type: "edit_file",
        path: "config.js",
        oldContent: 'const key = "placeholder";',
        newContent: 'const key = "sk-realkey1234567890123456789012";',
      },
    ]);

    const result = sanitizeSession(session);
    const entry = result.entries[0];
    expect(entry.type).toBe("edit_file");
    if (entry.type === "edit_file") {
      expect(entry.oldContent).not.toContain(REDACTION_PLACEHOLDER);
      expect(entry.newContent).toContain(REDACTION_PLACEHOLDER);
    }
  });

  it("sanitizes todo_list entries", () => {
    const session = createMinimalSession([
      {
        type: "todo_list",
        todos: [
          { content: "Add API_KEY=secret1234567890123456 to env", status: "pending" as const },
          { content: "Test the feature", status: "completed" as const },
        ],
      },
    ]);

    const result = sanitizeSession(session);
    const entry = result.entries[0];
    expect(entry.type).toBe("todo_list");
    if (entry.type === "todo_list") {
      expect(entry.todos[0].content).toContain(REDACTION_PLACEHOLDER);
      expect(entry.todos[1].content).toBe("Test the feature");
    }
  });

  it("sanitizes task entries", () => {
    const session = createMinimalSession([
      {
        type: "task",
        name: "explore",
        content: ["Found config with API_KEY=secretvalue12345678901"],
      },
    ]);

    const result = sanitizeSession(session);
    const entry = result.entries[0];
    expect(entry.type).toBe("task");
    if (entry.type === "task") {
      expect(entry.content[0]).toContain(REDACTION_PLACEHOLDER);
    }
  });

  it("sanitizes plan entries", () => {
    const session = createMinimalSession([
      {
        type: "plan",
        status: "approved",
        title: "Setup API",
        content: "Configure API_KEY=supersecretvalue123456789",
        feedback: "Also add SECRET_KEY=anothersecret12345678901",
      },
    ]);

    const result = sanitizeSession(session);
    const entry = result.entries[0];
    expect(entry.type).toBe("plan");
    if (entry.type === "plan") {
      expect(entry.content).toContain(REDACTION_PLACEHOLDER);
      expect(entry.feedback).toContain(REDACTION_PLACEHOLDER);
    }
  });

  it("sanitizes questionnaire entries", () => {
    const session = createMinimalSession([
      {
        type: "questionnaire",
        questions: [
          { question: "What is your API key?", answer: "sk-myapikey12345678901234567890" },
          { question: "What is your name?", answer: "John" },
        ],
      },
    ]);

    const result = sanitizeSession(session);
    const entry = result.entries[0];
    expect(entry.type).toBe("questionnaire");
    if (entry.type === "questionnaire") {
      expect(entry.questions[0].answer).toContain(REDACTION_PLACEHOLDER);
      expect(entry.questions[1].answer).toBe("John");
    }
  });

  it("preserves session metadata", () => {
    const session: SessionSchema = {
      schemaVersion: "1",
      agent: { name: "Claude Code", version: "1.0.0" },
      meta: {
        id: "test-session",
        title: "Test Session",
        startedAt: "2025-01-01T00:00:00Z",
      },
      entries: [],
    };

    const result = sanitizeSession(session);
    expect(result.schemaVersion).toBe("1");
    expect(result.agent?.name).toBe("Claude Code");
    expect(result.meta.id).toBe("test-session");
    expect(result.meta.title).toBe("Test Session");
  });

  it("handles nested JSON in tool_call input", () => {
    const session = createMinimalSession([
      {
        type: "tool_call",
        name: "CustomTool",
        input: {
          config: {
            credentials: {
              apiKey: "sk-nestedkey123456789012345678",
              host: "example.com",
            },
          },
        },
      },
    ]);

    const result = sanitizeSession(session);
    const entry = result.entries[0];
    if (entry.type === "tool_call") {
      const input = entry.input as { config: { credentials: { apiKey: string; host: string } } };
      expect(input.config.credentials.apiKey).toContain(REDACTION_PLACEHOLDER);
      expect(input.config.credentials.host).toBe("example.com");
    }
  });
});
