import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  InputOTP,
  InputOTPFormWrapper,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from ".";

const meta: Meta<typeof InputOTP> = {
  title: "UI/Kit/InputOTP",
  component: InputOTP,
  tags: ["autodocs"],
  argTypes: {
    maxLength: {
      control: "number",
      description: "Total number of OTP slots",
    },
    disabled: {
      control: "boolean",
      description: "Disables the OTP input",
    },
  },
  args: {
    maxLength: 6,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof InputOTP>;

export const Default: Story = {
  render: (args) => (
    <InputOTP maxLength={args.maxLength ?? 6} disabled={args.disabled}>
      <InputOTPGroup>
        {Array.from({ length: args.maxLength ?? 6 }).map((_, i) => (
          <InputOTPSlot key={i} index={i} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  ),
};

export const WithSeparator: Story = {
  render: (args) => (
    <InputOTP maxLength={6} disabled={args.disabled}>
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
  ),
};

export const WithError: Story = {
  render: (args) => (
    <InputOTPFormWrapper error="Invalid verification code. Please try again.">
      <InputOTP maxLength={6} disabled={args.disabled}>
        <InputOTPGroup>
          {Array.from({ length: 6 }).map((_, i) => (
            <InputOTPSlot key={i} index={i} isError />
          ))}
        </InputOTPGroup>
      </InputOTP>
    </InputOTPFormWrapper>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <InputOTP maxLength={6} disabled={args.disabled}>
      <InputOTPGroup>
        {Array.from({ length: 6 }).map((_, i) => (
          <InputOTPSlot key={i} index={i} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  ),
};

export const FourDigits: Story = {
  render: (args) => (
    <InputOTP maxLength={4} disabled={args.disabled}>
      <InputOTPGroup>
        {Array.from({ length: 4 }).map((_, i) => (
          <InputOTPSlot key={i} index={i} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  ),
};
