---
# 💡 AI 写作助手 Demo (MVP) 产品需求文档 (PRD)

---

### 1. 概述 (Overview)

#### 1.1 产品目标 (Product Goal)
本项目旨在基于 **Next.js 14 (App Router)**、**React**、**Tailwind CSS** 和 **shadcn/ui** 技术栈，快速构建一个功能最小可行产品（MVP）版本的 **AI 写作助手 Demo**。该 Demo 核心功能是让用户输入主题信息和高级设置，通过 **OpenRouter API** 调用指定的 AI 模型，生成高质量的文本内容。

#### 1.2 目标用户 (Target Users)
* **开发者/技术爱好者:** 关注 Next.js, React, Tailwind, shadcn/ui 等技术栈的实践者。
* **内容创作者/学生:** 需要快速生成文本内容草稿、进行头脑风暴或测试不同 AI 模型效果的用户。

#### 1.3 技术栈 (Technology Stack)
* **前端框架:** Next.js 14 (App Router)
* **UI 库:** React
* **样式:** Tailwind CSS
* **组件库:** shadcn/ui
* **AI API:** OpenRouter

---

### 2. 功能需求 (Functional Requirements)

#### 2.1 核心写作输入 (Core Writing Input)

| ID | 功能模块 | 描述 | 优先级 | 备注 |
| :--- | :--- | :--- | :--- | :--- |
| **FR-01** | **模型选择** | 提供下拉菜单，让用户选择要调用的 AI 模型。| **高** | **必选项**。预置选项：`deepseek/deepseek-r1-0528:free`、`moonshotai/kimi-k2:free`。 |
| **FR-02** | **主题关键词** | 文本输入框。用户输入 1-5 个核心关键词。 | **高** | 文本输入，例如："量子计算, 未来趋势, 挑战"。 |
| **FR-03** | **主题描述** | 文本区域 (TextArea)。用户输入详细的主题背景或写作要求。 | **高** | 文本区域，提供充足的输入空间。 |
| **FR-04** | **生成按钮** | 触发 AI API 调用的按钮。 | **高** | 按钮文案：“**开始生成**”。 |

#### 2.2 高级设置 (Advanced Settings)

| ID | 功能模块 | 描述 | 优先级 | 备注 |
| :--- | :--- | :--- | :--- | :--- |
| **FR-05** | **语言选择** | 下拉菜单，选择生成内容的语言。 | **中** | 预置选项：中文、英文、日文。 |
| **FR-06** | **语气选择** | 下拉菜单，选择生成内容的语气/风格。 | **中** | 预置选项：专业、幽默、正式、非正式。 |
| **FR-07** | **角色扮演** | 文本输入框。定义 AI 扮演的角色。 | **中** | 例如：“你是一位资深的市场分析师” 或 “你是一位科幻小说家”。 |

#### 2.3 结果展示与交互 (Result Display & Interaction)

| ID | 功能模块 | 描述 | 优先级 | 备注 |
| :--- | :--- | :--- | :--- | :--- |
| **FR-08** | **AI 输出区域** | 专用的文本区域，实时展示/显示 AI 生成的内容。 | **高** | 建议支持 **Streaming** 模式展示输出。 |
| **FR-09** | **加载状态** | 在 API 调用期间，显示加载动画或状态提示。 | **高** | 禁用“开始生成”按钮，防止重复提交。 |
| **FR-10** | **错误提示** | 如果 API 调用失败，显示清晰的错误信息。 | **高** | 使用 `shadcn/ui` 的 Toast 或 Alert 组件。 |

---

### 3. 界面设计与交互 (UI/UX Design & Interaction)

#### 3.1 整体布局 (Overall Layout)
* **单页应用 (SPA) 风格:** 所有功能集中在同一页面，无需路由跳转。
* **两侧布局:** 左侧为输入表单区域（模型选择、主题信息、高级设置），右侧为输出结果区域。
* **响应式设计:** 确保在桌面和移动设备上基本可用。

#### 3.2 组件规范 (Component Specification)
* **UI 库:** 统一使用 **shadcn/ui** 组件 (`Input`, `Select`, `Textarea`, `Button`, `Card`, `Separator`等)。
* **表单样式:** 采用 `Card` 容器进行视觉分组，区分“核心输入”和“高级设置”。
* **“高级设置”交互:** 建议默认收起，通过一个**折叠/展开**组件（如 `Accordion` 或 `Sheet`）来显示，以保持界面简洁。

#### 3.3 交互细节 (Interaction Details)
* **必填校验:** 模型选择、主题关键词、主题描述需进行基本非空校验。
* **OpenRouter API Key:** 建议通过**环境变量** (`.env.local`) 或一个**临时输入框**在前端配置 OpenRouter API Key，以便部署和测试。MVP 版本建议直接通过环境变量配置，简化用户交互。

---

### 4. 技术实现细节 (Technical Implementation Details)

#### 4.1 数据流 (Data Flow)
1.  用户在左侧表单输入数据。
2.  点击“**开始生成**”按钮。
3.  前端将所有输入数据（包括模型、关键词、描述、语言、语气、角色）以及 API Key 发送到 **Next.js API Route** (如 `/api/generate`)。
4.  API Route 负责构建 OpenRouter API 所需的请求体（包括 **System Prompt** 的构建）。
5.  API Route 调用 OpenRouter API。
6.  API Route 将 AI 的响应（建议采用 **Streaming** 方式）发送回前端。
7.  前端实时在输出区域 (FR-08) 展示内容。

#### 4.2 Prompt 策略 (Prompt Strategy)
API Route 必须根据用户的输入动态构建一个清晰的 Prompt，作为请求体的一部分。

**核心 System Prompt 结构:**

