"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";

export default function Home() {
  // 状态管理
  const [isLoading, setIsLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState("");
  const [formData, setFormData] = useState({
    model: "deepseek/deepseek-r1-0528:free",
    keywords: "",
    description: "",
    language: "中文",
    tone: "专业",
    role: ""
  });

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
      }
    } catch (error) {
      console.error("生成失败:", error);
      import('sonner').then(({ toast }) => {
        toast.error(error instanceof Error ? error.message : '生成失败，请稍后重试');
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
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
                    <SelectItem value="deepseek/deepseek-r1-0528:free">deepseek/deepseek-r1-0528:free</SelectItem>
                    <SelectItem value="moonshotai/kimi-k2:free">moonshotai/kimi-k2:free</SelectItem>
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
                {isLoading ? "生成中..." : "开始生成"}
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
                <div className="flex items-center justify-center h-full">
                  <p>生成中...</p>
                </div>
              ) : aiOutput ? (
                <div className="whitespace-pre-wrap">{aiOutput}</div>
              ) : (
                <div className="text-muted-foreground flex items-center justify-center h-full">
                  <p>AI 生成的内容将显示在这里</p>
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
