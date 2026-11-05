import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PhoneInput } from "../phone-input";

describe("PhoneInput", () => {
  it("should display combined country code and label when empty and not focused", () => {
    // Arrange & Act
    render(
      <PhoneInput
        countryCode="+1"
        label="Phone number"
        value=""
        onChange={vi.fn()}
      />
    );

    // Assert
    expect(screen.getByText(/\+1 phone number/i)).toBeInTheDocument();
  });

  it("should display separate label and country code when focused", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <PhoneInput
        countryCode="+1"
        label="Phone number"
        value=""
        onChange={vi.fn()}
      />
    );

    // Act - focus input
    const input = screen.getByRole("textbox");
    await user.click(input);

    // Assert - label should be separate and country code in left element
    expect(screen.getByText(/^phone number$/i)).toBeInTheDocument();
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("should display separate label and country code when input has value", () => {
    // Arrange & Act
    render(
      <PhoneInput
        countryCode="+1"
        label="Phone number"
        value="1234567890"
        onChange={vi.fn()}
      />
    );

    // Assert - with value, should always show separate label and country code
    expect(screen.getByText(/^phone number$/i)).toBeInTheDocument();
    expect(screen.getByText("+1")).toBeInTheDocument();

    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("1234567890");
  });

  it("should transition between combined and separate display on focus and blur", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <PhoneInput
        countryCode="+44"
        label="Phone"
        value=""
        onChange={vi.fn()}
      />
    );

    // Act & Assert - initially combined
    expect(screen.getByText(/\+44 phone/i)).toBeInTheDocument();

    // Act - focus input
    const input = screen.getByRole("textbox");
    await user.click(input);

    // Assert - should be separate
    expect(screen.getByText(/^phone$/i)).toBeInTheDocument();
    expect(screen.getByText("+44")).toBeInTheDocument();

    // Act - blur input
    await user.tab();

    // Assert - should revert to combined (no value)
    expect(screen.getByText(/\+44 phone/i)).toBeInTheDocument();
  });

  it("should call onFocus handler when input is focused", async () => {
    // Arrange
    const user = userEvent.setup();
    const mockOnFocus = vi.fn();
    render(
      <PhoneInput
        countryCode="+1"
        label="Phone number"
        value=""
        onChange={vi.fn()}
        onFocus={mockOnFocus}
      />
    );

    // Act
    const input = screen.getByRole("textbox");
    await user.click(input);

    // Assert
    expect(mockOnFocus).toHaveBeenCalled();
  });

  it("should call onBlur handler when input is blurred", async () => {
    // Arrange
    const user = userEvent.setup();
    const mockOnBlur = vi.fn();
    render(
      <PhoneInput
        countryCode="+1"
        label="Phone number"
        value=""
        onChange={vi.fn()}
        onBlur={mockOnBlur}
      />
    );

    // Act - focus and blur
    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.tab();

    // Assert
    expect(mockOnBlur).toHaveBeenCalled();
  });
});
