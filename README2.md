MicroscopeEdgeAI/  
├── app/                          # FastAPI 主应用目录  
│   ├── main.py                   # FastAPI 应用入口（创建 app、注册路由）  
│   ├── run.py                    # 启动脚本（uvicorn 启动服务）  
│  
│   ├── api/                      # 接口层（对外暴露的 API）  
│   │   ├── __init__.py  
│   │   ├── diagnosis.py           # 诊断分析接口（流式响应）  
│   │   └── image.py              # 图像保存/选择/删除接口  
│  
│   ├── core/                     # 核心业务逻辑（不依赖 FastAPI）  
│   │   ├── __init__.py  
│   │   ├── current_data.py       # 全局数据对象（CurrentData）  
│   │   ├── diagnosis_engine.py   # 诊断引擎（大模型调用、RAG检索）  
│   │   └── image_service.py      # 图像服务（保存、删除、选择）  
│  
│   ├── models/                   # 模型封装  
│   │   ├── __init__.py  
│   │   ├── QwenChatengine_langchain.py  # 文本大模型封装  
│   │   └── mmm.py                # 多模态模型封装（图像分析）  
│  
│   ├── schemas/                  # 请求 / 响应数据结构（Pydantic）  
│   │   ├── __init__.py  
│   │   ├── request.py            # 请求模型  
│   │   └── response.py           # 响应模型（统一 BaseResponse）  
│  
│   └── utils/                    # 工具函数  
│       ├── __init__.py  
│       ├── exts.py               # 全局变量管理（cd, chat_engine, vision_model）  
│       ├── image_utils.py        # 图像格式转换（numpy ↔ base64）  
│       └── logger.py             # 日志配置  
│  
├── requirements.txt              # Python 依赖列表  
├── config                        # 环境变量（模型路径、端口等）    
└── README.md  

本项目采用 **"文件驱动 + 轻量上下文"** 架构：

- 前后端在同一台机器  
- 前后端只传递临时目录路径  
- 所有图像、结果、报告统一存放在临时目录中  
- 便于整体清理、保存或回放  

## 目录结构

### 临时文件目录（tmp/）
```
tmp/
└── task_1234567890_1234/              # 病理切片级别根目录（slide_dir）
    └── images/                         # 截图会话目录（session_dir）
        ├── screenshot_1234567890.png   # 原始截图（raw_path）
        ├── base64.txt                  # base64编码（std_path）
        ├── context.json                # 对话上下文
        └── result.json                 # AI分析结果
```

### CurrentData 字段说明
| 字段 | 含义 | 格式 |
|------|------|------|
| `slide_dir` | 病理切片级别根目录 | `tmp/task_{timestamp}_{random}` |
| `session_dir` | 当前截图会话文件夹 | `{slide_dir}/images` |
| `raw_path` | 原始截图路径 | `{session_dir}/screenshot_{timestamp}.png` |
| `std_path` | 标准化图像路径 | `{session_dir}/base64.txt` |
| `context_json_path` | 对话上下文路径 | `{session_dir}/context.json` |
| `result_json_path` | AI分析结果路径 | `{session_dir}/result.json` |
| `data_status` | 数据状态 | `idle`/`collecting`/`success`/`failed` |

## API 接口

### 图像接口（/image）

| 接口 | 方法 | 功能 |
|------|------|------|
| `/image/save` | POST | 保存截图（接收 base64 数据） |
| `/image/select` | POST | 选择已保存的截图 |
| `/image/delete` | POST | 删除截图会话 |
| `/image/new_slide` | POST | 开始新的病理切片诊断 |

#### `/image/save` 请求示例
```json
{
  "source_path": "tmp/task_1234567890_1234/images/screenshot_1234567890.png",
  "image_base64": "data:image/png;base64,iVBORw0KGgo..."
}
```

### 诊断接口（/diagnosis）

| 接口 | 方法 | 功能 |
|------|------|------|
| `/diagnosis/query` | POST | 流式查询诊断（返回 SSE 流） |
| `/diagnosis/start` | POST | 启动图像分析 |

#### `/diagnosis/query` 请求示例
```json
{
  "text": "分析这张病理切片"
}
```

#### `/diagnosis/query` 响应格式（SSE）
```
data: {"event": "start", "message": "开始分析"}
data: {"event": "text", "content": "初步诊断结果："}
data: {"event": "text", "content": "发现异常细胞"}
data: [DONE]
```

## 病理切片诊断工作流

```
[前端] 开始新切片诊断
    ↓
[前端] POST /image/new_slide
    ↓
[后端] 重置 cd 状态
    ↓
[前端] 按下截图
    ↓
[前端] 生成路径 tmp/task_xxx/images/screenshot_xxx.png
    ↓
[前端] POST /image/save（发送 base64 数据）
    ↓
[后端] 解码保存图片到指定路径
    ↓
[后端] 更新 cd 路径信息
    ↓
[前端] POST /diagnosis/start
    ↓
[后端] 调用 vision_model 分析图像
    ↓
[前端] POST /diagnosis/query（流式查询）
    ↓
[后端] 流式返回分析结果
    ↓
[前端] 实时显示诊断结果
```

## 统一响应格式

所有 API 返回统一的 `BaseResponse` 格式：

```json
{
  "success": true,
  "code": 200,
  "message": "操作成功",
  "data": {...}
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `success` | bool | 是否成功 |
| `code` | int | 状态码（200=成功，4xx=客户端错误，5xx=服务端错误） |
| `message` | str | 提示消息 |
| `data` | any | 接口特定的返回数据 |

## 启动方式

```bash
# 开发模式
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 生产模式
python app/run.py
```

## 日志

日志文件位于 `app/logs/` 目录，包含详细的操作记录和错误信息。