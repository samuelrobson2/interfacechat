# CodeBlock

Syntax-highlighted code snippet with a copy-to-clipboard action and a language badge.
Uses [Shiki](https://shiki.style) for server-free, accurate highlighting.

```tsx
import { CodeBlock } from "@adaptionlabs/ui-kit";
```

## Props

Extends `Omit<React.ComponentProps<"div">, "children">` — accepts standard `<div>` HTML attributes (`id`, `style`, `onClick`, `aria-*`, etc.).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `code` | `string` | — | Source code to display |
| `language` | `BundledLanguage \| SpecialLanguage` | `"text"` | Shiki language identifier (e.g. `"typescript"`, `"python"`, `"sql"`) |
| `languageSwitcher` | `ReactNode` | — | Custom node rendered next to the copy button instead of the default language badge (e.g. tab group for Python / cURL) |
| `link` | `{ name: string; href: string }` | — | Optional action button shown in the header (opens in a new tab) |

`BundledLanguage` covers 200+ languages (full list in [Shiki docs](https://shiki.style/languages)).
`SpecialLanguage` includes `"text"` · `"plaintext"` · `"txt"` · `"plain"` · `"ansi"`.

## Examples

```tsx
<CodeBlock language="typescript" code={`const greet = (name: string) => \`Hello, \${name}!\`;`} />
```

```tsx
<CodeBlock language="python" code={`print("Hello, world!")`} />
```

```tsx
<CodeBlock language="json" code={`{ "status": "ready", "id": "abc-123" }`} />
```

```tsx
<CodeBlock language="sql" code={`SELECT * FROM users WHERE active = true LIMIT 10;`} />
```

```tsx
<CodeBlock language="bash" code={`curl -H "Authorization: Bearer $TOKEN" https://api.example.com/status`} />
```

With a docs link button:

```tsx
<CodeBlock
  language="bash"
  code={`curl -H "Authorization: Bearer $TOKEN" https://api.example.com/status`}
  link={{ name: "Developer Docs", href: "https://docs.adaptionlabs.ai/" }}
/>
```

With a custom language switcher (e.g. Python / cURL tabs):

```tsx
const [lang, setLang] = useState<"python" | "bash">("python");

<CodeBlock
  language={lang}
  code={lang === "python" ? PYTHON_CODE : BASH_CODE}
  languageSwitcher={
    <div className="flex gap-2">
      <Button
        variant="secondary"
        size="40"
        className={lang === "python" ? "bg-blue-1 text-typography-primary" : ""}
        onClick={() => setLang("python")}
      >
        Python
      </Button>
      <Button
        variant="secondary"
        size="40"
        className={lang === "bash" ? "bg-blue-1 text-typography-primary" : ""}
        onClick={() => setLang("bash")}
      >
        cURL
      </Button>
    </div>
  }
/>
```

## Notes

- Highlighting is performed asynchronously — the block renders unstyled plain text until Shiki resolves.
- Copy button calls `navigator.clipboard.writeText` and shows a toast on success/failure.
- The default language badge uses an internal label map: `bash` → `cURL`, `python` → `Python`, `typescript` → `TypeScript`, `javascript` → `JavaScript`, `text` → `Text`. Unknown languages fall back to the raw identifier.
- All standard `<div>` attributes (`id`, `data-*`, `aria-*`, `style`, etc.) are forwarded to the root element via `...rootProps`.
- When `languageSwitcher` is provided it completely replaces the default language badge.
