/**
 * Placeholder "screenshots" for interface cards.
 *
 * The demo has no backend to render real thumbnails from, so each interface
 * ships a hand-drawn SVG scene that reads like a screen capture of the thing it
 * represents. Colours are literal (not themed) on purpose — a screenshot keeps
 * its own palette when the app switches to dark mode.
 */

const C = {
  page: "#F1F2F5",
  card: "#FFFFFF",
  line: "#E4E5EA",
  mute: "#DDDFE6",
  text: "#C2C5CE",
  ink: "#24262D",
  blue: "#2F6BFF",
  blueSoft: "#DCE6FF",
  mint: "#8FDCC0",
  amber: "#FFC978",
  pink: "#FFB0C4",
  violet: "#C6B6FF",
};

/** A row of fake text. */
function Line({
  x,
  y,
  w,
  h = 6,
  fill = C.text,
  o = 1,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  fill?: string;
  o?: number;
}) {
  return (
    <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={fill} opacity={o} />
  );
}

/** Window chrome dots, shared by the scenes that frame themselves as an app. */
function Chrome({ w, y = 18 }: { w: number; y?: number }) {
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={26 + i * 14} cy={y} r={4} fill={C.mute} />
      ))}
      <rect
        x={w / 2 - 50}
        y={y - 7}
        width={100}
        height={14}
        rx={7}
        fill={C.page}
      />
    </g>
  );
}

function Frame({
  w,
  h,
  children,
  bg = C.page,
}: {
  w: number;
  h: number;
  children: React.ReactNode;
  bg?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="size-full"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
    >
      <rect width={w} height={h} fill={bg} />
      {children}
    </svg>
  );
}

/* ------------------------------------------------------------------ scenes */

function MermaidFlow() {
  const node = (x: number, y: number, w: number, fill: string) => (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={34}
        rx={10}
        fill={fill}
        stroke={C.blue}
        strokeOpacity={0.35}
      />
      <Line x={x + 12} y={y + 14} w={w - 24} h={6} fill={C.blue} o={0.45} />
    </g>
  );
  return (
    <Frame w={400} h={300}>
      <rect x={20} y={36} width={360} height={244} rx={14} fill={C.card} />
      <Chrome w={400} />
      {node(60, 68, 120, C.blueSoft)}
      <path
        d="M120 102 V 132"
        stroke={C.blue}
        strokeOpacity={0.4}
        strokeWidth={2}
      />
      {node(48, 132, 76, C.card)}
      {node(196, 132, 96, C.card)}
      <path
        d="M120 118 H 244 V 132"
        stroke={C.blue}
        strokeOpacity={0.4}
        strokeWidth={2}
        fill="none"
      />
      <path
        d="M86 166 V 200 H 244 V 166"
        stroke={C.blue}
        strokeOpacity={0.3}
        strokeWidth={2}
        fill="none"
      />
      {node(120, 200, 140, C.blueSoft)}
      <circle cx={330} cy={92} r={18} fill={C.page} />
      <Line x={300} y={140} w={60} h={6} />
      <Line x={300} y={156} w={44} h={6} />
      <Line x={300} y={172} w={52} h={6} />
    </Frame>
  );
}

function ChatConsole() {
  return (
    <Frame w={300} h={400} bg={C.card}>
      <rect x={0} y={0} width={300} height={44} fill={C.page} />
      <circle cx={26} cy={22} r={9} fill={C.blue} opacity={0.85} />
      <Line x={44} y={19} w={80} h={6} />
      {[
        { y: 66, w: 150, mine: false },
        { y: 116, w: 190, mine: true },
        { y: 196, w: 130, mine: false },
        { y: 246, w: 170, mine: true },
      ].map((b, i) => (
        <g key={i}>
          <rect
            x={b.mine ? 300 - 22 - b.w : 22}
            y={b.y}
            width={b.w}
            height={b.mine ? 62 : 38}
            rx={14}
            fill={b.mine ? C.blueSoft : C.page}
          />
          <Line
            x={(b.mine ? 300 - 22 - b.w : 22) + 14}
            y={b.y + 14}
            w={b.w - 40}
            h={6}
            fill={b.mine ? C.blue : C.text}
            o={b.mine ? 0.45 : 1}
          />
          {b.mine && (
            <Line
              x={300 - 22 - b.w + 14}
              y={b.y + 32}
              w={b.w - 66}
              h={6}
              fill={C.blue}
              o={0.3}
            />
          )}
        </g>
      ))}
      <rect
        x={22}
        y={330}
        width={256}
        height={44}
        rx={22}
        fill={C.card}
        stroke={C.line}
        strokeWidth={2}
      />
      <Line x={42} y={349} w={110} h={6} />
      <circle cx={254} cy={352} r={14} fill={C.blue} />
    </Frame>
  );
}

function MetricsDashboard() {
  const pts = "0,58 26,44 52,50 78,28 104,34 130,14 156,20 182,4";
  return (
    <Frame w={480} h={300}>
      <rect x={20} y={20} width={440} height={260} rx={14} fill={C.card} />
      <Line x={40} y={44} w={90} h={8} fill={C.ink} o={0.75} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect
            x={40 + i * 138}
            y={70}
            width={122}
            height={62}
            rx={10}
            fill={C.page}
          />
          <Line x={54 + i * 138} y={84} w={44} h={5} />
          <Line x={54 + i * 138} y={100} w={62} h={12} fill={C.ink} o={0.7} />
        </g>
      ))}
      <rect x={40} y={148} width={260} height={112} rx={10} fill={C.page} />
      <g transform="translate(58 176)">
        <polyline
          points={pts}
          fill="none"
          stroke={C.blue}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polygon points={`${pts} 182,66 0,66`} fill={C.blue} opacity={0.1} />
      </g>
      <rect x={316} y={148} width={124} height={112} rx={10} fill={C.page} />
      {[46, 66, 34, 78].map((h, i) => (
        <rect
          key={i}
          x={330 + i * 26}
          y={244 - h}
          width={16}
          height={h}
          rx={5}
          fill={i === 3 ? C.blue : C.mute}
        />
      ))}
    </Frame>
  );
}

function DataTable() {
  return (
    <Frame w={400} h={320} bg={C.card}>
      <rect x={0} y={0} width={400} height={46} fill={C.page} />
      <Line x={24} y={20} w={64} h={6} fill={C.ink} o={0.6} />
      <rect x={300} y={13} width={76} height={20} rx={10} fill={C.blueSoft} />
      {Array.from({ length: 7 }).map((_, r) => (
        <g key={r}>
          <rect
            x={0}
            y={62 + r * 34}
            width={400}
            height={1}
            fill={C.line}
          />
          <Line x={24} y={76 + r * 34} w={r % 3 === 0 ? 96 : 74} h={6} />
          <Line x={168} y={76 + r * 34} w={58} h={6} o={0.7} />
          <rect
            x={264}
            y={70 + r * 34}
            width={54}
            height={16}
            rx={8}
            fill={[C.mint, C.amber, C.blueSoft, C.pink][r % 4]}
            opacity={0.7}
          />
          <Line x={340} y={76 + r * 34} w={36} h={6} o={0.6} />
        </g>
      ))}
    </Frame>
  );
}

function KanbanBoard() {
  return (
    <Frame w={420} h={300}>
      {[0, 1, 2].map((col) => (
        <g key={col}>
          <rect
            x={20 + col * 130}
            y={24}
            width={120}
            height={252}
            rx={12}
            fill={C.card}
          />
          <Line x={36 + col * 130} y={42} w={52} h={6} fill={C.ink} o={0.55} />
          {Array.from({ length: 3 - (col % 2) }).map((_, i) => (
            <g key={i}>
              <rect
                x={32 + col * 130}
                y={62 + i * 62}
                width={96}
                height={50}
                rx={9}
                fill={C.page}
              />
              <rect
                x={42 + col * 130}
                y={72 + i * 62}
                width={26}
                height={8}
                rx={4}
                fill={[C.blue, C.mint, C.amber][(col + i) % 3]}
                opacity={0.75}
              />
              <Line x={42 + col * 130} y={88 + i * 62} w={72} h={5} />
              <Line x={42 + col * 130} y={99 + i * 62} w={48} h={5} o={0.6} />
            </g>
          ))}
        </g>
      ))}
    </Frame>
  );
}

function PromptLab() {
  return (
    <Frame w={480} h={270} bg={C.ink}>
      <rect x={0} y={0} width={480} height={34} fill="#2E313A" />
      <Chrome w={480} y={17} />
      <rect x={0} y={34} width={228} height={236} fill="#1B1D23" />
      {[120, 86, 152, 64, 110, 138, 72, 96, 128].map((w, i) => (
        <Line
          key={i}
          x={24}
          y={60 + i * 22}
          w={w}
          h={6}
          fill={i % 3 === 0 ? C.blue : "#4C5160"}
          o={i % 3 === 0 ? 0.8 : 1}
        />
      ))}
      <rect x={228} y={34} width={252} height={236} fill="#22252C" />
      <rect
        x={252}
        y={58}
        width={204}
        height={82}
        rx={10}
        fill={C.blue}
        opacity={0.16}
      />
      <Line x={268} y={78} w={150} h={6} fill={C.blue} o={0.7} />
      <Line x={268} y={94} w={116} h={6} fill={C.blue} o={0.45} />
      <Line x={268} y={110} w={140} h={6} fill={C.blue} o={0.45} />
      {[180, 148, 196].map((w, i) => (
        <Line key={i} x={252} y={168 + i * 20} w={w} h={6} fill="#4C5160" />
      ))}
      <rect x={252} y={228} width={92} height={24} rx={12} fill={C.blue} />
    </Frame>
  );
}

function EvalHeatmap() {
  return (
    <Frame w={320} h={320} bg={C.card}>
      <Line x={24} y={24} w={84} h={7} fill={C.ink} o={0.6} />
      <Line x={24} y={42} w={130} h={5} />
      {Array.from({ length: 7 }).map((_, r) =>
        Array.from({ length: 7 }).map((__, c) => {
          const v = ((r * 3 + c * 5) % 7) / 7;
          return (
            <rect
              key={`${r}-${c}`}
              x={24 + c * 39}
              y={70 + r * 33}
              width={33}
              height={27}
              rx={6}
              fill={C.blue}
              opacity={0.08 + v * 0.7}
            />
          );
        }),
      )}
      <Line x={24} y={302} w={60} h={5} o={0.7} />
      <Line x={236} y={302} w={60} h={5} o={0.7} />
    </Frame>
  );
}

function SequenceDiagram() {
  const lanes = [60, 150, 240];
  return (
    <Frame w={300} h={380} bg={C.card}>
      {lanes.map((x, i) => (
        <g key={i}>
          <rect x={x - 34} y={28} width={68} height={26} rx={8} fill={C.page} />
          <Line x={x - 22} y={38} w={44} h={6} />
          <path
            d={`M${x} 62 V 340`}
            stroke={C.line}
            strokeWidth={2}
            strokeDasharray="5 6"
          />
        </g>
      ))}
      {[
        { y: 96, x1: 60, x2: 150 },
        { y: 152, x1: 150, x2: 240 },
        { y: 208, x1: 240, x2: 150 },
        { y: 264, x1: 150, x2: 60 },
        { y: 312, x1: 60, x2: 240 },
      ].map((m, i) => {
        const { x1, x2 } = m;
        const dir = x2 > x1 ? -1 : 1;
        return (
          <g key={i}>
            <path
              d={`M${x1} ${m.y} H ${x2}`}
              stroke={C.blue}
              strokeWidth={2}
              opacity={0.6}
            />
            <path
              d={`M${x2} ${m.y} l ${dir * 8} -5 v 10 z`}
              fill={C.blue}
              opacity={0.6}
            />
            <Line
              x={Math.min(x1, x2) + 14}
              y={m.y - 16}
              w={Math.abs(x2 - x1) - 28}
              h={5}
            />
          </g>
        );
      })}
    </Frame>
  );
}

function AnnotationReview() {
  return (
    <Frame w={400} h={300}>
      <rect x={20} y={20} width={250} height={260} rx={12} fill={C.ink} />
      <rect
        x={62}
        y={72}
        width={132}
        height={104}
        rx={8}
        fill="none"
        stroke={C.mint}
        strokeWidth={3}
      />
      <rect x={62} y={54} width={62} height={16} rx={4} fill={C.mint} />
      <rect
        x={120}
        y={186}
        width={96}
        height={62}
        rx={8}
        fill="none"
        stroke={C.amber}
        strokeWidth={3}
      />
      <rect x={120} y={168} width={54} height={16} rx={4} fill={C.amber} />
      <rect x={286} y={20} width={94} height={260} rx={12} fill={C.card} />
      <Line x={300} y={40} w={54} h={6} fill={C.ink} o={0.55} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect
            x={300}
            y={62 + i * 44}
            width={66}
            height={32}
            rx={8}
            fill={C.page}
          />
          <circle
            cx={312}
            cy={78 + i * 44}
            r={5}
            fill={[C.mint, C.amber, C.blue, C.pink][i]}
          />
          <Line x={324} y={75 + i * 44} w={30} h={5} />
        </g>
      ))}
      <rect x={300} y={244} width={66} height={22} rx={11} fill={C.blue} />
    </Frame>
  );
}

function IntakeForm() {
  return (
    <Frame w={300} h={380} bg={C.card}>
      <rect x={0} y={0} width={300} height={96} fill={C.blueSoft} />
      <Line x={28} y={36} w={120} h={9} fill={C.blue} o={0.6} />
      <Line x={28} y={58} w={180} h={6} fill={C.blue} o={0.35} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Line x={28} y={128 + i * 68} w={62} h={5} />
          <rect
            x={28}
            y={144 + i * 68}
            width={244}
            height={38}
            rx={10}
            fill={C.page}
            stroke={C.line}
            strokeWidth={1.5}
          />
          <Line x={44} y={160 + i * 68} w={i === 1 ? 130 : 92} h={6} o={0.8} />
        </g>
      ))}
      <Line x={28} y={332} w={62} h={5} />
      <rect x={28} y={332} width={0} height={0} />
      <rect x={28} y={344} width={112} height={20} rx={10} fill={C.page} />
      <rect x={172} y={338} width={100} height={32} rx={16} fill={C.blue} />
    </Frame>
  );
}

function GraphExplorer() {
  const nodes = [
    { x: 120, y: 96, r: 26, c: C.blue },
    { x: 226, y: 62, r: 16, c: C.violet },
    { x: 258, y: 150, r: 20, c: C.mint },
    { x: 148, y: 190, r: 14, c: C.amber },
    { x: 62, y: 168, r: 12, c: C.pink },
    { x: 342, y: 106, r: 12, c: C.mute },
  ];
  return (
    <Frame w={440} h={260}>
      <rect x={20} y={20} width={400} height={220} rx={14} fill={C.card} />
      {[
        "M120 96 L 226 62",
        "M120 96 L 258 150",
        "M120 96 L 148 190",
        "M120 96 L 62 168",
        "M226 62 L 258 150",
        "M258 150 L 342 106",
      ].map((d, i) => (
        <path key={i} d={d} stroke={C.line} strokeWidth={2} />
      ))}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={n.r} fill={n.c} opacity={0.85} />
      ))}
      <rect x={300} y={176} width={100} height={46} rx={10} fill={C.page} />
      <Line x={312} y={190} w={54} h={5} />
      <Line x={312} y={204} w={72} h={5} o={0.6} />
    </Frame>
  );
}

function DiffReview() {
  const rows = [
    { w: 150, t: "n" },
    { w: 118, t: "del" },
    { w: 176, t: "add" },
    { w: 132, t: "add" },
    { w: 96, t: "n" },
    { w: 164, t: "n" },
    { w: 84, t: "del" },
    { w: 142, t: "add" },
  ];
  return (
    <Frame w={380} h={300} bg={C.card}>
      <rect x={0} y={0} width={380} height={42} fill={C.page} />
      <Line x={22} y={18} w={92} h={6} fill={C.ink} o={0.55} />
      <rect x={286} y={11} width={72} height={20} rx={10} fill={C.mint} opacity={0.5} />
      {rows.map((r, i) => {
        const bg =
          r.t === "add" ? "#E7F7EF" : r.t === "del" ? "#FDEBEF" : "transparent";
        const fg = r.t === "add" ? "#4FB58B" : r.t === "del" ? "#E8869B" : C.text;
        return (
          <g key={i}>
            <rect x={0} y={56 + i * 30} width={380} height={26} fill={bg} />
            <Line x={18} y={65 + i * 30} w={10} h={6} o={0.5} />
            <Line x={44} y={65 + i * 30} w={r.w} h={6} fill={fg} />
          </g>
        );
      })}
    </Frame>
  );
}

function SlidePreview() {
  return (
    <Frame w={440} h={280} bg={C.ink}>
      <rect x={26} y={26} width={388} height={228} rx={10} fill={C.card} />
      <Line x={54} y={62} w={168} h={12} fill={C.ink} o={0.75} />
      <Line x={54} y={88} w={220} h={6} />
      <rect x={54} y={124} width={150} height={100} rx={8} fill={C.blueSoft} />
      <polyline
        points="70,206 100,180 130,192 160,152 188,164"
        fill="none"
        stroke={C.blue}
        strokeWidth={3}
        strokeLinecap="round"
      />
      {[128, 100, 142].map((w, i) => (
        <g key={i}>
          <circle cx={236} cy={136 + i * 32} r={6} fill={C.blue} opacity={0.6} />
          <Line x={252} y={133 + i * 32} w={w} h={6} />
        </g>
      ))}
      <rect x={236} y={228} width={64} height={6} rx={3} fill={C.mute} />
    </Frame>
  );
}

function VoiceCapture() {
  return (
    <Frame w={300} h={300} bg={C.card}>
      <circle cx={150} cy={126} r={62} fill={C.blueSoft} />
      <circle cx={150} cy={126} r={40} fill={C.blue} opacity={0.9} />
      <rect x={142} y={108} width={16} height={28} rx={8} fill={C.card} />
      <path
        d="M134 138 a16 16 0 0 0 32 0"
        stroke={C.card}
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
      />
      {Array.from({ length: 21 }).map((_, i) => {
        const h = 6 + Math.abs(Math.sin(i * 1.1)) * 44;
        return (
          <rect
            key={i}
            x={26 + i * 12.6}
            y={232 - h / 2}
            width={5}
            height={h}
            rx={2.5}
            fill={i > 6 && i < 15 ? C.blue : C.mute}
            opacity={i > 6 && i < 15 ? 0.8 : 1}
          />
        );
      })}
      <Line x={98} y={270} w={104} h={6} />
    </Frame>
  );
}

function JobMonitor() {
  const rows = [
    { pct: 1, tone: C.mint },
    { pct: 0.62, tone: C.blue },
    { pct: 0.34, tone: C.blue },
    { pct: 1, tone: C.mint },
    { pct: 0.08, tone: C.amber },
  ];
  return (
    <Frame w={420} h={300} bg={C.card}>
      <rect x={0} y={0} width={420} height={48} fill={C.page} />
      <Line x={24} y={21} w={78} h={7} fill={C.ink} o={0.6} />
      <circle cx={392} cy={24} r={7} fill={C.mint} />
      {rows.map((r, i) => (
        <g key={i}>
          <Line x={24} y={74 + i * 46} w={i % 2 ? 92 : 116} h={6} />
          <rect
            x={24}
            y={88 + i * 46}
            width={300}
            height={7}
            rx={3.5}
            fill={C.page}
          />
          <rect
            x={24}
            y={88 + i * 46}
            width={300 * r.pct}
            height={7}
            rx={3.5}
            fill={r.tone}
          />
          <rect
            x={344}
            y={80 + i * 46}
            width={52}
            height={18}
            rx={9}
            fill={r.tone}
            opacity={0.35}
          />
        </g>
      ))}
    </Frame>
  );
}

/* ----------------------------------------------------------------- registry */

export const INTERFACE_PREVIEWS = {
  "mermaid-flow": MermaidFlow,
  "chat-console": ChatConsole,
  "metrics-dashboard": MetricsDashboard,
  "data-table": DataTable,
  kanban: KanbanBoard,
  "prompt-lab": PromptLab,
  "eval-heatmap": EvalHeatmap,
  "sequence-diagram": SequenceDiagram,
  "annotation-review": AnnotationReview,
  "intake-form": IntakeForm,
  "graph-explorer": GraphExplorer,
  "diff-review": DiffReview,
  "slide-preview": SlidePreview,
  "voice-capture": VoiceCapture,
  "job-monitor": JobMonitor,
} as const;

export type InterfacePreviewKey = keyof typeof INTERFACE_PREVIEWS;

export function InterfacePreview({ name }: { name: InterfacePreviewKey }) {
  const Scene = INTERFACE_PREVIEWS[name];
  return <Scene />;
}
