// MARK: Base Types

export type CCRole = "user" | "assistant" | "system";

export type CCUsage = {
  input_tokens?: number;
  output_tokens?: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
  service_tier?: string;
  cache_creation?: {
    ephemeral_5m_input_tokens?: number;
    ephemeral_1h_input_tokens?: number;
  };
};

export type CCMessage = {
  role?: CCRole;
  content?: Array<CCContentPart> | string;
  model?: string;
  id?: string;
  type?: "message";
  stop_reason?: string | null;
  stop_sequence?: string | null;
  usage?: CCUsage;
};

export type CCThinkingMetadata = {
  level?: string;
  disabled?: boolean;
  triggers?: Array<string>;
};

export type CCTodo = {
  content?: string;
  status?: "pending" | "in_progress" | "completed" | string;
  activeForm?: string;
};

export type CCToolUseResult = {
  filePath?: string;
  oldString?: string;
  newString?: string;
  originalFile?: string;
  structuredPatch?: Array<{
    oldStart?: number;
    oldLines?: number;
    newStart?: number;
    newLines?: number;
    lines?: Array<string>;
  }>;
  userModified?: boolean;
  replaceAll?: boolean;
  oldTodos?: Array<CCTodo>;
  newTodos?: Array<CCTodo>;
};

// MARK: Content Parts

export type CCContentPart = CCTextPart | CCThinkingPart | CCToolUsePart | CCToolResultPart | CCImagePart | CCCodePart;

export type CCTextPart = {
  type: "text";
  text: string;
};

export type CCThinkingPart = {
  type: "thinking";
  thinking: string;
  signature?: string;
};

export type CCToolUsePart = {
  type: "tool_use";
  id: string;
  name: string;
  input?: Record<string, unknown>;
};

export type CCToolResultPart = {
  type: "tool_result";
  tool_use_id: string;
  content?: Array<CCContentPart> | string | Record<string, unknown>;
  name?: string;
};

export type CCImageSource = {
  type: "base64";
  media_type: string;
  data: string;
};

export type CCImagePart = {
  type: "image";
  url?: string;
  path?: string;
  source?: CCImageSource;
};

export type CCCodePart = {
  type: "code";
  text: string;
  language?: string;
};

export type CCBaseEntry = {
  uuid?: string;
  parentUuid?: string | null;
  logicalParentUuid?: string | null;
  isSidechain?: boolean;
  userType?: string;
  cwd?: string;
  sessionId?: string;
  version?: string;
  gitBranch?: string;
  slug?: string;
  timestamp?: string;
  isMeta?: boolean;
  isVisibleInTranscriptOnly?: boolean;
  isCompactSummary?: boolean;
  thinkingMetadata?: CCThinkingMetadata;
  todos?: Array<CCTodo>;
  toolUseResult?: CCToolUseResult;
  requestId?: string;
  level?: string;
  subtype?: string;
  content?: string;
};

// MARK: Snapshot Entries

export type CCBackupMeta = {
  backupFileName: string | null;
  version?: number;
  backupTime?: string;
};

export type CCFileHistorySnapshot = {
  messageId?: string;
  trackedFileBackups?: Record<string, CCBackupMeta>;
  timestamp?: string;
};

export type CCFileHistorySnapshotEntry = CCBaseEntry & {
  type: "file-history-snapshot";
  messageId: string;
  snapshot: CCFileHistorySnapshot;
  isSnapshotUpdate?: boolean;
};

// MARK: Summary Entries

export type CCSummaryEntry = CCBaseEntry & {
  type: "summary";
  summary: string;
  leafUuid?: string;
};

// MARK: Custom Title Entries

export type CCCustomTitleEntry = CCBaseEntry & {
  type: "custom-title";
  customTitle: string;
};

// MARK: Message Entries

export type CCUserEntry = CCBaseEntry & {
  type: "user";
  message: CCMessage;
};

export type CCAssistantEntry = CCBaseEntry & {
  type: "assistant";
  message: CCMessage;
};

export type CCSystemMessageEntry = CCBaseEntry & {
  type: "system";
  message: CCMessage;
};

export type CCSystemEventEntry = CCBaseEntry & {
  type: "system";
  message?: undefined;
};

export type CCChatEntry = CCUserEntry | CCAssistantEntry | CCSystemMessageEntry;

export type CCLogEntry =
  | CCSummaryEntry
  | CCCustomTitleEntry
  | CCFileHistorySnapshotEntry
  | CCChatEntry
  | CCSystemEventEntry;
