import { vi } from 'vitest';

/**
 * Mock for lottie-react
 * Creates a component that renders a div with testid for testing
 */
vi.mock("lottie-react", () => ({
  default: () => <div data-testid="lottie-animation" />,
}));

