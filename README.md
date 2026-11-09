# Developer Portfolio

面向软件开发、嵌入式 Linux、后端开发与 AI 应用岗位的个人技术作品集。

当前已完成可运行的网站结构、页面布局、组件与交互。真实姓名、联系方式、源码链接、简历和项目媒体等待本人补充。本阶段没有读取、处理或生成项目视频、项目截图与大型媒体文件。

## 本地运行

需要 Python 3.10 或以上版本，网站运行不需要安装任何第三方依赖。

在本项目目录执行：

```powershell
python main.py
```

打开 <http://127.0.0.1:8000>。停止服务使用 `Ctrl+C`。如端口已被占用：

```powershell
python main.py --port 8080
```

请通过 HTTP 服务访问；直接双击 HTML 文件不能可靠加载模块和 JSON 数据。

## 现有资料与技术选择

开发前，目录中实际存在的文件只有 `README1.md`、`README2.md` 和 `项目简介`，没有已有的网站框架、入口代码或需要保留的业务功能。这三份原始文件已保留。

因此网站使用原生 HTML、CSS 和 JavaScript ES Modules，配合 Python 标准库本地服务。没有引入 React、Vue、打包工具、远程字体或组件库。Vue 仅出现在 Jetson 项目的技术栈中，不是此作品集网站的实现框架。

视觉采用深蓝与深灰底色、青绿色强调、细边框和轻微悬停反馈。桌面项目卡片以封面与项目内容并列，手机端按封面、功能、个人贡献和入口顺序排列。详情页展示技术流程、实现方式与职责边界。

## 页面功能

- 首页：可编辑姓名、职业方向、个人简介、GitHub / Email、项目入口、简历下载。
- 关于我：中南大学生物医学工程本科背景与实践方向。
- 精选项目：统一卡片、技术方向筛选、完成状态、技术标签、核心功能和个人贡献。
- 项目详情：`/project.html?id=pathology`、`jetson`、`imx6ull`，支持独立访问、回到列表和下一个项目。
- 技术栈：Programming、Backend、Embedded Linux、Edge AI、Tools 分类，不使用技能百分比。
- 教育经历：学校、专业、学历与可编辑时间。
- 联系：GitHub、Email、简历，配置邮箱后显示复制按钮。
- 交互：移动菜单、Esc 关闭、锚点定位、导航高亮、键盘焦点与减少动态效果偏好。
- 异常回退：缺失素材、播放失败、简历不存在、无效项目链接和数据加载失败。

## 目录

```text
resume/
├── main.py                   # Python 标准库本地服务
├── index.html                # 首页 HTML
├── project.html              # 项目详情 HTML
├── favicon.svg               # 网站代码符号图标
├── assets/
│   ├── portfolio.json        # 网站唯一运行时内容数据源
│   └── project-info.md       # 原始项目资料归档与内容维护说明
├── scripts/
│   ├── app.js                # 数据加载、页面初始化、简历可用性检查
│   ├── ui.js                 # 共享图标、导航、转义与通知
│   ├── home.js               # 个人介绍、技能、教育和联系组件
│   ├── projects.js           # 项目卡片、筛选、标签与源码入口
│   ├── detail.js             # 项目详情组件
│   └── media.js              # 占位封面与点击播放组件
├── styles/main.css           # 布局、视觉与响应式样式
├── images/                   # 后续放入真实项目封面
├── videos/                   # 后续放入真实演示视频
├── files/                    # 后续放入简历 PDF
├── tests/browser_check.py    # 可选的真实浏览器交互检查
├── requirements-dev.txt      # 仅浏览器检查需要
├── README1.md                # 保留：云分析后端资料
├── README2.md                # 保留：Jetson 系统后端资料
└── 项目简介                  # 保留：原始个人与项目信息
```

## 修改个人信息

编辑 `assets/portfolio.json`。页面由数据生成，不需要在 HTML 中重复修改。

```json
{
  "profile": {
    "name": "你的姓名",
    "headline": "Software Developer / Embedded Linux / AI Applications",
    "introduction": "个人介绍",
    "seeking": "软件开发 · 实习机会",
    "github": "",
    "email": "",
    "resume": "/files/resume.pdf",
    "resumeAvailable": false,
    "about": ["关于我的第一段", "关于我的第二段"]
  }
}
```

填写 GitHub 完整 HTTPS 地址与真实邮箱后，对应链接会自动生效。空字段显示“待补充”，不跳转到虚构账号。

将简历放入 `files/resume.pdf`，再将 `resumeAvailable` 改为 `true`。网站会通过 HEAD 检查该文件及 PDF 类型；不存在时仍显示不可下载状态。

教育信息维护于 `education`，时间维护于 `education.period`。不能把求职意向填写成已经拥有的实习经历。

## 接入封面和视频

当前每个项目都已预留路径，`available` 默认为 `false`：

| 项目 | 封面路径 | 视频路径 |
| --- | --- | --- |
| 病理图像云分析平台 | /images/pathology-cover.png | /videos/pathology-demo.mp4 |
| Jetson 端侧 AI 系统 | /images/jetson-cover.png | /videos/jetson-demo.mp4 |
| i.MX6ULL | /images/imx6ull-cover.png | /videos/imx6ull-demo.mp4 |

后续把真实素材放入相应目录，再修改该项目的数据：

```json
{
  "cover": {
    "src": "/images/pathology-cover.png",
    "available": true
  },
  "video": {
    "src": "/videos/pathology-demo.mp4",
    "available": true,
    "type": "video/mp4"
  }
}
```

封面与视频可以分别启用。建议演示视频为 10–15 秒、H.264 MP4。本阶段没有检查真实视频的编码、长度或播放质量。

封面图片使用 `loading="lazy"` 与异步解码，加载失败回退到标有“预留封面”的 CSS 占位。占位仅表达项目类别，不冒充真实运行截图。

播放器在用户点击时才创建，不自动播放、不预取视频；默认静音并循环，提供原生播放控件以及额外静音、循环开关。切换分类或页面进入后台会暂停播放。视频不可用时移除播放器、恢复封面并提示。未配置素材不会请求预留的图片或视频地址。

## 维护项目内容

`projects` 数组中的每一项是一个独立项目。可以复制现有项并修改：

| 字段 | 作用 |
| --- | --- |
| id | 唯一英文编号，对应详情页 URL；添加后不宜随意修改 |
| number / category / categoryLabel | 显示序号、筛选分类与英文方向 |
| title / englishTitle / summary | 卡片和详情标题、简介 |
| status / statusType | 实际状态；进行中的项目使用 progress |
| stack / features / contributions | 技术栈、核心功能或当前范围、个人贡献 |
| github | 项目源码完整 URL，未知时留空 |
| cover / video / visual | 素材预留、可用开关与占位封面文案 |
| overview / flow / implementation | 项目背景、技术流程、实现说明 |
| ownership / boundaries / nextSteps | 个人与第三方职责、当前范围、后续事项 |
| sources | 内容来源记录，不作为个人成果展示 |

分类维护于 `categories`。新增项目使用已有分类，或同步添加一个新分类。技能维护于 `skills`。

网站以提供的资料整理内容，未访问其他项目目录核验源码。云平台展示已记载的后端功能；Jetson 明确区分本人后端与部署集成、第三方模型和已有 Vue 前端；i.MX6ULL 保持“进行中”，未将 LCD 调试或驱动开发描述为完成成果。未添加性能数据、获奖经历、工作年限或虚构截图。

## 运行验证

已使用本机 Chrome 的无头模式完成 9 组检查，覆盖：

- 首页实际渲染、中文编码、资料模块与默认零媒体请求。
- 全部分类筛选、无素材提示。
- 320、390、768、1024、1440、1920px 首页宽度，手机菜单和锚点。
- 三个详情页、职责边界、320–1440px 详情布局和无效项目。
- 点击创建播放器、静音、循环、暂停、切换分类时停止播放。
- 封面加载失败、播放失败和简历不存在时回退。
- 配置联系信息与简历下载入口。
- 数据加载失败与重试入口。
- 本地服务仅开放网站公开文件。

播放成功路径通过内存中的模拟播放器验证，失败路径通过模拟缺失资源验证；测试不读取或生成真实项目媒体。真实视频解码和最终效果需在补充素材后验证。

需要重复执行时，先启动网站，在另一个终端中运行：

```powershell
python -m pip install -r requirements-dev.txt
python tests/browser_check.py
```

测试会优先使用本机 Chrome / Edge；如果没有可用浏览器，可执行 `python -m playwright install chromium`。浏览器路径也可通过环境变量 `PORTFOLIO_BROWSER` 指定。

开发时若使用项目内的 `.tools/python` 安装目录，脚本会自动识别。该目录已被 Git 忽略，也不被本地网站服务公开。可加 `--screenshots` 保存网站页面检查图到 `.tools`；这只是布局验证图，不是项目演示素材。

## 后续发布

网站可以部署到静态托管服务，无需构建。发布 `index.html`、`project.html`、`favicon.svg` 和 `assets/`、`styles/`、`scripts/`、`images/`、`videos/`、`files/`。

页面链接和资源加载使用相对路径，同时支持独立域名根目录与 GitHub Pages 仓库子路径，例如 `https://wwwuan.github.io/personal-website/`。`assets/portfolio.json` 中 `/images/...`、`/videos/...` 和 `/files/...` 的写法仍然有效，代码会将它们解析为作品集目录下的资源，不需要手动添加仓库名。正式视频托管建议支持 HTTP Range 请求。

GitHub Pages 更新方法：将修改后的 HTML、`scripts/` 及其他网站文件提交并推送到实际发布的分支，在仓库 **Settings → Pages** 确认发布来源。如果使用 **Deploy from a branch**，选择存放 `index.html` 的分支和目录（当前项目通常为 `main` / `root`）；如果已经使用 GitHub Actions，检查工作流发布的目录包含这些文件。部署成功后，从 Pages 显示的站点地址进入网站，再检查项目详情和返回首页。修改路径后如仍显示旧页面，可按 `Ctrl+F5` 强制刷新。

可以运行以下浏览器回归检查，自动模拟根目录、`/personal-website/` 与多层子路径的部署环境，验证首页、详情、返回链接、刷新、移动导航以及简历和媒体路径；不读取真实项目媒体：

```powershell
python tests/pages_check.py
```

`main.py` 是本地预览入口，GitHub Pages 直接托管静态文件，不运行 Python。发布前请确认个人信息、源码链接、简历和素材均已按实际情况补充。
