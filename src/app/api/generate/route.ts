import { NextRequest, NextResponse } from 'next/server';

// OpenRouter API 端点
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// 允许跨域请求的配置
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { model, keywords, description, language, tone, role } = await req.json();

    // 验证必要的字段
    if (!model || !keywords || !description) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // 获取 API Key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing OpenRouter API Key' },
        { status: 500 }
      );
    }

    // 构建 System Prompt
    let systemPrompt = `You are a professional writing assistant.`;
    
    // 添加角色设定
    if (role) {
      systemPrompt += ` ${role}`;
    }
    
    // 添加语言和语气设定
    const languageMap = {
      "中文": "Chinese",
      "英文": "English",
      "日文": "Japanese"
    };
    
    const toneMap = {
      "正式": "formal",
      "友好": "friendly",
      "专业": "professional"
    };
    
    const mappedLanguage = languageMap[language] || "Chinese";
    const mappedTone = toneMap[tone] || "professional";
    
    systemPrompt += ` Please write in ${mappedLanguage} with a ${mappedTone} tone,`;
    systemPrompt += ` about the following keywords: ${keywords}.`;
    systemPrompt += ` Ensure the content is logically clear, well-structured, and has depth.`;

    // 构建请求体
    const requestBody = {
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: description }
      ],
      stream: false,
      max_tokens: 1000
    };

    try {
      // 发送请求到 OpenRouter API
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://aichat-demo.vercel.app',
          'X-Title': 'AI Writing Assistant'
        },
        body: JSON.stringify(requestBody)
      });

      // 检查响应状态
      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API Error:', errorText);
        
        let errorMessage = 'API call failed';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error?.message || errorData.error || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        
        return NextResponse.json(
          { error: errorMessage },
          { status: response.status }
        );
      }

      // 处理成功响应
      const data = await response.json();
      return NextResponse.json({ result: data.choices[0]?.message?.content || '' });
      
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to connect to OpenRouter API' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Server internal error' },
      { status: 500 }
    );
  }
}