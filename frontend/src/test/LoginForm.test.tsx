/// <reference types="vitest" />

/* //The purpose of the test is to:
    - check render login form 
    - check toggles to registration form
    - check logs in successfully
    - check error if passwords do not match
*/

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuthModal from "../components/Login/LoginForm";
import { ChakraProvider } from "@chakra-ui/react";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { vi } from "vitest";

// Mock jwt-decode
vi.mock("jwt-decode", () => ({
  jwtDecode: vi.fn(),
}));

// Mock axios
vi.mock("axios");

// Külön változókban a mock függvények
const mockJwtDecode = jwtDecode as unknown as ReturnType<typeof vi.fn>;
const mockAxiosPost = axios.post as unknown as ReturnType<typeof vi.fn>;
const mockAxiosGet = axios.get as unknown as ReturnType<typeof vi.fn>;

const mockSetUser = vi.fn();
const mockOnAuthSuccess = vi.fn();
const mockOnClose = vi.fn();

const renderModal = () => {
  return render(
    <ChakraProvider>
      <UserContext.Provider
        value={{ user: null, setUser: mockSetUser, logout: vi.fn() }}
      >
        <AuthModal
          isOpen={true}
          onClose={mockOnClose}
          onAuthSuccess={mockOnAuthSuccess}
        />
      </UserContext.Provider>
    </ChakraProvider>
  );
};

describe("AuthModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login form by default", () => {
    renderModal();
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("toggles to registration form", async () => {
    renderModal();
    const toggleButton = screen.getByRole("button", { name: /register/i });
    await userEvent.click(toggleButton);
    expect(screen.getByText("Registration")).toBeInTheDocument();
  });

  it("shows error if passwords do not match", async () => {
    renderModal();
    await userEvent.click(screen.getByRole("button", { name: /register/i }));

    await userEvent.type(screen.getByPlaceholderText("Enter your name"), "John");
    await userEvent.type(screen.getByPlaceholderText("Enter email"), "john@example.com");
    await userEvent.type(screen.getByPlaceholderText("Enter password"), "Password1");
    await userEvent.type(screen.getByPlaceholderText("Verify password"), "Different");
    await userEvent.type(screen.getByPlaceholderText("Enter your nickname"), "johnny");

    await userEvent.click(screen.getByRole("button", { name: /^register$/i }));

    expect(
      await screen.findByText("Passwords do not match!")
    ).toBeInTheDocument();
  });

  it("logs in successfully", async () => {
    const fakeToken = "fake.jwt.token";
    const decodedToken = {
      sub: "123",
      email: "user@example.com",
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "User",
    };

    mockJwtDecode.mockReturnValue(decodedToken);
    mockAxiosPost.mockResolvedValue({ data: { token: fakeToken } });
    mockAxiosGet.mockResolvedValue({
      data: {
        id: "123",
        username: "user@example.com",
        profilePicture: "",
        role: "User",
      },
    });

    renderModal();

    await userEvent.type(screen.getByPlaceholderText("Enter email"), "user@example.com");
    await userEvent.type(screen.getByPlaceholderText("Enter password"), "Password123");

    await userEvent.click(screen.getByRole("button", { name: /^login$/i }));

    await waitFor(() => {
      expect(mockJwtDecode).toHaveBeenCalledWith(fakeToken);
      expect(mockSetUser).toHaveBeenCalledWith({
        id: "123",
        username: "user@example.com",
        profilePicture: "",
        role: "User",
      });

      expect(mockOnAuthSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
