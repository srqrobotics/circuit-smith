const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const project = {
  async saveProject(jsonString: any, cppString: any, projectId: string) {
    const response = await fetch(`${BASE_URL}/api/projects/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        wiring: jsonString,
        code: cppString,
        projectId: projectId,
      }),
    });
    return response.json();
  },
};
