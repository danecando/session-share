import { CollapsiblePanel } from "./CollapsiblePanel";
import type { TaskEntry as TaskEntryType } from "@/lib/session-schema";

interface TaskEntryProps {
  entry: TaskEntryType;
}

function TaskTree({ tasks }: { tasks: Array<string> }) {
  const textTasks = tasks.filter((text) => text.trim());

  return (
    <div className="font-mono text-sm space-y-1">
      {textTasks.map((text, index) => {
        const isLast = index === textTasks.length - 1;
        const prefix = isLast ? "└─" : "├─";

        return (
          <div key={index} className="text-muted-foreground">
            <div className="flex gap-2">
              <span className="opacity-50">{prefix}</span>
              <span>{text}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TaskEntry({ entry }: TaskEntryProps) {
  const taskCount = entry.content.filter((text) => text.trim()).length;

  if (taskCount === 0) {
    return null;
  }

  const taskLabel = taskCount === 1 ? "task" : "tasks";

  return (
    <div>
      <CollapsiblePanel
        title={
          <span className="text-sm font-medium text-foreground">
            {`${taskCount} ${entry.name} ${taskLabel} completed`}
          </span>
        }
        defaultOpen={true}
      >
        <TaskTree tasks={entry.content} />
      </CollapsiblePanel>
    </div>
  );
}
