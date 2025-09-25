// /api/analyze.js
export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.status(200).json({
    message: "API 測試成功 ✅",
    input: req.body || null
  });
}
