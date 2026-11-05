import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/shared/lib/css";
import {
  agentActivity,
  type AgentActivity,
  type AgentActivityKind,
} from "../model/agent-activity";
import { useChatLabSession } from "../model/chat-lab-session";

const LABEL: Record<AgentActivityKind, string> = {
  thinking: "Thinking",
  searching: "Searching",
  writing: "Writing",
};

/** The animated mark for what the agent is doing. No plate behind it. */
export function LiveIcon({
  kind,
  className,
}: {
  kind: AgentActivityKind;
  className?: string;
}) {
  const reduced = useReducedMotion();

  if (kind === "writing") {
    return (
      <span className={cn("flex h-4 items-end gap-[3px] text-typography-primary", className)} aria-hidden>
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className="w-[3px] origin-bottom rounded-full bg-current"
            animate={reduced ? { height: 8 } : { height: [4, 16, 4] }}
            transition={{
              duration: 0.8,
              repeat: reduced ? 0 : Infinity,
              ease: "easeInOut",
              delay: index * 0.12,
            }}
          />
        ))}
      </span>
    );
  }

  if (kind === "searching") {
    return (
      <motion.svg
        aria-hidden
        viewBox="0 0 24 24"
        className={cn("size-6 text-typography-primary", className)}
        fill="none"
        animate={reduced ? undefined : { rotate: 360 }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
      >
        <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" />
        <path d="M15.5 15.5 20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </motion.svg>
    );
  }

  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 24 24"
      className={cn("size-6 text-typography-primary", className)}
      fill="none"
      animate={reduced ? undefined : { scale: [1, 1.15, 1], opacity: [1, 0.55, 1] }}
      transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
    >
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" opacity="0.45" />
    </motion.svg>
  );
}

/** What the agent is doing, revealed beside the icon. */
export function ActivityDetail({ activity }: { activity: AgentActivity }) {
  const searching = activity.kind === "searching";

  return (
    <div
      className={cn(
        "flex min-w-[140px] flex-col gap-1.5 rounded-[18px] bg-background-primary/90 px-3 py-2 shadow-elevated backdrop-blur-sm",
        searching && activity.sources?.length && "min-w-[220px]",
      )}
    >
      <span className="text-[13px] leading-none text-typography-primary">
        {LABEL[activity.kind]}
      </span>
      {searching && activity.query && (
        <span className="text-[12px] leading-[1.3] text-typography-secondary">
          {activity.query}
        </span>
      )}
      {searching && !!activity.sources?.length && (
        <span className="flex flex-col gap-1">
          {activity.sources.map((source) => (
            <span
              key={source}
              className="truncate text-[12px] leading-none text-typography-secondary"
            >
              {source}
            </span>
          ))}
        </span>
      )}
    </div>
  );
}

/**
 * Inline, where a reply shows its status. The activity's own 3D icon floats
 * with no plate; hover grows a description of what it is doing.
 */
export function AgentIsland({ className }: { className?: string }) {
  const { messages, status } = useChatLabSession();
  const activity = agentActivity(messages, status);
  const [open, setOpen] = useState(false);

  return (
    <AnimatePresence>
      {activity && (
        <div
          className={cn("inline-flex items-center gap-2", className)}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <LiveIcon kind={activity.kind} />
          <AnimatePresence>
            {open && (
              <motion.div
                key="detail"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ type: "spring", bounce: 0.16, duration: 0.4 }}
                className="overflow-hidden"
              >
                <ActivityDetail activity={activity} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}
