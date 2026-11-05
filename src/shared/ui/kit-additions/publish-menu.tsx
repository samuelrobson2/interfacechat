import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { GlobeIcon } from "@/shared/assets/icons/general/Globe";
import { PencilEditIcon } from "@/shared/assets/icons/general/PencilEdit";
import { PlusIcon } from "@/shared/assets/icons/general/Plus";
import { cn } from "@/shared/lib/css";
import { Button } from "@/shared/ui/kit/button";
import { SidebarCard } from "@/shared/ui/kit/sidebar";
import { Text } from "@/shared/ui/kit/text";

import { ToolbarButton } from "./toolbar-button";

const APP_DOMAIN = ".adaption.app";

// Same frosted-glass panel recipe as the editor toolbar's pills
// (`GLASS_PANEL` in the interface editor's glass.ts) — duplicated here rather
// than imported so this shared composite doesn't reach into feature code.
const GLASS_PANEL =
  "bg-white/80 backdrop-blur-xl backdrop-saturate-150 " +
  "shadow-[0_10px_30px_-14px_rgba(20,18,30,0.4)] " +
  "hairline [--hairline-color:var(--color-gray-3)] [--hairline-opacity:0.35]";

/**
 * Publish menu: a pill that opens a card for taking the interface live —
 * an editable `*.adaption.app` subdomain, an option to attach a custom
 * domain, and a Publish button. No backend behind this demo, so publishing
 * is cosmetic; the control exists to match the real product's design.
 */
export function PublishMenu() {
  const [open, setOpen] = useState(false);
  const [subdomain, setSubdomain] = useState("");
  const [addingDomain, setAddingDomain] = useState(false);
  const [customDomain, setCustomDomain] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const domainInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (addingDomain) domainInputRef.current?.focus();
  }, [addingDomain]);

  return (
    <div ref={ref} className="pointer-events-auto relative">
      <SidebarCard className="w-auto flex-row items-center overflow-visible p-1.5 md:w-auto">
        <ToolbarButton
          icon={<GlobeIcon svgClasses="size-4" pathProps={{ stroke: "currentColor" }} />}
          label="Publish"
          active={open}
          aria-expanded={open}
          // Always named: publishing is the one action worth spelling out.
          expanded
          onClick={() => setOpen((v) => !v)}
        />
      </SidebarCard>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            className={cn(
              "absolute left-1/2 top-full z-50 mt-2 w-[380px] max-w-[calc(100vw-2rem)] origin-top -translate-x-1/2 rounded-[20px] p-5 font-bureau font-thin [--hairline-radius:20px]",
              GLASS_PANEL,
            )}
          >
            <div className="flex items-center justify-between">
              <Text variant="title" className="font-thin">
                Publish
              </Text>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex size-7 items-center justify-center rounded-full text-typography-secondary transition-colors hover:bg-gray-6/60 hover:text-typography-primary"
              >
                <X className="size-4" />
              </button>
            </div>
            <span className="mt-1 block font-bureau text-[13px] font-thin text-typography-secondary">
              Publish a public link to your live app.
            </span>

            <div className="my-4 h-px bg-gray-2" />

            <span className="mb-2 block font-bureau text-[13px] font-thin text-typography-primary">
              Your app URL
            </span>
            <div className="flex items-center gap-2 rounded-[10px] px-3 py-2.5 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 focus-within:shadow-[var(--shadow-border-hover)]">
              <div className="flex min-w-0 flex-1 items-baseline">
                <input
                  ref={urlInputRef}
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value)}
                  placeholder="example"
                  className="min-w-0 flex-1 bg-transparent font-bureau text-[13px] font-thin text-typography-primary outline-none placeholder:text-typography-primary"
                />
                <span className="shrink-0 font-bureau text-[13px] font-thin text-typography-secondary">
                  {APP_DOMAIN}
                </span>
              </div>
              <button
                type="button"
                onClick={() => urlInputRef.current?.focus()}
                aria-label="Edit app URL"
                className="flex size-7 shrink-0 items-center justify-center rounded-[8px] text-typography-secondary transition-colors hover:bg-gray-6/60 hover:text-typography-primary"
              >
                <PencilEditIcon svgClasses="size-4" pathProps={{ stroke: "currentColor" }} />
              </button>
            </div>

            {addingDomain ? (
              <input
                ref={domainInputRef}
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setAddingDomain(false);
                  if (e.key === "Escape") {
                    setAddingDomain(false);
                    setCustomDomain("");
                  }
                }}
                onBlur={() => setAddingDomain(false)}
                placeholder="yourdomain.com"
                className="mt-4 w-full rounded-[10px] px-3 py-2.5 font-bureau text-[13px] font-thin text-typography-primary shadow-[var(--shadow-border)] outline-none focus:shadow-[var(--shadow-border-hover)]"
              />
            ) : (
              <button
                type="button"
                onClick={() => setAddingDomain(true)}
                className="mt-4 flex items-center gap-2 text-typography-secondary transition-colors hover:text-typography-primary"
              >
                <PlusIcon svgClasses="size-4" pathProps={{ stroke: "currentColor" }} />
                <span className="font-bureau text-[13px] font-thin">
                  {customDomain ? customDomain : "Add custom domain"}
                </span>
              </button>
            )}

            <div className="my-4 h-px bg-gray-2" />

            <div className="flex justify-end">
              <Button
                variant="black"
                size="40"
                radius="rounded"
                className="font-thin"
                onClick={() => setOpen(false)}
              >
                Publish
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
