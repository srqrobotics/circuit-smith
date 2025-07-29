// api/proxy.ts

import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";

const ALLOWED_ORIGIN = "http://localhost:5173";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for all responses
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

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
