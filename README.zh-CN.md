<div align="center">
  <img src="docs/assets/brand/ifc-clashtrace-github-logo.png" width="240" alt="IFC ClashTrace 产品 Logo：金属管线穿过多层墙体，旁侧显示碰撞标记与审查提示。">

# IFC ClashTrace

**在浏览器本地生成确定性 IFC 碰撞证据，并提供可选 AI 解读。**

[在线站点](https://ifc-clashtrace.tuned-box-0320.chatgpt.site) · [产品视频](https://www.youtube.com/watch?v=jK3OSltoTEQ) · [English](README.md)

![Build](https://img.shields.io/badge/build-passing-2f855a?style=flat-square)
![IFC](https://img.shields.io/badge/IFC-IFC4-4b5563?style=flat-square)
![License](https://img.shields.io/badge/code-MIT-2563eb?style=flat-square)
![Data](https://img.shields.io/badge/generated_data-CC0--1.0-7c3aed?style=flat-square)
</div>

IFC ClashTrace 在浏览器内比较一份 MEP IFC 与一份结构 IFC，生成确定性的硬碰撞和表面净距记录。每条结果都可追溯到双方构件与计算证据；当几何不足以支持可靠结论时，系统会失败关闭为 `NOT_EVALUATED`，不会猜测 `CLEAR`。

公开 Sites 已上线。可选 Groq 解读位于服务器端，必须逐次预览字段并重新同意，而且不能修改任何确定性记录。经审计的双语 GitHub 交付已发布并完成逐字节复核。

**访问说明：** 截至 2026 年 9 月 1 日，经本项目实际验证，部署于 OpenAI Codex Sites 的 Live Site 无法通过中国香港本地网络直接访问；启用 VPN、连接至日本或新加坡节点并使用全局路由后可以正常访问。需要采用此方式的访问者，应在遵守所在地法律法规、相关服务条款及所在组织网络政策的前提下，自行配置和使用合规的 VPN 或代理服务。访问者须自行承担由此产生的账户、隐私、网络安全、费用及法律风险；本项目不提供相关工具或配置支持，也不对其使用或后果承担责任。GitHub 仓库及 README 中的公开内容不受此限制。

## 主要特点

- **IFC 浏览器本地处理**：IFC 字节、网格、文件名、路径、GUID 和构件名称不会发送给 AI 提供方。
- **两条确定性规则**：硬碰撞采用严格 `> 2 mm` 语义，表面净距采用 `< 50 mm` 预警语义。
- **证据优先的审阅流程**：可筛选记录、双方构件身份、测量值、诊断、完整证据抽屉以及 Three.js 聚焦/隔离。
- **失败关闭**：几何缺失、退化或不受支持时返回 `NOT_EVALUATED`。
- **可选 AI 解读**：默认关闭、发送前精确预览、逐次新同意、严格 Schema 校验和确定性本地降级。
- **双语界面**：支持英语与简体中文，并持久保存亮色/暗色偏好。
- **公开证据链**：受控夹具、评价记录、支持边界、部署架构、许可证和研发历程均可检查。

## 在线体验

打开[在线工作台](https://ifc-clashtrace.tuned-box-0320.chatgpt.site/app/)，然后：

1. 选择 `Review pack · C01 / C03 / C05 / C08`。
2. 点击“载入受控示例”。
3. 运行确定性检查。
4. 分别检查一条 `CLASH`、`WARNING`、`CLEAR` 和 `NOT_EVALUATED` 记录。
5. 如需 AI，可主动开启，检查拟发送字段，并只为本次请求提供新同意。

如需更大样例，可选择 `PG-E · Realistic one-storey clinic · 88 pairs`。

## 工作原理

```text
MEP IFC + 结构 IFC
        │
        ▼
浏览器本地 web-ifc 解析
        │
        ▼
确定性硬碰撞 + 净距引擎
        │
        ├── 记录、测量、诊断与 3D 证据
        │
        └── 可选最小派生字段
                │ 精确预览 + 逐次同意
                ▼
             同源 Worker
                │
                ├── Groq 解读（服务可用时）
                └── 确定性本地降级
```

确定性引擎始终是权威来源。提供方只返回解释性文字，不能更改状态、规则、测量值、构件映射或证据字段。

## 快速开始

### 环境要求

- Node.js 24 或更高版本
- PowerShell 7（用于完整验证）
- Desktop Chrome（当前受支持的交互审阅路径）

### 安装与运行

```bash
npm ci
npm run build
npm run preview
```

打开 `http://127.0.0.1:4173/`。

确定性功能不需要 API Key。`GROQ_API_KEY` 仅为可选项，必须保留在服务器端，禁止提交到仓库。启用本地提供方路由前，请阅读 [.env.example](.env.example) 与 [AI 架构](docs/g4ai-architecture.md)。

## 验证

运行当前完整构建与回归链：

```powershell
pwsh -NoProfile -File scripts/test-g6.ps1
```

还可运行聚焦的公开契约：

```powershell
pwsh -NoProfile -File scripts/test-pg-c.ps1
pwsh -NoProfile -File scripts/test-pg-b.ps1
pwsh -NoProfile -File scripts/test-pg-e.ps1
pwsh -NoProfile -File scripts/test-g7b.ps1
```

当前受控证据：

| 证据 | 结果 |
|---|---:|
| 冻结硬碰撞案例 | 8/8 三方状态一致 |
| 独立净距夹具 | 两条求值路线均为 9/9 一致 |
| 受控硬碰撞 TP / FP / FN / TN | 3 / 0 / 0 / 4，另有 1 个刻意放弃判定案例 |
| PG-E 技术哨兵 | 6/6 |
| PG-E 完整结果集 | 4 `CLASH`、1 `WARNING`、72 `CLEAR`、11 `NOT_EVALUATED` |
| 托管 AI 受控实测 | 提供方模式；确定性 `1/1/1/1` 汇总保持不变 |

这些是有边界的受控结果，不代表任意真实工程准确率，也不构成工程认证。

## 当前支持边界

| 范围 | 当前支持 |
|---|---|
| Schema | IFC4 |
| 编码 | 未压缩 STEP IFC |
| 长度单位 | 米 |
| 坐标 | 共享项目坐标；不自动配准 |
| 文件大小 | 每个候选文件不超过 25 MiB |
| 主要运行环境 | Desktop Chrome，至少 1024 CSS px |
| 硬碰撞 | 经证明的内部深度严格大于 2 mm |
| 净距预警 | 表面距离小于 50 mm |
| 移动端计算 | 当前不支持 |

IFC4X3 和更广泛的导出器兼容性仍处于探索阶段。输入不受支持或存在歧义时会失败关闭。

## 隐私与 AI 边界

AI 默认关闭。只有界面展示了精确派生字段并获得本次新同意后，才可能发送请求。单次请求最多包含六条记录，并明确排除：

- IFC 字节和网格；
- GUID、构件名称、文件名、路径和哈希；
- 诊断、浏览器元数据、账户数据和私有项目内容。

托管凭据以 Sites Secret 形式保存，不进入仓库、客户端 Bundle、Source Map、日志或公开错误正文。提供方不可用、超时、限额、格式错误、拒绝或语义违规时，系统会失败关闭到本地解读，同时保留完整确定性证据。

## 项目结构

```text
app/                     浏览器界面、确定性客户端与 AI 边界
worker/                  同源托管 AI Worker
data/                    冻结受控数据与生成的 CC0 夹具
development/             公开研发与证据日志
docs/                    架构、评价、隐私与 Gate 记录
scripts/                 生成器、测试和发布检查
spikes/                  保留的可行性与浏览器实验
```

## 文档

- [评价与测量边界](docs/evaluation.md)
- [确定性浏览器核心](docs/g3-core-engine.md)
- [可选 AI 架构](docs/g4ai-architecture.md)
- [部署架构](docs/g6-deployment-architecture.md)
- [隐私与许可证审计](docs/g6-privacy-license-audit.md)
- [产品品牌与 Logo 证据](docs/pg-b-github-logo.md)
- [生成数据与许可证](docs/data-and-licenses.md)
- [内容主张台账](docs/content-claim-ledger.md)
- [研发历程](https://ifc-clashtrace.tuned-box-0320.chatgpt.site/development/)

## 参与贡献

欢迎提交 Issue 和范围明确的 Pull Request。规则变更必须保留确定性输出、添加可复现夹具、让未知几何继续失败关闭，并在提交前运行完整 G6 验证链。

请勿提交私有 IFC、凭据、本地 `.env`、构建产物、浏览器配置或视频制作二进制文件。

## 许可证

源代码采用 [MIT License](LICENSE)。项目生成的 IFC 夹具采用 [CC0-1.0](data/generated/LICENSE.md)。第三方组件保留各自许可证，详见 [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) 与 [docs/dependency-licenses.json](docs/dependency-licenses.json)。

## 免责声明

IFC ClashTrace 是聚焦型审阅原型，不构成工程、法规、消防、结构安全或合规认证。项目决策应由合格审阅者根据完整模型和证据作出。
