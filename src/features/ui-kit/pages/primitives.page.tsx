import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Checkbox,
  CircularProgress,
  Input,
  InteractiveBadge,
  Label,
  Progress,
  ProgressRow,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Skeleton,
  Slider,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TruncatedText,
} from "@/shared/ui/kit";
import { Bell, Info, Search, Settings } from "lucide-react";
import { GalleryPage, Section, Specimen } from "../ui-kit-parts";

// The base design-system primitives — all imported from `@/shared/ui/kit`.

function PrimitivesPage() {
  const [checked, setChecked] = useState(true);
  const [switched, setSwitched] = useState(true);
  const [radio, setRadio] = useState("a");
  const [slider, setSlider] = useState([40]);
  const [tab, setTab] = useState("overview");
  const [selected, setSelected] = useState(true);

  return (
    <GalleryPage>
      <Text variant="body" color="secondary">
        All primitives import from{" "}
        <span className="font-bureau">@/shared/ui/kit</span>.
      </Text>

      {/* Typography */}
      <Section title="Typography">
        <Specimen name="Text" span>
          <div className="flex flex-col gap-1">
            <Text variant="h1">Heading 1</Text>
            <Text variant="h2">Heading 2</Text>
            <Text variant="h3">Heading 3</Text>
            <Text variant="title">Title</Text>
            <Text variant="body">Body text</Text>
            <Text variant="label" color="secondary">
              Label / secondary
            </Text>
          </div>
        </Specimen>
        <Specimen name="TruncatedText">
          <TruncatedText variant="body" className="max-w-[220px]">
            This text is truncated with an ellipsis when it overflows its
            container width.
          </TruncatedText>
        </Specimen>
      </Section>

      {/* Actions */}
      <Section title="Actions">
        <Specimen name="Button" span>
          <Button variant="primary" size="40">
            Primary
          </Button>
          <Button variant="secondary" size="40">
            Secondary
          </Button>
          <Button variant="tertiary" size="40">
            Tertiary
          </Button>
          <Button variant="blue" size="40">
            Blue
          </Button>
          <Button variant="black" size="40">
            Black
          </Button>
          <Button variant="ghost" size="40">
            Ghost
          </Button>
          <Button variant="link" size="40">
            Link
          </Button>
          <Button variant="destructive" size="40">
            Destructive
          </Button>
          <Button variant="primary" size="40" disabled>
            Disabled
          </Button>
          <Button variant="secondary" size="40" isLoading>
            Loading
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Settings">
            <Settings className="size-5" />
          </Button>
        </Specimen>
      </Section>

      {/* Badges */}
      <Section title="Badges & tags">
        <Specimen name="Badge">
          <Badge color="default" size="md">
            Default
          </Badge>
          <Badge color="ghost" size="md">
            Ghost
          </Badge>
          <Badge color="neutral" size="md">
            Neutral
          </Badge>
          <Badge color="accent" size="md">
            Accent
          </Badge>
          <Badge color="neutral" size="sm" radius="square">
            Square sm
          </Badge>
        </Specimen>
        <Specimen name="InteractiveBadge">
          <InteractiveBadge
            size="md"
            color="neutral"
            isSelected={selected}
            onClick={() => setSelected((v) => !v)}
          >
            Toggle me
          </InteractiveBadge>
          <InteractiveBadge size="md" color="accent">
            Filters
          </InteractiveBadge>
        </Specimen>
      </Section>

      {/* Inputs */}
      <Section title="Form inputs">
        <Specimen name="Input">
          <Input
            variant="labeled"
            fill="outlined"
            label="Email"
            placeholder="you@example.com"
            className="w-full"
          />
        </Specimen>
        <Specimen name="Input (with icon)">
          <Input
            variant="plain"
            fill="outlined"
            placeholder="Search..."
            leftElement={<Search className="size-5 text-icon-secondary" />}
            className="w-full"
          />
        </Specimen>
        <Specimen name="Textarea">
          <Textarea
            variant="floating"
            label="Message"
            minRows={2}
            maxRows={4}
            className="w-full"
          />
        </Specimen>
        <Specimen name="Label">
          <Label htmlFor="ui-kit-demo-input">Field label</Label>
          <Label disabled>Disabled label</Label>
        </Specimen>
        <Specimen name="Select">
          <Select defaultValue="a">
            <SelectTrigger variant="outline" size="sm">
              <SelectValue placeholder="Choose..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a">Option A</SelectItem>
              <SelectItem value="b">Option B</SelectItem>
              <SelectItem value="c">Option C</SelectItem>
            </SelectContent>
          </Select>
        </Specimen>
      </Section>

      {/* Selection controls */}
      <Section title="Selection controls">
        <Specimen name="Checkbox">
          <Label>
            <Checkbox
              checked={checked}
              onCheckedChange={(v) => setChecked(v === true)}
            />
            Accept terms
          </Label>
          <Label>
            <Checkbox variant="filled" defaultChecked />
            Filled
          </Label>
        </Specimen>
        <Specimen name="Switch">
          <Label>
            <Switch checked={switched} onCheckedChange={setSwitched} />
            Notifications
          </Label>
          <Label>
            <Switch variant="filled" size="sm" defaultChecked />
            Compact
          </Label>
        </Specimen>
        <Specimen name="RadioGroup">
          <RadioGroup value={radio} onValueChange={setRadio}>
            <Label htmlFor="ui-kit-radio-a">
              <RadioGroupItem value="a" id="ui-kit-radio-a" />
              Option A
            </Label>
            <Label htmlFor="ui-kit-radio-b">
              <RadioGroupItem value="b" id="ui-kit-radio-b" />
              Option B
            </Label>
          </RadioGroup>
        </Specimen>
        <Specimen name="Slider">
          <div className="w-full">
            <Slider value={slider} onValueChange={setSlider} max={100} />
          </div>
          <Text variant="label" color="secondary">
            {slider[0]}
          </Text>
        </Specimen>
      </Section>

      {/* Feedback & progress */}
      <Section title="Feedback & progress">
        <Specimen name="Alert" span>
          <Alert variant="destructive">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              Your changes could not be saved. Please try again.
            </AlertDescription>
          </Alert>
        </Specimen>
        <Specimen name="Progress">
          <div className="flex w-full flex-col gap-3">
            <Progress value={65} color="blue" />
            <ProgressRow label="Upload" value={40} color="gradient">
              <Progress value={40} color="gradient" />
            </ProgressRow>
          </div>
        </Specimen>
        <Specimen name="CircularProgress">
          <CircularProgress value={75} size="md" color="blue" />
          <CircularProgress value={50} size="md" color="gradient" />
        </Specimen>
        <Specimen name="Skeleton">
          <div className="flex w-full items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </Specimen>
      </Section>

      {/* Overlays */}
      <Section title="Overlays">
        <Specimen name="Tooltip">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Info">
                <Info className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Helpful hint on hover</TooltipContent>
          </Tooltip>
          <Text variant="label" color="secondary">
            Hover the icon
          </Text>
        </Specimen>
      </Section>

      {/* Navigation & layout */}
      <Section title="Navigation & layout">
        <Specimen name="Tabs" span>
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList variant="solid" color="blue" size="md">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="pt-3">
              <Text variant="body" color="secondary">
                Overview panel content.
              </Text>
            </TabsContent>
            <TabsContent value="activity" className="pt-3">
              <Text variant="body" color="secondary">
                Activity panel content.
              </Text>
            </TabsContent>
            <TabsContent value="settings" className="pt-3">
              <Text variant="body" color="secondary">
                Settings panel content.
              </Text>
            </TabsContent>
          </Tabs>
        </Specimen>
        <Specimen name="Breadcrumb" span>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Settings</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Profile</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Specimen>
        <Specimen name="Accordion" span>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="q1">
              <AccordionTrigger>What is the UI kit?</AccordionTrigger>
              <AccordionContent>
                A shared library of design-system components.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q2">
              <AccordionTrigger>Where do I import from?</AccordionTrigger>
              <AccordionContent>
                From <span className="font-bureau">@/shared/ui/kit</span>.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Specimen>
        <Specimen name="Separator" span>
          <div className="flex w-full items-center gap-3">
            <Text variant="label">Left</Text>
            <Separator className="flex-1" color="secondary" />
            <Text variant="label">Right</Text>
            <Separator orientation="vertical" className="h-6" color="primary" />
            <Bell className="size-4 text-icon-secondary" />
          </div>
        </Specimen>
      </Section>

      {/* Data display */}
      <Section title="Data display">
        <Specimen name="Avatar">
          <Avatar className="size-10">
            <AvatarImage src="https://i.pravatar.cc/80?u=ui-kit" alt="User" />
            <AvatarFallback userName="Sam Robson" />
          </Avatar>
          <Avatar className="size-10">
            <AvatarFallback userName="Ada Lovelace" />
          </Avatar>
        </Specimen>
        <Specimen name="Table" span>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Alice</TableCell>
                <TableCell>Engineer</TableCell>
                <TableCell className="text-right">
                  <Badge size="sm" color="neutral">
                    Active
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Bob</TableCell>
                <TableCell>Designer</TableCell>
                <TableCell className="text-right">
                  <Badge size="sm" color="ghost">
                    Away
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Specimen>
      </Section>
    </GalleryPage>
  );
}

export const Component = PrimitivesPage;
