import { CornerDownRight, HelpCircle } from "lucide-react";
import type { QuestionAnswer, QuestionnaireEntry as QuestionnaireEntryType } from "@/lib/session-schema";

interface QuestionnaireEntryProps {
  entry: QuestionnaireEntryType;
}

function QuestionRow({ item }: { item: QuestionAnswer }) {
  if (!item.question) return null;

  return (
    <li className="space-y-1">
      <div className="text-sm text-muted-foreground">{item.question}</div>
      {item.answer && (
        <div className="flex items-start gap-2 text-sm font-medium text-foreground">
          <CornerDownRight className="mt-0.5 h-3.5 w-3.5 text-muted-foreground/60" />
          <span>{item.answer}</span>
        </div>
      )}
    </li>
  );
}

export function QuestionnaireEntry({ entry }: QuestionnaireEntryProps) {
  const validQuestions = entry.questions.filter((q) => q.question);
  if (validQuestions.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <HelpCircle className="h-4 w-4 text-amber-500" />
        <span>User answered questions</span>
      </div>
      <ul className="space-y-3">
        {validQuestions.map((item, index) => (
          <QuestionRow key={index} item={item} />
        ))}
      </ul>
    </div>
  );
}
