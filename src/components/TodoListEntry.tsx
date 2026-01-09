import * as React from "react";
import { CheckCircle2, ChevronRight, Circle, ListChecks, Loader2 } from "lucide-react";
import type { TodoItem, TodoListEntry as TodoListEntryType } from "@/lib/session-schema";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface TodoListEntryProps {
  entry: TodoListEntryType;
}

function TodoItemRow({ item }: { item: TodoItem }) {
  const Icon = item.status === "completed" ? CheckCircle2 : item.status === "in_progress" ? Loader2 : Circle;

  return (
    <li className="flex items-start gap-2 text-sm">
      <Icon
        className={cn(
          "h-4 w-4 mt-0.5 shrink-0",
          item.status === "completed" && "text-green-500",
          item.status === "in_progress" && "text-blue-500 animate-spin",
          item.status === "pending" && "text-muted-foreground"
        )}
      />
      <span className={cn(item.status === "completed" && "text-muted-foreground line-through")}>{item.content}</span>
    </li>
  );
}

export function TodoListEntry({ entry }: TodoListEntryProps) {
  if (entry.todos.length === 0) return null;

  const [isOpen, setIsOpen] = React.useState(false);
  const completedCount = entry.todos.filter((t) => t.status === "completed").length;
  const totalCount = entry.todos.length;

  // Find the current in-progress todo
  const currentIndex = entry.todos.findIndex((t) => t.status === "in_progress");
  const hasCurrent = currentIndex !== -1;
  const currentTodo = hasCurrent ? entry.todos[currentIndex] : null;
  const hasTodos = totalCount > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <ListChecks className="h-4 w-4 text-teal-500" />
          <span>
            Todos ({completedCount}/{totalCount})
          </span>
        </div>

        {!isOpen && currentTodo && (
          <ul className="space-y-1.5">
            <TodoItemRow item={currentTodo} />
          </ul>
        )}

        {!isOpen && hasTodos && (
          <CollapsibleTrigger className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200" />
            Show all todos
          </CollapsibleTrigger>
        )}

        <CollapsibleContent className="space-y-2">
          <ul className="space-y-1.5">
            {entry.todos.map((item, index) => (
              <TodoItemRow key={index} item={item} />
            ))}
          </ul>

          {hasTodos && (
            <CollapsibleTrigger className="flex items-center gap-1.5 pt-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <ChevronRight className="h-3.5 w-3.5 -rotate-90 transition-transform duration-200" />
              Show less
            </CollapsibleTrigger>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
