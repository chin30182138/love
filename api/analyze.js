import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "missing_env", detail: "OPENAI_API_KEY not set" });
  }

  const { aBeast, aKin, aBranch, bBeast, bKin, bBranch, dayBranch, monthBranch } = req.body;

  const prompt = `
你是一位「性愛劇本心理學大師」。
請根據以下輸入生成 JSON，格式必須如下（不要加任何解釋文字）：
{
  "text": "Markdown 格式的完整分析內容，分四部分：性愛場景與角色扮演、性愛技巧與體位推薦、性愛玩具與情境設置、六獸×地支 劇本片段（要有對話）",
  "scores": [數字,數字,數字,數字,數字],
  "match": 數字
}

輸入：
A方：${aBeast}／${aKin}／${aBranch}
B方：${bBeast}／${bKin}／${bBranch}
日支：${dayBranch}，月支：${monthBranch}
`;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      return res.status(500).json({ error: "parse_error", raw: content });
    }

    res.status(200).json(parsed);
  } catch (err) {
    console.error("OpenAI API error:", err);
    res.status(500).json({ error: "AI_error", detail: err.message });
  }
}
