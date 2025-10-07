// api/analyze.js - V45.0 改為使用 DeepSeek API

// 確保 Vercel 環境變數中 DEEPSEEK_API_KEY 已設定
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// 設定要使用的 DeepSeek 模型
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
        
        // 使用 fetch 呼叫 DeepSeek API
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: DEEPSEEK_MODEL,
                messages: [
                    {
                        role: "system",
                        content: SYSTEM_PROMPT,
                    },
                    {
                        role: "user",
                        content: prompt,
                    }
                ],
                temperature: 0.7,
                max_tokens: 3000,
            })
        });

        // 檢查 API 回應是否成功
        if (!response.ok) {
            const errorData = await response.json();
            // 拋出錯誤，讓下方的 catch 區塊捕捉
            throw new Error(errorData.error.message || `API request failed with status ${response.status}`);
        }

        const completion = await response.json();

        // 成功響應
        res.status(200).json(completion);

    } catch (error) {
        console.error("DeepSeek API Error:", error.message || error);
        
        // 處理 API 請求失敗
        res.status(500).json({ 
            error: '分析服務器錯誤', 
            detail: error.message || '無法連線到 AI 服務。' 
        });
    }
}
