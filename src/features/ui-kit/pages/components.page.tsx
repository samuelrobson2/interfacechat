import { useEffect, useRef, useState } from "react";
import {
  ChatComposerAttachButton,
  ChatComposerMicButton,
  ChatComposerSendButton,
  ChatComposerStopButton,
  ChatGradientFrame,
  ChatGrayFrame,
  ChatHighlightFrame,
  ChatInlineComposer,
  ChatPillButton,
  ChatSuggestionCard,
  ChatTextareaComposer,
} from "@/services/chat";
import {
  ChatInteractiveFrame,
  ChatInteractiveFrameDots,
  ChatInteractiveFrameHeader,
  ChatSaveInterfaceButton,
  ChatSaveInterfaceButtonIcon,
  ChatSaveInterfaceButtonLabel,
  DraftCard,
  type InterfaceDraft,
  type SaveInterfaceStatus,
} from "@/shared/ui/kit-additions";
import { PlusSmallIcon } from "@/shared/assets/icons/outlined/PlusSmall";
import { BarChart3, MessageSquare, SlidersHorizontal } from "lucide-react";
import {
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checklist,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  ComparisonCard,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  List,
  ListItem,
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
  Text,
  Timeline,
  TimelineBody,
  TimelineDescription,
  TimelineHeader,
  TimelineTitle,
} from "@/shared/ui/kit";
import { GalleryPage, Section, Specimen } from "../ui-kit-parts";

// The Components tab — higher-level kit pieces composed from multiple
// primitives (overlays, selection widgets, cards, flows). Everything imports
// from `@/shared/ui/kit`; the base building blocks live under "Primitives".

const FRAMEWORKS = ["React", "Vue", "Angular", "Svelte"];

const SAMPLE_DRAFTS: InterfaceDraft[] = [
  {
    key: "chat",
    title: "Chat",
    description:
      "A chat interface which lets analysts chat with your model in plain language.",
    prompt: "Build a chat interface…",
    icon: MessageSquare,
  },
  {
    key: "playground",
    title: "Playground",
    description:
      "An interface which lets analysts tweak inputs and stress-test scenarios.",
    prompt: "Build a playground…",
    icon: SlidersHorizontal,
  },
  {
    key: "analytics",
    title: "Analytics",
    description:
      "A dashboard which turns your model's outputs into forecasts and trends.",
    prompt: "Build an analytics dashboard…",
    icon: BarChart3,
  },
];

/** Local demo of the save state machine (the real hook is API-backed). */
function useSaveDemo(delayMs = 1400) {
  const [status, setStatus] = useState<SaveInterfaceStatus>("idle");
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  const save = () => {
    setStatus((s) => {
      if (s !== "idle") return s;
      timers.current.push(window.setTimeout(() => setStatus("saved"), delayMs));
      return "saving";
    });
  };
  const reset = () => setStatus("idle");
  return { status, save, reset };
}

function SaveDemo() {
  const { status, save, reset } = useSaveDemo();
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center gap-2">
        <ChatSaveInterfaceButton status={status} onSave={save}>
          <ChatSaveInterfaceButtonIcon idleIcon={PlusSmallIcon} />
          <ChatSaveInterfaceButtonLabel />
        </ChatSaveInterfaceButton>
        <button
          type="button"
          onClick={reset}
          disabled={status === "idle"}
          className="text-typography-secondary text-[13px] underline disabled:opacity-40"
        >
          reset
        </button>
      </div>
      <ChatInteractiveFrame status={status} className="w-full">
        <ChatInteractiveFrameHeader border>
          <ChatInteractiveFrameDots />
        </ChatInteractiveFrameHeader>
        <div className="flex flex-col gap-3 p-6">
          <Text variant="body" weight="regular">
            Your generated interface
          </Text>
          <Text variant="label" color="secondary">
            The frame border/shadow tracks the save status — hairline while
            idle, a shimmering rose ring while saving, a soft glow once saved.
          </Text>
          <div className="flex gap-2">
            <div className="h-16 flex-1 rounded-[8px] bg-gray-6" />
            <div className="h-16 flex-1 rounded-[8px] bg-gray-6" />
          </div>
        </div>
      </ChatInteractiveFrame>
    </div>
  );
}

function ComponentsPage() {
  const [big, setBig] = useState("");
  const [inline, setInline] = useState("");
  const [staged, setStaged] = useState<string | null>("chat");

  const bigTyping = big.trim().length > 0;
  const inlineTyping = inline.trim().length > 0;

  return (
    <GalleryPage>
      <Text variant="body" color="secondary">
        Composed components — each built from several primitives. Most import
        from <span className="font-bureau">@/shared/ui/kit</span>; the chat
        composites import from <span className="font-bureau">@/services/chat</span>{" "}
        and <span className="font-bureau">@/shared/ui/kit-additions</span>. The
        single-element building blocks live under{" "}
        <span className="font-bureau">Primitives</span>.
      </Text>

      {/* Cards */}
      <Section title="Cards">
        <Specimen name="Card" span>
          <Card variant="outlined" className="w-full max-w-[320px]">
            <CardHeader>
              <CardTitle>Card title</CardTitle>
              <CardDescription>Supporting description text.</CardDescription>
            </CardHeader>
            <CardContent>Body content goes here.</CardContent>
            <CardFooter>
              <Button variant="secondary" size="40">
                Action
              </Button>
            </CardFooter>
          </Card>
        </Specimen>
        <Specimen name="ComparisonCard" span>
          <ComparisonCard
            items={[
              {
                title: "Option A",
                src: "https://picsum.photos/seed/a/400",
                status: "accepted",
              },
              {
                title: "Option B",
                src: "https://picsum.photos/seed/b/400",
                status: "rejected",
              },
            ]}
          />
        </Specimen>
      </Section>

      {/* Overlays */}
      <Section title="Overlays & menus">
        <Specimen name="Dialog">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">Open dialog</Button>
            </DialogTrigger>
            <DialogContent showCloseButton>
              <DialogHeader>
                <DialogTitle>Dialog title</DialogTitle>
                <DialogDescription>Dialog description text.</DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </Specimen>
        <Specimen name="Popover">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary">Open popover</Button>
            </PopoverTrigger>
            <PopoverContent>Popover content.</PopoverContent>
          </Popover>
        </Specimen>
        <Specimen name="Sheet">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary">Open sheet</Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Sheet title</SheetTitle>
                <SheetDescription>Sheet description text.</SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </Specimen>
        <Specimen name="DropdownMenu">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">Open menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Specimen>
        <Specimen name="NavigationMenu" span>
          <div className="min-h-[220px] w-full">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Products</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <NavigationMenuLink href="#">Overview</NavigationMenuLink>
                    <NavigationMenuLink href="#">Pricing</NavigationMenuLink>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink variant="inline" href="#">
                    Blog
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </Specimen>
      </Section>

      {/* Selection widgets */}
      <Section title="Selection widgets">
        <Specimen name="Combobox">
          <div className="w-full max-w-[280px]">
            <Combobox items={FRAMEWORKS}>
              <ComboboxInput label="Select framework…" />
              <ComboboxContent>
                <ComboboxList>
                  {(f: string) => (
                    <ComboboxItem key={f} value={f}>
                      {f}
                    </ComboboxItem>
                  )}
                </ComboboxList>
                <ComboboxEmpty>No results found.</ComboboxEmpty>
              </ComboboxContent>
            </Combobox>
          </div>
        </Specimen>
        <Specimen name="MultiSelect">
          <div className="w-72">
            <MultiSelect defaultValues={["React"]}>
              <MultiSelectTrigger>
                <MultiSelectValue placeholder="Select frameworks…" />
              </MultiSelectTrigger>
              <MultiSelectContent>
                {FRAMEWORKS.map((f) => (
                  <MultiSelectItem key={f} value={f}>
                    {f}
                  </MultiSelectItem>
                ))}
              </MultiSelectContent>
            </MultiSelect>
          </div>
        </Specimen>
        <Specimen name="Command" span>
          <div className="w-full max-w-[360px] rounded-[10px] border border-stroke-secondary">
            <Command>
              <CommandInput placeholder="Type a command…" />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                  <CommandItem>Calendar</CommandItem>
                  <CommandItem>Search</CommandItem>
                  <CommandItem>Settings</CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </Specimen>
      </Section>

      {/* Lists */}
      <Section title="Lists & items">
        <Specimen name="List">
          <List type="check">
            <ListItem>First item</ListItem>
            <ListItem>Second item</ListItem>
            <ListItem>Third item</ListItem>
          </List>
        </Specimen>
        <Specimen name="Item" span>
          <ItemGroup className="w-full">
            <Item variant="outline">
              <ItemContent>
                <ItemTitle>Item title</ItemTitle>
                <ItemDescription>Short supporting description.</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button size="40" variant="secondary">
                  Action
                </Button>
              </ItemActions>
            </Item>
            <ItemSeparator />
            <Item variant="outline">
              <ItemContent>
                <ItemTitle>Second item</ItemTitle>
                <ItemDescription>Another supporting line.</ItemDescription>
              </ItemContent>
            </Item>
          </ItemGroup>
        </Specimen>
        <Specimen name="Checklist">
          <Checklist
            items={["Set up project", "Design API", "Write docs"]}
            renderItem={(item) => <span>{item as string}</span>}
          />
        </Specimen>
      </Section>

      {/* Flows & navigation */}
      <Section title="Flows & navigation">
        <Specimen name="Stepper" span>
          <div className="w-full">
            <Stepper defaultValue={2}>
              <StepperNav>
                {[1, 2, 3].map((step) => (
                  <StepperItem key={step} step={step}>
                    <StepperTrigger>
                      <StepperIndicator className="size-8 text-sm">
                        {step}
                      </StepperIndicator>
                      <StepperTitle>Step {step}</StepperTitle>
                    </StepperTrigger>
                    {step < 3 && <StepperSeparator />}
                  </StepperItem>
                ))}
              </StepperNav>
              <StepperPanel className="mt-6">
                {[1, 2, 3].map((step) => (
                  <StepperContent key={step} value={step}>
                    <Text variant="body" color="secondary">
                      Content for step {step}.
                    </Text>
                  </StepperContent>
                ))}
              </StepperPanel>
            </Stepper>
          </div>
        </Specimen>
        <Specimen name="Pagination" span>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">10</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </Specimen>
        <Specimen name="ButtonGroup">
          <ButtonGroup>
            <Button variant="secondary">Left</Button>
            <Button variant="secondary">Middle</Button>
            <Button variant="secondary">Right</Button>
          </ButtonGroup>
        </Specimen>
        <Specimen name="Collapsible">
          <Collapsible defaultOpen>
            <CollapsibleTrigger asChild>
              <Button variant="secondary">Toggle</Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Text variant="label" color="secondary" className="pt-2">
                Hidden content revealed on toggle.
              </Text>
            </CollapsibleContent>
          </Collapsible>
        </Specimen>
      </Section>

      {/* Inputs */}
      <Section title="Composite inputs">
        <Specimen name="InputOTP">
          <InputOTP maxLength={6}>
            <InputOTPGroup>
              {Array.from({ length: 6 }).map((_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </Specimen>
      </Section>

      {/* Data display */}
      <Section title="Data display">
        <Specimen name="Timeline" span>
          <div className="w-full overflow-x-auto">
            <Timeline
              className="min-w-[560px]"
              columns={[
                { key: "m1", label: "This month" },
                { key: "m2", label: "Next month" },
              ]}
              rows={[
                {
                  key: "p1",
                  label: "Person 1",
                  segments: [
                    { key: "s1", label: "Project A", start: 0, end: 40, color: "blue" },
                    { key: "s2", label: "Project B", start: 45, end: 100, color: "rose" },
                  ],
                },
                {
                  key: "p2",
                  label: "Person 2",
                  segments: [
                    { key: "s3", label: "Project C", start: 10, end: 70, color: "green" },
                  ],
                },
              ]}
            >
              <TimelineHeader>
                <TimelineTitle>Timeline</TimelineTitle>
                <TimelineDescription>Allocation across months</TimelineDescription>
              </TimelineHeader>
              <TimelineBody />
            </Timeline>
          </div>
        </Specimen>
      </Section>

      {/* Chat boxes */}
      <Section title="Chat boxes">
        <Specimen name="ChatTextareaComposer" from="@/services/chat" span>
          <div className="w-full">
            <ChatTextareaComposer
              value={big}
              onChange={(e) => setBig(e.target.value)}
              placeholder="How can we help you?"
              leftActions={<ChatComposerAttachButton />}
              rightActions={
                <>
                  <ChatComposerMicButton />
                  <ChatComposerSendButton active={bigTyping} shimmer />
                </>
              }
            />
          </div>
        </Specimen>
        <Specimen name="ChatInlineComposer" from="@/services/chat" span>
          <ChatInlineComposer
            value={inline}
            onChange={(e) => setInline(e.target.value)}
            placeholder="Describe edits"
            leftActions={<ChatComposerAttachButton />}
            rightActions={<ChatComposerSendButton active={inlineTyping} />}
          />
        </Specimen>
      </Section>

      {/* Composer buttons */}
      <Section title="Composer buttons">
        <Specimen name="ChatComposerSendButton" from="@/services/chat">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <ChatComposerSendButton active={false} />
              <Text variant="label" color="secondary">
                idle
              </Text>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ChatComposerSendButton active />
              <Text variant="label" color="secondary">
                active
              </Text>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ChatComposerSendButton active shimmer />
              <Text variant="label" color="secondary">
                shimmer
              </Text>
            </div>
          </div>
        </Specimen>
        <Specimen name="ChatComposerAttachButton" from="@/services/chat">
          <ChatComposerAttachButton />
        </Specimen>
        <Specimen name="ChatComposerMicButton" from="@/services/chat">
          <ChatComposerMicButton />
        </Specimen>
        <Specimen name="ChatComposerStopButton" from="@/services/chat">
          <ChatComposerStopButton />
        </Specimen>
        <Specimen name="ChatPillButton" from="@/services/chat">
          <ChatPillButton shape="pill-icon">Adapt</ChatPillButton>
          <ChatPillButton shape="pill-icon" active>
            Active
          </ChatPillButton>
        </Specimen>
      </Section>

      {/* Frames */}
      <Section title="Frames (glass surfaces)">
        <Specimen name="ChatGrayFrame" from="@/services/chat">
          <ChatGrayFrame className="flex items-center justify-center px-6 py-8">
            <Text variant="label" color="secondary">
              Frosted gray frame
            </Text>
          </ChatGrayFrame>
        </Specimen>
        <Specimen name="ChatGradientFrame" from="@/services/chat">
          <ChatGradientFrame className="flex items-center justify-center px-6 py-8">
            <Text variant="label" color="secondary">
              Gradient border frame
            </Text>
          </ChatGradientFrame>
        </Specimen>
        <Specimen name="ChatHighlightFrame" from="@/services/chat">
          <ChatHighlightFrame className="flex items-center justify-center px-6 py-8">
            <Text variant="label" color="secondary">
              Highlight frame
            </Text>
          </ChatHighlightFrame>
        </Specimen>
      </Section>

      {/* Suggestion cards */}
      <Section title="Suggestion cards">
        <Specimen name="ChatSuggestionCard" from="@/services/chat" span>
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
            <ChatSuggestionCard suggestion="Summarise the latest quarterly report for me." />
            <ChatSuggestionCard
              label="Analyse"
              suggestion="Compare revenue against the previous three quarters."
            />
            <ChatSuggestionCard
              size="s"
              suggestion="Draft a follow-up email to the finance team."
            />
          </div>
        </Specimen>
        <Specimen
          name='ChatSuggestionCard variant="plain"'
          copy='<ChatSuggestionCard variant="plain" suggestion="..." />'
          from="@/services/chat"
          span
        >
          <div className="grid w-full grid-cols-1 gap-6 bg-background-secondary p-4 sm:grid-cols-3">
            <ChatSuggestionCard
              variant="plain"
              suggestion="Suggestion can go here. Lorem Ipsum dolor sit amet consectetur."
            />
            <ChatSuggestionCard
              variant="plain"
              suggestion="Suggestion can go here. Lorem Ipsum dolor sit amet consectetur."
            />
            <ChatSuggestionCard
              variant="plain"
              suggestion="Suggestion can go here. Lorem Ipsum dolor sit amet consectetur."
            />
          </div>
        </Specimen>
        <Specimen name="DraftCard" from="@/shared/ui/kit-additions" span>
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
            {SAMPLE_DRAFTS.map((draft) => (
              <DraftCard
                key={draft.key}
                draft={draft}
                selected={staged === draft.key}
                onSelect={(d) => setStaged(d.key)}
              />
            ))}
          </div>
        </Specimen>
      </Section>

      {/* Save flow */}
      <Section title="Save flow">
        <Specimen
          name="ChatSaveInterfaceButton + ChatInteractiveFrame"
          from="@/shared/ui/kit-additions"
          span
        >
          <SaveDemo />
        </Specimen>
      </Section>
    </GalleryPage>
  );
}

export const Component = ComponentsPage;
