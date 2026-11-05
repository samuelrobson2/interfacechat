import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { BrowserRouter } from "react-router-dom";

/**
 * Render component with BrowserRouter for testing components that use React Router
 * Useful for testing auth forms and pages that use router navigation
 */
export const renderWithRouter = (component: ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};
