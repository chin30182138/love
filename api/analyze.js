// api/analyze.js
import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const { aBeast, aKin, aBranch, bBeast, bKin, bBranch, dayBranch, monthBranch } = req.body || {};

  try {
    // 呼叫 OpenAI 產生分析
    const response = await client.responses.create({
      model: "gpt-5",
      input: `
請你根據以下資料做性愛人格與五行分析：
A方：${aBeast} × ${aKin} × ${aBranch}
B方：${bBeast} × ${bKin} × ${bBranch}
日支：${dayBranch}，月支：${monthBranch}

請輸出一段 Markdown 格式的完整分析，包括：
- 性愛場景與角色扮演
- 性愛技巧與體位推薦
- 性愛玩具與情境設置
- 綜合建議與能量解析
並給出契合度評分（0~100）。
      `,
    });

    const aiText = response.output_text || "⚠️ AI 沒有回覆內容";

    // 👉 隨機產生分數，避免前端沒有資料
    const match = Math.floor(Math.random() * 101);
    const scores = [
      Math.floor(Math.random() * 100),
      Math.floor(Math.random() * 100),
      Math.floor(Math.random() * 100),
      Math.floor(Math.random() * 100),
      Math.floor(Math.random() * 100),
    ];

    res.status(200).json({
      text: aiText,
      match,
      scores,
    });
  } catch (err) {
    console.error("Analyze API Error:", err);

    // 保底回傳，避免前端爆掉
    res.status(200).json({
      text: "⚠️ 系統發生錯誤，但這是測試用的假資料：建議嘗試更換題目或檢查 API 設定。",
      match: 50,
      scores: [50, 50, 50, 50, 50],
    });
  }
}
