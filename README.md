[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/ponponon-claude-code-src-badge.png)](https://mseep.ai/app/ponponon-claude-code-src)

# Claude Code 2.1.88 Source Recovery

<p align="center">
  <img src="https://img.shields.io/badge/Version-2.1.88-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/Status-Recovered-green.svg" alt="Status">
  <img src="https://img.shields.io/badge/Language-TypeScript-blue.svg" alt="Language">
  <img src="https://img.shields.io/badge/UI-Ink%20%2F%20React-orange.svg" alt="UI">
</p>

---

## 🌟 强力推荐：DataEyesAI - 你的全能 AI 助手

> **想要像 Claude Code 一样高效，却苦于没有稳定的 API 接入？**

**[DataEyesAI](https://dataeyes.ai/?promoter_code=4qx9suz3)** 是为你量身打造的一站式 AI 聚合平台！

- ⚡ **聚合全球顶尖模型**：一键接入 GPT-5、Claude 4.6、Gemini 3.1 等主流大模型。
- 💰 **极致性价比**：官方原厂满血版 API，价格却极具竞争力，让你用最少的成本享受最强的 AI 能力。
- 🛡️ **稳定可靠**：专业运维 7x24 小时守护，企业级 SLA 保障，告别连接断断续续的烦恼。
- 🛠️ **开发者友好**：标准 API 接口，完美适配各类开源项目、CLI 工具及开发流程。

👉 **[立即注册体验，开启你的 AI 生产力起飞之旅！](https://dataeyes.ai/?promoter_code=4qx9suz3)**

👉 请点击：[https://dataeyes.ai/?promoter_code=4qx9suz3](https://dataeyes.ai/?promoter_code=4qx9suz3)

---

> [!IMPORTANT]
> **这是一个针对 `@anthropic-ai/claude-code` 2.1.88 版本的源码整理与重建项目。**
> 该版本发布到 npm 时附带了可还原源码的 source map。本项目基于 `sources` 和 `sourcesContent` 将其还原为可读的源码目录，旨在研究 Claude Code 的 CLI 架构、命令系统及 MCP 实现。
> 
> 从 cli.js.map 还原后，一共有 70w 行代码
> <img width="794" height="387" alt="图片" src="https://github.com/user-attachments/assets/ab30578b-d6d2-440c-abde-ddf09e5d42de" />


## 🚀 快速安装 (镜像源)

背景：2026.03.31 claude code 上 npm 上传了包含 claude code 源码的 `cli.js.map` 文件

<img width="1497" height="242" alt="图片" src="https://github.com/user-attachments/assets/b1a01c8d-f14c-46d5-b6cb-4f5b4f90c9ab" />


由于 2.1.88 版本已从[官方 npm](https://www.npmjs.com/package/@anthropic-ai/claude-code/v/2.1.88?activeTab=code) 下架，直接使用 `npm install @anthropic-ai/claude-code@2.1.88` 会报错，你可以通过腾讯缓存镜像进行安装：

```shell
npm install -g https://mirrors.cloud.tencent.com/npm/@anthropic-ai/claude-code/-/claude-code-2.1.88.tgz
```

<img width="626" height="370" alt="图片" src="https://github.com/user-attachments/assets/bcc1d094-f19d-4bd7-b53b-898399c6d117" />


> 手慢无，不知道腾讯云的镜像缓存什么时候也没了


可以关注我的公众号，行业第一手信息，都会发在文章中

<img width="932" height="380" alt="图片" src="https://github.com/user-attachments/assets/1e0b00bc-d44b-4466-a488-703933428b93" />


---

## 项目结构概览

本项目以 `src/` 为核心，高度还原了原始代码组织：

- **`src/entrypoints/`** - CLI 入口与初始化逻辑
- **`src/commands/`** - 强大的命令系统 (`login`, `mcp`, `review`, `tasks` 等)
- **`src/components/`** - 基于 **React + Ink** 的终端 UI 组件
- **`src/services/`** - 核心业务逻辑 (策略、同步、远程能力等)
- **`src/hooks/`** - 交互式终端状态管理
- **`src/utils/`** - 认证、文件操作、进程管理等工具函数
- **`src/ink/`** - 定制的终端渲染基础设施

---

## 源码亮点

从还原的代码中，我们可以深入探索以下核心设计：

- **命令装载机制**：支持内建命令、动态 skills、插件及 MCP 命令的混合装载。
- **终端 UI 艺术**：如何利用 React 组件在终端中构建复杂的交互界面。
- **MCP 深度集成**：Model Context Protocol 在 CLI 中的具体实现与应用。
- **Feature Flags**：源码中随处可见的特性裁剪与构建期控制逻辑。

---

## ⚠️ 免责声明

- **非官方项目**：本仓库并非 Anthropic 官方仓库，亦不代表其立场。
- **版权说明**：原始代码的版权、商标及相关权利归原权利方（Anthropic）所有。
- **研究用途**：本项目仅供归档、结构分析与源码阅读，不应被视为官方开源项目。
- **法律风险**：如需二次发布或商用，请自行评估相关许可与法律风险。

---

## 后续计划 (待补齐)

如果你想让它跑起来，建议按以下步骤尝试：
1. 添加 `package.json` 并配置依赖。
2. 补齐构建工具链。
3. 处理 `bun:bundle` 宏与 feature flags。
4. 验证核心命令的运行情况。

---

## 致谢

感谢发布时未移除的 **Source Map**，让这份精致的工程结构得以重现。

---

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=ponponon/claude_code_src&type=Date)](https://star-history.com/#ponponon/claude_code_src&Date)
