const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export interface SignupData {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
  };
}

export const authAPI = {
  async signup(data: SignupData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/users/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for httpOnly cookies
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Signup failed");
      }

      return result;
    } catch (error) {
      throw error instanceof Error ? error : new Error("Network error");
    }
  },

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/users/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for httpOnly cookies
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      return result;
    } catch (error) {
      throw error instanceof Error ? error : new Error("Network error");
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${BASE_URL}/api/users/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  async verifyToken(): Promise<AuthResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/users/validate`, {
        method: "GET",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Token verification failed");
      }

      return result;
    } catch (error) {
      throw error instanceof Error ? error : new Error("Network error");
    }
  },
};
