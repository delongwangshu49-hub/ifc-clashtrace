# VG 视频预制作审核包（中文版）

状态：`VG 本地有限修复通过——公开检查点待授权；G7A 未启动`

日期：2026-08-31  
目标：IFC ClashTrace 产品宣传片  
模式：共同创作 / 已批准有限细化

> 本文件是中文主审阅稿。英语原版保留在 `docs/vg-video-preproduction.md`；台本在第 4 节保留英语原文并提供简体中文对照。字幕中文目前是**待人工复核草稿**，不是已经完成人工校对的最终字幕。

## 1. 当前阶段与边界

VG 只交付可审核、可复现的预制作方案，不生成或宣称已经生成最终成片。

| VG 当前完成 | 仅在完整 VG 获用户明确批准后进入 G7A |
|---|---|
| 创意方向、逐句台本、中译草稿、镜头表、关键帧表、风格帧、音乐/女声/SFX 试听、节拍网格、混音目标、录屏方案、隐私/许可/事实台账、备选方案 | 最终旁白合成、正式产品录屏、实时 AI 请求、Remotion 工程与动画、最终音效、剪辑、正式字幕、混音、渲染及音画 QA |

用户已确认创意包，并于 2026-08-31 选择 H。本次有限逻辑修复已在本地完成，但 VG 正式闭合仍需计划中的 GitHub 检查点。G7A 尚未启动，本包也不授权 GitHub、Sites、YouTube、公开访问或提供商密钥操作。

## 2. 已冻结的创意方向

| 项目 | VG 决定 |
|---|---|
| 核心主张 | **From geometry, to result, to evidence. Every relationship. Traceable. / 从几何，到结果，再到证据。每一组关系，皆可追溯。** |
| 受众 | 学术答辩评审优先；BIM 协调及技术审查者其次 |
| 定位 | 产品宣传优先，以学术可信度作为证据；借鉴 Apple 产品片的克制、精确、节奏与高级质感，但不复制其字体、标识、画面或具体创意 |
| 片长 | `172.2 秒`，位于批准的 `165–175 秒`区间内，并低于 `180 秒`硬上限 |
| 规格 | `1920 × 1080`、`16:9`、`30 fps`；最终导出属于 G7A |
| 旁白 | **最终选择 H：** 本地 Apache-2.0 `Kokoro-82M af_heart`，沿用 V2 `Warm Modern` 表演方向；英语女声，目标 `114–118 wpm`，温暖克制、无播音腔。D 仅保留为未采用备份；Chatterbox C 因实际输出男声被淘汰 |
| 音乐 | M2 — `Masking the Masters`，Eugenio Mininni，Mixkit，源时长约 `3:40` |
| 音效 | 已选 P1 `Dry Precision`，干、短、技术感强，保持稀疏 |
| 字幕 | G7A 输出人工校对后的英语与简体中文字幕；清洁母版不永久烧入整句字幕，平台不可靠时另备中文字幕审阅版 |
| 产品证据 | 使用真实界面及确定性浏览器计算；合成可重新构图/标注，但不能用生成式假界面替代真实产品运行 |
| AI 证据 | 独立录制一次 `C01/C03/C05/C08` 四记录最小包；每次均重新取得同意；不得把体量较大的 PG-E 诊所包发给 AI |

## 3. 音乐、女声与混音

### 3.1 M2 节拍图

- 使用 M2 原文件的 `00:38.506–03:30.706`，目标片段 `172.199881 秒`。
- 工作节拍为 `100.000069 BPM`；源文件网格相位为 `00:00.106208955`；选段从源文件 `00:38.506182` 的真实拍点开始，因此裁切后首拍为 `00:00.000`；拍间隔 `0.599999585 秒`。
- 严格剪辑网格验收：`33 ms`内瞬态覆盖率 `98.258%`、匹配点平均绝对误差 `8.377 ms`、选段估计漂移 `2.538 ms`，分别通过 `98% / 10 ms / 5 ms`门槛。另有 Librosa 节拍拟合的 `270` 个检测拍，模型最大/平均残差为 `13.461 / 3.602 ms`。
- 镜头边界使用第 `0 / 16 / 32 / 48 / 72 / 96 / 120 / 144 / 168 / 192 / 216 / 240 / 264 / 287` 拍。
- 全画幅冲击剪辑不超过三次；唯一一次加速蒙太奇是最大视觉节拍，不重复使用。
- 精确裁切、淡入淡出及音乐编辑属于 G7A；VG 只冻结来源区间和节拍网格。

机器可读数据：`artifacts/vg/analysis/beat_data.json`、`artifacts/vg/analysis/grid_drift.json`；镜头卡实现追溯：`docs/vg-shotcraft-manifest.json`。

### 3.2 零费用女声决定

此前 Ava 样本只用于确认 V2 的声线与表演方向，不作为最终发行音源。Azure Speech 的付费层会按使用量计费；项目是否商业用途并不会把付费 Azure 资源自动变成免费，因此付费路径已移除。用户最终选择 **H**：本机运行、Apache-2.0 许可的 `Kokoro-82M af_heart`，不产生语音 API 调用费，并让最终台本留在本机。G7A 必须先冻结 H 的模型与 voice-pack hash、合成设置和读音覆盖，再在本机合成最终旁白。D（Parler `Laura`）仅保留为未采用备份。C 的无参考 Chatterbox 试听被用户正确识别为男声；基频检查得到中位 `117.6 Hz`，因此继续仅作审计证据。

| 候选 | 定位 | VG 建议 |
|---|---|---|
| H · `af_heart` | 清晰、克制、接近 V2 的现代感；中位基频约 `193.5 Hz`；官方声音表评级 A | **最终选择** |
| D · Parler `Laura` | 明确命名女声，音高较 H 略低；中位基频约 `180.0 Hz`；可用文字控制克制、近讲和无播音腔 | 未采用备份；除非用户重新开启决定，否则不得使用 |
| C · Chatterbox | 无参考输出实际为男声，中位基频约 `117.6 Hz` | **已淘汰** |
| B · `af_bella` | 更温暖、更柔和；官方声音表评级 A- | 已降为被否决/备用试听 |

试听与审计文件：

- `artifacts/vg-auditions/V2-zero-cost-kokoro-af_heart-pcm16.wav`
- `artifacts/vg-auditions/V2-zero-cost-parler-laura-female.wav`
- `artifacts/vg-auditions/V2-zero-cost-chatterbox-default-male-rejected.wav`（仅审计）
- `artifacts/vg-auditions/V2-zero-cost-kokoro-af_bella-pcm16.wav`

发音冻结：IFC = “eye-eff-see”；IFC4 = “eye-eff-see four”；MEP = “em-ee-pee”；2 mm = “two millimetres”；50 mm = “fifty millimetres”；NOT_EVALUATED 按自然语言读作 “not evaluated”；IFC ClashTrace 读作 “eye-eff-see Clash Trace”。

表演约束：句尾平稳、不气声化；逗号停 `180–260 ms`，句号停 `420–620 ms`，最终标语前停 `700–900 ms`；数字客观、平静。G7A 可以对语速、停顿、音色和轻微动态作精修，但不得改写事实含义。

### 3.3 旁白—音乐最佳音量差

以下是 G7A 目标，不代表已完成混音：

- 说话段旁白约 `-16 LUFS`，最终节目约 `-14 LUFS`，真峰值不高于 `-1 dBTP`。
- M2 在旁白下方约 `10–14 LU`，说话时通常约 `-28 至 -26 LUFS`；有意留白或视觉峰值可升至 `-21 至 -19 LUFS`。
- 侧链起点：压低 `8–10 dB`、attack `60–90 ms`、release `300–450 ms`；按句自动化，不采用一个固定音乐音量。
- 旁白居中、偏干；音乐保持宽度；SFX 不得遮蔽辅音、数字和阈值。
- 最终必须进行响度测量，并用耳机、笔记本扬声器和手机扬声器复听。

## 4. 英语原台本 / 简体中文字幕草稿

英语共 `272 词`。每句均可按最慢 `114 wpm` 在所属镜头内读完，并至少保留 `420 ms`句末呼吸。中文是字幕语义翻译，不是第二条中文配音。

| 镜头 | English narration（原文） | 简体中文字幕草稿（待人工复核） | 事实编号 |
|---|---|---|---|
| S01 | Coordination begins with a simple question: when a pipe meets structure, can every result be explained? | 协调始于一个简单的问题：当管线与结构相遇，每一项结果都能被解释吗？ | F01 |
| S02 | IFC ClashTrace turns that question into a browser feasibility prototype, built on deterministic geometry, not probabilistic judgement. | IFC ClashTrace 将这个问题转化为浏览器端可行性原型：基于确定性几何，而非概率判断。 | F01 |
| S03 | Two IFC4 files are processed locally. Rules, limits, and evidence remain visible from the start. | 两份 IFC4 文件在本地处理；规则、边界与证据从一开始就保持可见。 | F02, F03 |
| S04 | Across the interface, one review flow connects model selection, calculation, filtered results, three-dimensional focus, and the evidence behind each relationship. | 在整个界面中，一条审查流程串联模型选择、计算、结果筛选、三维聚焦，以及每一组关系背后的证据。 | F04 |
| S05 | For a realistic demonstration, we use a synthetic, twelve-by-eight-metre, one-storey clinic with seven represented pipe routes and one deliberately geometry-free segment. | 为了进行拟真演示，我们使用一个合成的 12 米 × 8 米单层诊所：包含七条有几何表达的管线，以及一条刻意不含几何的管段。 | F05 |
| S06 | Its eighty-eight wall-and-beam relationships produce four clashes, one clearance warning, eleven not-evaluated records, and seventy-two clear results in the final hosted review. | 在最终托管审查中，88 组墙梁关系产生了 4 项碰撞、1 项净距预警、11 项未评估，以及 72 项清晰结果。 | F05 |
| S07 | Select a result, and the three-dimensional view isolates the pipe and structure together. The record exposes component types, rule, measurement, and evaluation boundary. | 选择一项结果，三维视图会同时隔离对应的管线与结构；记录则展示构件类型、规则、测量值与评估边界。 | F04 |
| S08 | A hard clash requires the approved interior-depth rule to exceed two millimetres. A separate warning appears below fifty millimetres of surface clearance. | 硬碰撞要求经批准的内部深度规则严格超过 2 毫米；表面净距低于 50 毫米时，则另行产生预警。 | F06 |
| S09 | If geometry, coordinates, units, or reliability fall outside the supported contract, the product fails closed as not evaluated. Uncertainty is never silently converted to clear. | 如果几何、坐标、单位或可靠性超出支持边界，产品会以“未评估”保守失败；不确定性绝不会被静默地转为“清晰”。 | F03, F06 |
| S10 | The controlled suite agrees across authored truth, an independent reference, and the browser core in all eight cases. Nine clearance fixtures agree across both evaluator routes. | 在全部八个受控案例中，人工编制真值、独立参考与浏览器核心三方一致；九个净距夹具也在两条评估路径上一致。 | F07 |
| S11 | AI stays separate. A four-record controlled pack exposes only minimal derived fields, requires fresh consent, and cannot change deterministic status or measurement. | AI 始终保持独立。四记录受控包只公开最小化派生字段，要求重新同意，且不能更改确定性状态或测量值。 | F08 |
| S12 | This remains a focused feasibility prototype: IFC4 STEP, unprefixed metre units, established shared coordinates, and pipe relationships against walls and beams. | 这仍是一个边界明确的可行性原型：支持 IFC4 STEP、无前缀米制单位、已建立的共享坐标，以及管段与墙梁之间的关系。 | F01, F09 |
| S13 | It is not engineering certification and does not claim arbitrary-project accuracy. It offers something more disciplined: geometry, result, evidence. Every relationship. Traceable. | 它不是工程认证，也不宣称适用于任意项目的准确性。它提供更严谨的路径：几何、结果、证据。每一组关系，皆可追溯。 | F01, F07 |

## 5. 13 镜镜头表

时间均相对于 `172.2 秒`目标片。“真实录屏”指 G7A 录制实际产品界面；VG 只规定镜头配方。每张 video-shotcraft 动作卡最多使用一次，并适配 IFC ClashTrace 的真实品牌色与真实截图。

| 镜头 | 时间 / 拍点 | 画面与动作 | 动作配方 | 必须读清 / 备选 |
|---|---|---|---|---|
| S01 | `00:00.0–00:09.6` / `0–16` | 深色开场；“TRACEABLE”作为窗口透出产品碎片，收束为规范标识与提问 | `text-as-mask` 一次 | 底部 15% 留字幕安全区；备选为 SF01 缓慢 2.5D 推进 |
| S02 | `00:09.6–00:19.2` / `16–32` | 产品页先以精确线稿显形，再对齐成为真实界面 | `wireframe-draw-on` 一次 | 放大 browser-local / deterministic；备选直接切完整主页 |
| S03 | `00:19.2–00:28.8` / `32–48` | 主页功能区块依次接力：Local / Deterministic / Evidence | `word-relay-filmstrip` 一次 | 字词变化时才移动；备选为三次卡拍硬切 |
| S04 | `00:28.8–00:43.2` / `48–72` | 一镜式界面导览只建立两条真实输入路径：先经过 A1/A2 自选文件，再经过 B · DEMO 受控实例，然后指向 Run → 筛选 → 证据；本镜不实际载入案例 | `cursor-flyover` 一次 | A1/A2、B · DEMO、Run 和证据入口等效放大至 150–180%；备选为同一份全新录屏的四个裁切特写 |
| S05 | `00:43.2–00:57.6` / `72–96` | PG-E 只走两个自选文件框：点击 **Choose MEP IFC**，打开中性演示文件夹并选择 PG-E MEP；再点击 **Choose structural IFC** 选择对应结构文件；勾选共享坐标确认；随后运行真实确定性计算并建立诊所 3D 全貌。成片中禁止从示例下拉框载入 PG-E | 产品及原生文件选择器连续录屏 | 必须看清两个固定角色、两个公开文件名、共享坐标确认和 Run；文件选择器不得出现用户名/仓库路径；备选仍须保留两次文件选择动作，不得改成点选示例 |
| S06 | `00:57.6–01:12.0` / `96–120` | 结果落定；计数出现；六视图加速到选定结果列表后长停 | `beat-cut-accelerando` 一次，`16→12→8→6→4f` | 必须看清 `4 / 1 / 11 / 72`；备选为静态摘要加慢推 |
| S07 | `01:12.0–01:26.4` / `120–144` | 选择碰撞记录，3D 聚焦管线与结构；产品时间冻结，编辑镜头绕证据平面后恢复 | `bullet-time-freeze-orbit` 一次 | 产品像素不改；备选为真实 3D 直线环绕与记录裁切 |
| S08 | `01:26.4–01:40.8` / `144–168` | 从碰撞证据移至预警边界，冻结标注 `>2 mm` 与 `<50 mm` | `freeze-annotate` 一次 | 比较符号必须精确；若可读可展示 50 mm 等值不预警；备选为两张 200% 裁切 |
| S09 | `01:40.8–01:55.2` / `168–192` | 打开故意无几何的记录，显示 NOT_EVALUATED 原因及单位/坐标/可靠性边界 | 原生 2.5D 分层 | 不显示本机路径/GUID；若诊所原因太密，改用 C08 受控失败关闭记录 |
| S10 | `01:55.2–02:09.6` / `192–216` | 开发/评价区显示 `8/8` 三方一致与 `9/9` 净距一致，紧接受控证据免责声明 | `spotlight-hero-card` 一次 | 指标和“受控验收”限定语同镜出现 |
| S11 | `02:09.6–02:24.0` / `216–240` | 使用可见的 B · DEMO 控件，点选 `Review pack · C01 / C03 / C05 / C08`，点击 **Load example**，把四记录确定性包作为一个受控批次运行；再显示最小字段预览、未勾选→勾选的新鲜同意、一次真实请求、带标签解释及不变摘要。可诚实压缩已录制状态之间的等待时间，但不得伪造成功；受控包禁止使用原生文件选择器 | 真实交互裁切 | 必须看清下拉选项、Load example、`1/1/1/1`、披露、同意和不变事实；失败时展示真实本地回退，不伪造成功 |
| S12 | `02:24.0–02:38.4` / `240–264` | IFC4 STEP / metre / shared coordinates / pipe vs wall & beam 环绕锁定，最后突出 feasibility prototype | 克制排版 + 浅多平面移动 | 切走前显示“Prototype, not certification”；备选 SF03 + 范围清单 |
| S13 | `02:38.4–02:52.2` / `264–287` | 从证据细节回到品牌；Geometry. Result. Evidence. 三拍落字，再出标语 | `white-flash-logo-simplify-cut` 一次，改为品牌珊瑚/墨黑/奶油色 | 字幕先结束再保留 Logo；备选无闪光的奶油底 Logo 收束 |

### 5.1 已冻结的镜头卡实现来源

九张命名镜头卡及其 style-key 已重新通过 `gallery/api/library.json` 校验。`docs/vg-shotcraft-manifest.json` 为每张卡冻结卡片文档、精确 demo TSX、参考样片路径与 SHA-256。G7A 可适配布局、真实产品素材和品牌 token，但必须保留已验证的时值、缓动、遮罩及已知坑规避参数。S05、S09、S11、S12 是原生录屏/编辑运镜，不虚构 Gallery 卡名。

## 6. 关键帧预处理表

VG 已生成 13 张 `1920 × 1080` 静态关键帧，以及一张 `3840 × 2160` 总表。它们是**可丢弃的构图占位稿**，不是最终视频帧。为赶在 VG 内快速确认构图，其中多处有意复用以前的项目预览图或风格帧，这是预处理权宜之计。**现有任何关键帧位图都未获准作为产品证据进入 G7A 正式时间线。**

- 总表：`artifacts/vg/keyframes/VG-keyframe-table-4k.png`
- 单帧：`artifacts/vg/keyframes/KF01-*.png` 至 `KF13-*.png`
- 可复建脚本：`scripts/build-vg-keyframe-board.py`

G7A 每镜只以对应关键帧为构图目标；实现前必须按下表逐镜替换为当前、正确、对应的产品画面。允许运动细化，但信息层级、产品状态、主张位置与字幕安全区若要偏离，必须在 take notes 写明理由。

| 镜头 | G7A 必须换入的最终来源 | 验收守卫 |
|---|---|---|
| S01 / S13 | 用规范 Logo 与已验证品牌 token 重建编辑图层 | 不把扁平 VG 风格帧直接当最终品牌镜头 |
| S02–S04 | 按批准语言/风格/主题全新采集当前主页与工作台 | 标签、布局与当前产品一致；不得让 `app/ui/previews/*` 旧栅格继续充当产品证据 |
| S05–S09 | 通过两个原生文件选择器载入 PG-E，并连续采集计算、结果和证据状态 | 文件角色/文件名/共享坐标确认、`4/1/11/72`、选中记录和 3D 聚焦必须来自同一 take 链 |
| S10 | 全新采集当前研发/评价页面，再叠加经核验的编辑主张层 | `8/8`、`9/9` 与受控证据限定语同镜 |
| S11 | 全新点选 `Review pack · C01 / C03 / C05 / C08`，再独立录制新鲜同意的 AI 交互 | 无 PG-E 数据、无原生文件选择器；`1/1/1/1`、预览与新鲜同意清楚可见 |
| S12 | 依据冻结支持边界重新制作编辑排版 | 不依赖旧截图；每个词与 F01/F09 一致 |

若任何镜头没有 `FINAL_SOURCE_VERIFIED` 记录，或仍把 VG/旧素材栅格作为可见产品证据，G7A 素材入库直接失败。这是使用关键帧快速预处理所对应的强制替换门。

## 7. 视觉风格系统

三张风格帧不是三套互斥设计，而是统一的“暗 → 亮 → 暗”章节系统：

| 风格帧 | 作用 | 守则 |
|---|---|---|
| `SF01-opening.png` | 品牌提问、最终可追溯母题 | 深墨色、一个珊瑚强调、大留白；不仿 Apple 标识或字体资产 |
| `SF02-product.png` | 产品主体与确定性计算 | 真实工作台、暖奶油底、PG-E 精确计数、清晰浏览器 UI |
| `SF03-evidence-ai.png` | 证据边界与 AI 分离 | 真实/淡化产品背景、明确同意边界；不得暗示 AI 负责计算或改写结果 |

文件位于 `artifacts/vg/styleframes/`。

## 8. 录屏、隐私与连续性

### 可用材料

- 仅使用公开/合成项目表面：主页、工作台、开发/评价页、G2/G3C 受控数据、合成 PG-E 诊所、规范 Logo 及项目自有截图。
- PG-E 只用于确定性产品演示，明确排除在 AI 请求之外。
- AI 镜头严格使用 `C01/C03/C05/C08`，各代表 CLASH / WARNING / CLEAR / NOT_EVALUATED 一条。
- 外部样片库只参考动作逻辑，不复制第三方样片、标识、截图或字体。

### G7A 每次录屏隐私检查

- 使用干净浏览器配置；隐藏书签、扩展、头像、通知、无关标签和历史。
- 不出现本机路径、Windows 用户名、仓库路径、提交凭据、API/provider key、控制台 payload 或 Sites 管理页面。
- PG-E 是程序化合成模型，不是真实诊所，不含客户、诊所或病人资料。
- 非必要不展示 GUID/hash；AI 记录优先显示短别名 `R01–R04`。
- 每次 take 前确认语言、主题、窗口宽度，并使旧结果失效。
- 以足够分辨率录制，确保后期 180–260% 放大仍清晰。
- 确定性计算至少保留一条真实连续 take；不得把生成式加载/结果插入连续 take。
- AI 调用独立于 PG-E；勾选同意前先录制预发送预览。

### 连续性冻结

| 段落 | 必须保持的状态 |
|---|---|
| 主页 | 英语 / Engineering minimal；深浅主题按镜头表 |
| PG-E 开始 | 无陈旧结果；通过 **Choose MEP IFC** 与 **Choose structural IFC** 从中性的公开演示文件夹载入；take 内完成共享坐标确认；禁止使用示例下拉框 |
| PG-E 结果 | 精确互斥计数 `4 / 1 / 11 / 72`；take notes 记录选中碰撞/预警 ID |
| 证据 | 一项碰撞、一项预警、一项 NOT_EVALUATED；列表、抽屉与 3D 对象一致 |
| 受控 AI | 在 B · DEMO 点选 `Review pack · C01/C03/C05/C08` 并点击 **Load example**；摘要 `1/1/1/1`；先展示预览；同意初始未勾选；仅发一次请求；禁止使用原生文件选择器 |

## 9. 字幕与屏幕文案

- 英文字幕逐字对应获批旁白，只为可读性调整标点。
- 中文字幕以第 4 节为底稿；人工校对重点检查阈值符号、计数、IFC 术语，以及 clear 与 clearance 的区别。
- 每个字幕 cue 表达一个完整意群，通常 1–2 行；不相关字幕切换之间至少留 `6 帧`；不得孤立数字或比较符号。
- 字幕置于底部 `10–12%`安全区，但必须避开真实产品控件和证据值。
- G7A 输出：清洁母版、人工校对的 `en.srt` 与 `zh-CN.srt`；中文字幕烧录审阅版只作备选。
- YouTube 字幕上传和公开播放回查属于 G7B，不属于 VG/G7A。

## 10. SFX 决定

用户已选择 **P1 Dry Precision**：短、干、技术感明确，仅用于有意义的状态变化。P2/P3 只保留为被否决的备份试听。P1 在 VG 仍是参考声板而非最终声音设计；G7A 可在不改变其干净克制性格的前提下细化合成和音量。

- 点击只用于真实状态变化；不做装饰性连续提示音。
- evidence lock / result settle 最多各出现必要次数。
- SFX 不得压过英语辅音、数字或阈值。
- 资产：`artifacts/vg-auditions/sfx/`；生成配方：`scripts/generate-vg-sfx-auditions.py`。

## 11. 许可与来源台账

| 资产 | 来源与许可决定 | G7A 要求 |
|---|---|---|
| 产品 UI、Logo、截图、IFC 夹具 | 本仓库，合成或项目自有 | 从干净状态重录，保留来源路径清单 |
| PG-E 诊所 | 程序化合成；见 `docs/pg-e-engineering-uat.md` | 仅作确定性演示；明确不是客户诊所；不得发给 AI |
| M2 | Eugenio Mininni / Mixkit Stock Music；当前列于 Mixkit Free License，可用于视频/YouTube | 最终使用前冻结源 URL、下载日期、文件 SHA-256 和带日期的许可快照 |
| Ava 试听 | 临时声线参考 | 不作为发行旁白 |
| 最终女声 H | `hexgrad/Kokoro-82M` 与 `af_heart` voice pack，Apache-2.0；本机零 API 费用 | **已选择**；冻结模型/voice hash、合成设置、读音覆盖、最终 WAV hash 与 Apache-2.0 notice |
| C 淘汰证据 | Resemble AI `Chatterbox`，MIT；无参考音频/真人克隆 | 实际输出男声（中位 `117.6 Hz`），不符合英语女声要求 | 仅保留 `V2-zero-cost-chatterbox-default-male-rejected.wav` 作审计，禁止用于成片 |
| D 未采用备份 | Hugging Face Parler-TTS Mini v1.1，Apache-2.0；命名内置女声 `Laura`，不使用参考音频 | 未选择；保留试听与来源记录 | 除非用户明确重新开启已冻结的 H 决定，否则不得用于成片 |
| P1 SFX | 本项目程序化原创合成 | 保留配方、源文件与 P1 性格 |
| video-shotcraft | 本地开源技能/样片库的动作配方参考 | 不复制样片媒体；实际采用代码时记录其许可与归属 |

## 12. 事实与主张台账

| 编号 | 可说的事实 | 权威本地来源 | 画面约束 |
|---|---|---|---|
| F01 | 确定性浏览器/Web IFC 可行性项目；不是认证工程合规工具 | `README.md:7` | 必须用 feasibility prototype；不得说 certified / compliant / production-ready |
| F02 | 确定性路径在本地处理两份 IFC | `README.md:13`、`app/ui/preferences.mjs:119–139` | 不暗示 AI 处理模型字节 |
| F03 | 支持边界窄且失败关闭 | `docs/evaluation.md:58–60`、`README.md:152–161` | 超界对应 NOT_EVALUATED，不是 CLEAR |
| F04 | 工作台连接计算、结果、证据抽屉与真实 IFC 3D 聚焦 | `README.md:13`、`docs/pg-e-engineering-uat.md:81–84` | 列表、抽屉与 3D 选中对象必须一致 |
| F05 | PG-E 的几何、`88` 条记录与 `4/1/11/72` | `docs/pg-e-engineering-uat.md:11,49,81–84` | 明说合成诊所；不得称 88 条全有独立人工真值 |
| F06 | 硬碰撞严格 `>2 mm`；净距预警 `<50 mm`；等值不预警 | `README.md:154–160`、G3B/G3C 语义文档 | 比较符号必须可见且正确 |
| F07 | 受控 `8/8` 三方一致、`9/9` 净距一致；不代表任意项目精度 | `docs/evaluation.md:3–9,20–24,58–60` | 指标与限定语同一段出现 |
| F08 | AI 可选且独立；预览最小字段；重新同意；最多六条；不得改变确定性事实 | `README.md:15,168`、`docs/g4ai-architecture.md:104–112` | 仅展示 C01/C03/C05/C08；显示预览、同意和不变摘要 |
| F09 | 核心支持 IFC4 STEP、无前缀米、已建立共享坐标、IfcPipeSegment 对 IfcWall/IfcBeam | `docs/evaluation.md:60`、`README.md:152–163` | 不泛称“支持 IFC” |

## 13. G7A 推荐模型、思考强度与执行配置

质量优先的主配置：

| 工作 | 模型 / 思考强度 | 决定 |
|---|---|---|
| 架构、镜头实现、节奏、真实资产集成和最终音画审查 | `gpt-5.6-sol` + `xhigh` | **主配置。** 适合多约束的复杂视觉/代码生产，又避免每轮都用 max 的延迟 |
| 意图已冻结的例行 render/test/fix 循环 | 仍用 `gpt-5.6-sol`；仅在迭代速度成为瓶颈时临时降为 `high` | 不在制作中途切模型家族；仅对机械性、边界清楚的调整降强度 |
| 最终导出前的失败搜索 | 若工期和可用额度允许，`gpt-5.6-sol` + `max` 做一次有界审计 | 只查事实、隐私、许可、时序和音画失误，不用于普通镜头调参 |

Remotion 预案：一个 `1920 × 1080`、`30 fps`、`5,166 帧`母版合成；场景边界来自节拍 JSON 和第 5 节；每场对应一张静态关键帧，以及一个已批准的 video-shotcraft 动作卡或真实录屏的原生运镜。

授权解释：G7A 可自由使用已安装的 Remotion、video-shotcraft、其他技能/插件及其免费额度，以成片质量为第一目标；但这不自动授权付费购买、超出免费额度产生费用、公开发布、访问权限变化或新增隐私暴露。任何可能收费的服务必须先报告并获得单独同意。外部生成视频即使免费，也只可用于抽象纹理/过渡，不得伪造产品 UI、计算或证据。

## 14. G7A 入口检查表——创意决定已满足

用户此前已批准第 1、2、3、5 项，并于 2026-08-30 选择 H，完成唯一剩余决定。以下完整组合现已冻结：

1. 第 4 节的 13 句英语原台本与中文字幕草稿方向。
2. `172.2 秒`、13 镜方案；PG-E 只用于确定性展示，C01/C03/C05/C08 只用于 AI。
3. SF01 → SF02 → SF03 的统一视觉系统、13 张关键帧，以及每张动作卡只使用一次的分配。
4. M2 + V2 表演方向 + 最终零费用女声 **H（`Kokoro af_heart`）** + 旁白/音乐音量关系。
5. 已选 P1 Dry Precision SFX。

创意入口检查已满足，但 VG 当前仍为 `LOCAL_REPAIR_PASS / PUBLIC_CHECKPOINT_PENDING`，G7A 为 `NOT_STARTED`。在另行授权的 GitHub 检查点正式闭合 VG 前，不生成最终旁白、不正式录屏、不调用实时 AI、不开始 Remotion 成片，也不制作最终混音或渲染。
