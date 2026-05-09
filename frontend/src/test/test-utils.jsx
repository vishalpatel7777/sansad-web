import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ScrollProvider } from "@context/ScrollContext";

/**
 * Wraps the component under test with all app-level providers.
 * Use this instead of bare RTL `render` so components that rely on
 * ScrollContext or React Router don't throw during tests.
 *
 * @param {React.ReactElement} ui
 * @param {{ route?: string, [key: string]: unknown }} options
 */
export function renderWithProviders(ui, { route = "/", ...renderOptions } = {}) {
  function Wrapper({ children }) {
    return (
      <MemoryRouter initialEntries={[route]}>
        <ScrollProvider>{children}</ScrollProvider>
      </MemoryRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from RTL so tests only need one import
export * from "@testing-library/react";
export { renderWithProviders as render };
