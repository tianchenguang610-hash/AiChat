"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  // 状态管理
  const [isLoading, setIsLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState("");
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    model: "meta-llama/llama-3.2-3b-instruct:free",
    keywords: "",
    description: "",
    language: "中文",
    tone: "专业",
    role: ""
  });

  // Supabase 用户初始化与会话监听
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  // Google 登录
  const handleGoogleLogin = async () => {
    const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });
  };

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 处理下拉选择变化
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 处理生成按钮点击
  const handleGenerate = async () => {
    // 表单验证
    if (!formData.model || !formData.keywords || !formData.description) {
      // 使用 sonner 显示错误提示
      import('sonner').then(({ toast }) => {
        toast.error("请填写所有必填字段");
      });
      return;
    }

    setIsLoading(true);
    setAiOutput("");

    // 重试机制
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        // 调用 API
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          
          // 如果是限流错误，尝试重试
          if (response.status === 429 && retryCount < maxRetries - 1) {
            retryCount++;
            import('sonner').then(({ toast }) => {
              toast.warning(`模型暂时限流，正在重试... (${retryCount}/${maxRetries})`);
            });
            // 等待 2 秒后重试
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
          
          if (errorData.error === '缺少 OpenRouter API Key') {
            throw new Error('请在 .env.local 文件中设置有效的 OPENROUTER_API_KEY');
          } else {
            throw new Error(errorData.error || '生成失败');
          }
        }

        // 处理普通响应
        const data = await response.json();
        if (data.result) {
          setAiOutput(data.result);
          import('sonner').then(({ toast }) => {
            toast.success("内容生成成功！");
          });
        }
        break; // 成功后跳出重试循环
        
      } catch (error) {
        console.error("生成失败:", error);
        
        // 如果是网络错误且还有重试次数，继续重试
        if (retryCount < maxRetries - 1 && (error instanceof TypeError || error.message.includes('fetch'))) {
          retryCount++;
          import('sonner').then(({ toast }) => {
            toast.warning(`网络错误，正在重试... (${retryCount}/${maxRetries})`);
          });
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        
        // 最终失败
        import('sonner').then(({ toast }) => {
          toast.error(error instanceof Error ? error.message : '生成失败，请稍后重试或切换其他模型');
        });
        break;
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto py-6">
      {/* 顶部登录区域 */}
      <div className="flex items-center justify-end mb-4">
        {user ? (
          <div className="flex items-center gap-3">
            <img
              src={user.user_metadata?.avatar_url || user.user_metadata?.picture || "/vercel.svg"}
              alt={user.user_metadata?.full_name || user.user_metadata?.name || "avatar"}
              className="w-8 h-8 rounded-full border"
            />
            <span className="text-sm text-muted-foreground">
              {user.user_metadata?.full_name || user.user_metadata?.name || user.email}
            </span>
          </div>
        ) : (
          <Button variant="default" onClick={handleGoogleLogin}>使用 Google 登录</Button>
        )}
      </div>

      <h1 className="text-3xl font-bold mb-6 text-center">AI 写作助手 Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 左侧输入表单区域 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>核心写作输入</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="model" className="text-sm font-medium">模型选择</label>
                <Select 
                  value={formData.model} 
                  onValueChange={(value) => handleSelectChange("model", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择 AI 模型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meta-llama/llama-3.2-3b-instruct:free">meta-llama/llama-3.2-3b-instruct:free</SelectItem>
                    <SelectItem value="anthropic/claude-3-haiku:beta">anthropic/claude-3-haiku:beta</SelectItem>
                    <SelectItem value="google/gemini-2.5-flash:free">google/gemini-2.5-flash:free</SelectItem>
                    <SelectItem value="google/gemini-2.0-flash-exp:free">google/gemini-2.0-flash-exp:free</SelectItem>
                    <SelectItem value="moonshotai/kimi-k2:free">moonshotai/kimi-k2:free</SelectItem>
                    <SelectItem value="deepseek/deepseek-r1-0528:free">deepseek/deepseek-r1-0528:free</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="keywords" className="text-sm font-medium">主题关键词</label>
                <Input
                  id="keywords"
                  name="keywords"
                  placeholder="输入 1-5 个核心关键词，例如：量子计算, 未来趋势, 挑战"
                  value={formData.keywords}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">主题描述</label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="输入详细的主题背景或写作要求"
                  rows={5}
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <Button 
                className="w-full" 
                onClick={handleGenerate}
                disabled={isLoading || !formData.model || !formData.keywords || !formData.description}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    生成中...
                  </div>
                ) : "开始生成"}
              </Button>
            </CardContent>
          </Card>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="advanced-settings">
              <AccordionTrigger>高级设置</AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="language" className="text-sm font-medium">语言选择</label>
                      <Select 
                        value={formData.language} 
                        onValueChange={(value) => handleSelectChange("language", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择语言" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="中文">中文</SelectItem>
                          <SelectItem value="英文">英文</SelectItem>
                          <SelectItem value="日文">日文</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="tone" className="text-sm font-medium">语气选择</label>
                      <Select 
                        value={formData.tone} 
                        onValueChange={(value) => handleSelectChange("tone", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择语气" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="专业">专业</SelectItem>
                          <SelectItem value="幽默">幽默</SelectItem>
                          <SelectItem value="正式">正式</SelectItem>
                          <SelectItem value="非正式">非正式</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="role" className="text-sm font-medium">角色扮演</label>
                      <Input
                        id="role"
                        name="role"
                        placeholder="定义 AI 扮演的角色，例如：你是一位资深的市场分析师"
                        value={formData.role}
                        onChange={handleInputChange}
                      />
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* 右侧输出结果区域 */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>AI 生成结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-[400px] border rounded-md p-4 bg-muted/50">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-muted-foreground">AI 正在为您生成内容，请稍候...</p>
                </div>
              ) : aiOutput ? (
                <div className="whitespace-pre-wrap leading-relaxed">{aiOutput}</div>
              ) : (
                <div className="text-muted-foreground flex flex-col items-center justify-center h-full gap-2">
                  <div className="text-4xl">✨</div>
                  <p>AI 生成的内容将显示在这里</p>
                  <p className="text-xs">填写左侧表单并点击"开始生成"</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Toaster />
    </div>
  );
}
