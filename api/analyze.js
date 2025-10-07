// api/analyze.js - V46.0-stream (啟用串流模式)

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_MODEL = 'deepseek-chat';

const SYSTEM_PROMPT = "你是一位精通中國古代《神獸七十二型人格》理論的資深分析師。你的任務是根據用戶提供的『六獸-六親-地支』組合和情境，輸出深度且具體的分析報告。報告必須專業、嚴謹，並且字數至少 800 字。";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    if (!DEEPSEEK_API_KEY) {
        return res.status(500).json({ error: 'Server configuration error: DEEPSEEK_API_KEY is missing.' });
    }

    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Missing required parameter: prompt.' });
        }

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: DEEPSEEK_MODEL,
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 3000,
                stream: true, // ⭐️ 啟用串流模式
            })
        });

        // 直接將 DeepSeek 的串流響應轉發給前端
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            res.write(decoder.decode(value));
        }
        res.end();

    } catch (error) {
        console.error("DeepSeek API Error:", error.message || error);
        res.status(500).end('Stream error');
    }
}
