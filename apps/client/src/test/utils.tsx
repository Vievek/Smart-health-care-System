import { ReactElement } from "react";
import { render, RenderOptions, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import { vi } from "vitest";

// Mock the auth context properly
vi.mock("../contexts/AuthContext", async () => {
  const actual = await vi.importActual("../contexts/AuthContext");
  return {
    ...(actual as any),
    useAuth: vi.fn(),
  };
});

const TestAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <TestAuthProvider>{children}</TestAuthProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

// Helper to wait for loading to complete
const waitForLoadingToComplete = async () => {
  await waitFor(
    () => {
      // Wait for any loading spinners to disappear
      const loadingElements = document.querySelectorAll(
        '[class*="loading"], [class*="Loading"], [class*="spinner"], [class*="Spinner"]'
      );
      const isLoading = Array.from(loadingElements).some(
        (el) =>
          el.textContent?.includes("Loading") ||
          el.className.includes("loading") ||
          el.className.includes("spinner")
      );
      if (isLoading) {
        throw new Error("Still loading");
      }
    },
    { timeout: 5000 }
  );
};

// Helper to wait for API calls to resolve
const waitForAPICalls = async (timeout = 3000) => {
  await new Promise((resolve) => setTimeout(resolve, timeout));
};

export * from "@testing-library/react";
export { customRender as render, waitForLoadingToComplete, waitForAPICalls };
