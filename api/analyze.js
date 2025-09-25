import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { aBeast, aKin, aBranch, bBeast, bKin, bBranch, dayBranch, monthBranch } = req.body;

  const prompt = `
你是一位「性愛劇本心理學大師」。
請根據以下輸入生成一份完整分析，並且輸出 JSON 格式：
- 欄位 text: 一篇完整的性愛劇本分析，必須用 Markdown 格式，分成四個模組，每個模組用 ## 標題
  1. 性愛場景與角色扮演
  2. 性愛技巧與體位推薦
  3. 性愛玩具與情境設置
  4. 六獸 × 地支 劇本片段（要有對話與氛圍）
- 欄位 scores: 一個陣列 [情慾(火), 情感(水), 控制(土), 冒險(金), 創意(木)] 的分數，範圍 1~10
- 欄位 match: 一個契合度分數 (0~100)，用來代表雙方在性愛互動上的匹配程度

輸入：
A方：${aBeast}／${aKin}／${aBranch}
B方：${bBeast}／${bKin}／${bBranch}
日支：${dayBranch}，月支：${monthBranch}

請在 JSON 中輸出，不要加其他解釋文字。
`;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // 也可用 "gpt-4.1"
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9
    });

    let parsed;
    try {
      parsed = JSON.parse(completion.choices[0].message.content);
    } catch (e) {
      console.error("JSON parse error", e);
      return res.status(500).json({ error: "AI response not valid JSON" });
    }

    res.status(200).json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI analysis failed" });
  }
}
