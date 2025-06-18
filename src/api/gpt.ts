const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const gptAPI = {
  async generatePrompt(selectedCComponents: string[]): Promise<any> {
    try {
      const response = await fetch(`${BASE_URL}/api/gpt/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for httpOnly cookies
        body: JSON.stringify({ components: selectedCComponents }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate prompt");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error instanceof Error ? error : new Error("Network error");
    }
  },

  async generateCode(
    componentsInfo: string,
    selectedApp: { name: string; description: string }
  ): Promise<any> {
    try {
      const response = await fetch(`${BASE_URL}/api/gpt/generateCode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for httpOnly cookies
        body: JSON.stringify({ componentsInfo, selectedApp }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate code");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error instanceof Error ? error : new Error("Network error");
    }
  },
};
