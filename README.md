# 纸上山河

> 在地图上探索古诗词中的名胜古迹

## 本地开发

```bash
# 安装依赖
npm install

# 启动前端开发服务器
npm run dev

# 启动完整本地环境（Vite + Cloudflare Pages Functions + 本地 D1）
./start-dev.sh
```

前端开发服务器启动后访问 http://localhost:5173

完整本地环境启动后访问 http://localhost:8788

本地后台管理密码定义在 `.dev.vars` 中，默认值为 `admin123`。

## 部署到 Cloudflare Pages

### 1. 创建 D1 数据库

```bash
# 登录 Cloudflare
npx wrangler login

# 创建数据库
npx wrangler d1 create zhishangheshan-db
```

执行后会返回一个 `database_id`，将其填入 `wrangler.toml` 中的 `database_id` 字段。

### 2. 初始化数据库

```bash
# 创建表结构
npx wrangler d1 execute zhishangheshan-db --file=./schema.sql

# 导入种子数据（可选）
npx wrangler d1 execute zhishangheshan-db --file=./seed.sql
```

### 3. 修改密码和密钥

编辑 `wrangler.toml`，修改：
- `ADMIN_PASSWORD`：管理员登录密码
- `JWT_SECRET`：JWT 签名密钥（随机字符串）

### 4. 构建和部署

```bash
# 构建前端
npm run build

# 部署到 Cloudflare Pages
npx wrangler pages deploy dist
```

或者连接 Git 仓库后通过 Cloudflare Dashboard 自动部署。

### 5. 绑定 D1 到 Pages 项目

在 Cloudflare Dashboard 中：
1. 进入 Pages 项目 → Settings → Functions
2. 添加 D1 database binding：
   - Variable name: `DB`
   - D1 database: 选择 `zhishangheshan-db`
3. 添加环境变量：
   - `ADMIN_PASSWORD`: 你的管理密码
   - `JWT_SECRET`: 你的 JWT 密钥

### 6. 访问网站

部署成功后 Cloudflare 会分配一个 `.pages.dev` 域名，如：
`https://zhishangheshan.pages.dev`

如需绑定自定义域名，在 Cloudflare Dashboard → Pages → Custom domains 中添加。

## 后台管理

访问 `/admin/login` 输入管理密码即可进入后台。

功能：
- 作品列表管理（增删改查）
- 支持 Excel/JSON 数据导入
- 图片链接管理

## 导入 Excel 数据

后台支持导入，Excel 文件需包含以下列：
- 序号（可选）
- 作品名称
- 对应景点
- 作者
- 朝代/时期
- 景点简介

导入时前端会解析 Excel 文件并通过 API 写入数据库。

## 技术栈

- **前端**: React + Vite + Tailwind CSS + ECharts + Framer Motion
- **后端**: Cloudflare Pages Functions
- **数据库**: Cloudflare D1 (SQLite)
- **部署**: Cloudflare Pages (全球边缘网络)
# Zhishangheshan
