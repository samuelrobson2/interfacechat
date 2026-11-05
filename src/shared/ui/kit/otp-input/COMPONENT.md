# InputOTP

One-time password input based on `input-otp`.

```tsx
import {
  InputOTP, InputOTPGroup, InputOTPSlot,
  InputOTPSeparator, InputOTPFormWrapper
} from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
InputOTPFormWrapper
└── InputOTP
    ├── InputOTPGroup
    │   ├── InputOTPSlot (index=0)
    │   ├── InputOTPSlot (index=1)
    │   └── InputOTPSlot (index=2)
    ├── InputOTPSeparator
    └── InputOTPGroup
        ├── InputOTPSlot (index=3)
        ├── InputOTPSlot (index=4)
        └── InputOTPSlot (index=5)
```

## InputOTPFormWrapper Props

Extends `React.ComponentProps<"div">` — accepts all standard `<div>` HTML attributes.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `error` | `string` | — | Error message displayed below the OTP input |

## InputOTP Props

Extends `React.ComponentProps<typeof OTPInput>` — accepts all `input-otp` library props.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `maxLength` | `number` | — | Number of OTP slots (required) |
| `value` | `string` | — | Controlled value |
| `onChange` | `(value: string) => void` | — | Value change callback |
| `onComplete` | `(...args: any[]) => void` | — | Callback when all slots are filled |
| `textAlign` | `string` | `"left"` | `"left"` · `"center"` · `"right"` |
| `inputMode` | `string` | `"numeric"` | `"numeric"` · `"text"` · `"decimal"` · `"tel"` · `"search"` · `"email"` · `"url"` |
| `pattern` | `string` | — | Regex pattern for input validation (e.g. `REGEXP_ONLY_DIGITS`) |
| `placeholder` | `string` | — | Placeholder character for empty slots |
| `pasteTransformer` | `(pasted: string) => string` | — | Transform pasted text before applying |
| `autoFocus` | `boolean` | — | Auto-focus input on mount |
| `disabled` | `boolean` | — | Disables input |
| `containerClassName` | `string` | — | Class for the outer container |
| `pushPasswordManagerStrategy` | `string` | `"increase-width"` | `"increase-width"` · `"none"` |

## InputOTPGroup Props

Extends `React.ComponentProps<"div">` — accepts all standard `<div>` HTML attributes.

## InputOTPSlot Props

Extends `React.ComponentProps<"div">` — accepts all standard `<div>` HTML attributes.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `index` | `number` | — | Slot position, 0-based (required) |
| `isError` | `boolean` | — | Red border on error |

## InputOTPSeparator Props

Extends `React.ComponentProps<"div">` — accepts all standard `<div>` HTML attributes.

## Examples

```tsx
<InputOTPFormWrapper error={error}>
  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
    <InputOTPGroup>
      <InputOTPSlot index={0} />
      <InputOTPSlot index={1} />
      <InputOTPSlot index={2} />
    </InputOTPGroup>
    <InputOTPSeparator />
    <InputOTPGroup>
      <InputOTPSlot index={3} />
      <InputOTPSlot index={4} />
      <InputOTPSlot index={5} />
    </InputOTPGroup>
  </InputOTP>
</InputOTPFormWrapper>
```
