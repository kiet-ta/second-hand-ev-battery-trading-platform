import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { expect, test, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "./LoginPage"; // Import the component we are testing
import authApi from "../api/authApi"; // Import the api to mock it

// Mock react-router-dom's useNavigate
const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

// Mock the authApi
vi.mock("../api/authApi", () => ({
  default: {
    login: vi.fn(),
  },
}));

// Mock the Google GSI client to prevent 'window.google is undefined' errors
beforeEach(() => {
  window.google = {
    accounts: {
      id: {
        initialize: vi.fn(),
        renderButton: vi.fn(),
      },
    },
  };

  // Reset mocks before each test
  mockedNavigate.mockClear();
  authApi.login.mockClear();
});

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

test("renders header and login form in Vietnamese", () => {
  renderWithRouter(<LoginPage />);

  // Check for the main heading
  expect(
    screen.getByRole("heading", { name: "Đăng nhập" }),
  ).toBeInTheDocument();

  // Check for the correct placeholders
  expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Mật khẩu")).toBeInTheDocument();

  // Check for the submit button
  // Use getByRole for buttons, it's more robust
  expect(screen.getByRole("button", { name: "Đăng nhập" })).toBeInTheDocument();

  // Check for other elements
  expect(screen.getByText("Ghi nhớ đăng nhập")).toBeInTheDocument();
  expect(screen.getByText("Quên mật khẩu?")).toBeInTheDocument();
  expect(screen.getByText("Đăng ký ngay")).toBeInTheDocument();
});

test("updates email and password when typing", () => {
  renderWithRouter(<LoginPage />);

  // Find inputs by their placeholder text
  const emailInput = screen.getByPlaceholderText("Email");
  const passwordInput = screen.getByPlaceholderText("Mật khẩu");

  // Simulate user typing
  fireEvent.change(emailInput, { target: { value: "test@example.com" } });
  fireEvent.change(passwordInput, { target: { value: "password123" } });

  // Assert that the values have changed
  expect(emailInput).toHaveValue("test@example.com");
  expect(passwordInput).toHaveValue("password123");
});

test("shows validation error if fields are empty", async () => {
  renderWithRouter(<LoginPage />);

  // Find the login button and click it with empty fields
  const loginButton = screen.getByRole("button", { name: "Đăng nhập" });
  fireEvent.click(loginButton);

  // Wait for the error message to appear
  const errorMessage = await screen.findByText(
    "Vui lòng nhập đầy đủ thông tin đăng nhập.",
  );
  expect(errorMessage).toBeInTheDocument();

  // Ensure the API was NOT called
  expect(authApi.login).not.toHaveBeenCalled();
});

test("submits login form and calls authApi.login on success", async () => {
  // Mock a successful API response
  const mockUserData = {
    data: {
      userId: "123",
      token: "fake-token",
      role: "buyer",
    },
  };
  authApi.login.mockResolvedValue(mockUserData);

  renderWithRouter(<LoginPage />);

  // Fill in the form
  fireEvent.change(screen.getByPlaceholderText("Email"), {
    target: { value: "test@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText("Mật khẩu"), {
    target: { value: "password123" },
  });

  // Click the login button
  fireEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));

  // Wait for the API call to be made
  await waitFor(() => {
    // Check if the API was called with the correct credentials
    expect(authApi.login).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });

  // Check if navigation was called (for a 'buyer' role)
  await waitFor(() => {
    expect(mockedNavigate).toHaveBeenCalledWith("/");
  });
});

test("shows error message on failed login", async () => {
  // Mock a failed API response
  authApi.login.mockRejectedValue(new Error("Invalid credentials"));

  renderWithRouter(<LoginPage />);

  // Fill in the form
  fireEvent.change(screen.getByPlaceholderText("Email"), {
    target: { value: "wrong@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText("Mật khẩu"), {
    target: { value: "wrongpassword" },
  });

  // Click the login button
  fireEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));

  // Wait for the error message from the API failure
  const errorMessage = await screen.findByText(
    "Thông tin đăng nhập không chính xác.",
  );
  expect(errorMessage).toBeInTheDocument();

  // Ensure navigation did not happen
  expect(mockedNavigate).not.toHaveBeenCalled();
});
