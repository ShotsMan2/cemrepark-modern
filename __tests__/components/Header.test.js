import React from "react";
import { render } from "@testing-library/react";
import Header from "../../src/components/Header";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useStore } from "../../src/context/StoreContext";

// Mock dependencies
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

jest.mock("../../src/context/StoreContext", () => ({
  useStore: jest.fn(),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }) => {
    return <a href={href}>{children}</a>;
  },
}));

jest.mock("../../src/components/ThemeToggle", () => {
  return function MockThemeToggle() {
    return <div data-testid="theme-toggle" />;
  };
});

describe("Header Component", () => {
  beforeEach(() => {
    useSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    usePathname.mockReturnValue("/");

    useStore.mockReturnValue({
      cartItems: [],
      favoriteItems: [],
      isLoaded: true,
      language: "tr",
      setLanguage: jest.fn(),
      currency: "TRY",
      setCurrency: jest.fn(),
      t: (key) => key,
      settings: {},
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should not render on admin routes", () => {
    usePathname.mockReturnValue("/admin/dashboard");
    const { container } = render(<Header />);
    expect(container).toBeEmptyDOMElement();
  });

  it("should render correctly on public routes", () => {
    usePathname.mockReturnValue("/products");
    const { container } = render(<Header />);
    expect(container).not.toBeEmptyDOMElement();
  });
});
