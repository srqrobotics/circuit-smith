// api/proxy.ts

import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API_KEY is not set" });
  }

  try {
    const response = await axios.get("https://external-api.com/data", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch data" });
  }
}
