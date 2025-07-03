#!/bin/bash

# 🚀 无头工具站 CMS - Git 仓库设置脚本
# 帮助您快速将项目提交到 GitHub

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 命令未找到，请先安装 $1"
        exit 1
    fi
}

# 检查环境
check_environment() {
    log_info "检查环境..."
    
    check_command "git"
    check_command "node"
    check_command "npm"
    
    log_success "环境检查通过"
}

# 初始化 Git 仓库
init_git_repo() {
    log_info "初始化 Git 仓库..."
    
    if [ -d ".git" ]; then
        log_warning "Git 仓库已存在，跳过初始化"
        return
    fi
    
    git init
    log_success "Git 仓库初始化完成"
}

# 创建 .gitignore 文件
create_gitignore() {
    log_info "创建 .gitignore 文件..."
    
    cat > .gitignore << 'EOF'
# 🚀 无头工具站 CMS - Git 忽略文件

# ================================
# 📦 依赖和构建文件
# ================================
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# 构建输出
dist/
build/
.next/
out/

# ================================
# 🔐 环境变量和配置
# ================================
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# 敏感配置文件
config/local.json
config/production.json

# ================================
# 📊 日志和数据文件
# ================================
logs/
*.log
uploads/
*.sqlite
*.db

# ================================
# 🐳 Docker 相关
# ================================
.docker/
docker-compose.override.yml

# ================================
# 💻 IDE 和编辑器
# ================================
.vscode/
.idea/
*.swp
*.swo
*~

# ================================
# 🔧 系统文件
# ================================
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# ================================
# 📱 移动端
# ================================
*.ipa
*.apk

# ================================
# 🧪 测试覆盖率
# ================================
coverage/
.nyc_output/
.coverage/

# ================================
# 📦 包管理器
# ================================
.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz
.pnp.*

# ================================
# 🔒 安全文件
# ================================
*.pem
*.key
*.crt
*.p12

# ================================
# 📈 监控和分析
# ================================
.monitoring/
analytics-data/

# ================================
# 🎯 临时文件
# ================================
tmp/
temp/
.tmp/
.cache/

# ================================
# 📚 文档生成
# ================================
docs/build/
.docusaurus/

# ================================
# 🚀 部署相关
# ================================
.vercel/
.netlify/
.firebase/

# ================================
# 🔧 工具配置
# ================================
.eslintcache
.stylelintcache
.parcel-cache/

# ================================
# 📊 性能分析
# ================================
.clinic/
profile/
*.cpuprofile
*.heapprofile

# ================================
# 🎨 设计文件
# ================================
*.sketch
*.fig
*.xd
*.psd

# ================================
# 📱 React Native
# ================================
.expo/
.expo-shared/

# ================================
# 🔍 搜索索引
# ================================
.searchindex/

# ================================
# 📦 Payload CMS 特定
# ================================
payload-types.ts
generated-schema.graphql
.payload/

# ================================
# 🐳 Docker 数据卷
# ================================
data/
volumes/
EOF

    log_success ".gitignore 文件创建完成"
}

# 创建 README.md
create_readme() {
    log_info "检查 README.md 文件..."
    
    if [ -f "README.md" ]; then
        log_warning "README.md 已存在，跳过创建"
        return
    fi
    
    log_info "创建 README.md 文件..."
    
    cat > README.md << 'EOF'
# 🚀 无头工具站 CMS

> 企业级无头CMS后端项目，集成完整的开源高级功能栈

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-%3E%3D20.10-blue.svg)](https://www.docker.com/)

## ✨ 特性

- 🆓 **完全开源** - 零许可成本，避免供应商锁定
- 🔌 **插件化架构** - 模块化设计，易于扩展
- 📊 **统一管理** - 所有功能集成在一个管理面板
- 🐳 **一键部署** - Docker Compose 一键启动
- 🏢 **企业级功能** - 数据分析、监控、邮件营销、SEO

## 🛠️ 技术栈

| 功能模块 | 开源项目 | 说明 |
|---------|----------|------|
| 🎛️ 核心CMS | [Payload CMS](https://payloadcms.com/) | 现代化无头CMS |
| 📊 数据分析 | [Umami](https://umami.is/) | 隐私友好的网站分析 |
| 📧 邮件营销 | [Listmonk](https://listmonk.app/) | 高性能邮件营销系统 |
| 📈 系统监控 | [Grafana](https://grafana.com/) + [Prometheus](https://prometheus.io/) | 监控和可视化 |
| ⚡ 可用性监控 | [Uptime Kuma](https://github.com/louislam/uptime-kuma) | 可用性监控面板 |

## 🚀 快速开始

### 使用 Docker (推荐)

```bash
# 克隆项目
git clone https://github.com/your-username/headless-tools-cms.git
cd headless-tools-cms

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，修改密码等配置

# 一键启动
docker-compose up -d
```

### 手动安装

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 📊 访问地址

- 🎛️ **管理面板**: http://localhost:3000/admin
- 📊 **分析面板**: http://localhost:3000/admin/analytics
- 🔧 **监控面板**: http://localhost:3000/admin/monitoring
- 📧 **营销面板**: http://localhost:3000/admin/marketing

## 📚 文档

- [快速开始](./docs/快速开始.md)
- [插件开发](./docs/插件开发.md)
- [API 文档](./docs/API文档.md)
- [部署指南](./docs/部署指南.md)

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](./CONTRIBUTING.md)。

## 📄 许可证

本项目采用 [MIT 许可证](./LICENSE)。

## 🙏 致谢

感谢以下优秀的开源项目：
- [Payload CMS](https://payloadcms.com/)
- [Umami](https://umami.is/)
- [Listmonk](https://listmonk.app/)
- [Grafana](https://grafana.com/)
- [Uptime Kuma](https://github.com/louislam/uptime-kuma)
EOF

    log_success "README.md 文件创建完成"
}

# 创建许可证文件
create_license() {
    log_info "创建 LICENSE 文件..."
    
    if [ -f "LICENSE" ]; then
        log_warning "LICENSE 已存在，跳过创建"
        return
    fi
    
    cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2024 无头工具站开发团队

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF

    log_success "LICENSE 文件创建完成"
}

# 添加文件到 Git
add_files_to_git() {
    log_info "添加文件到 Git..."
    
    git add .
    log_success "文件添加完成"
}

# 创建初始提交
create_initial_commit() {
    log_info "创建初始提交..."
    
    # 检查是否有文件需要提交
    if git diff --cached --quiet; then
        log_warning "没有文件需要提交"
        return
    fi
    
    git commit -m "🚀 初始提交: 无头工具站CMS

✨ 功能特性:
- 🎛️ Payload CMS 核心系统
- 📊 Umami 数据分析集成
- 📧 Listmonk 邮件营销系统
- 📈 Grafana + Prometheus 监控
- ⚡ Uptime Kuma 可用性监控
- 🐳 Docker 容器化部署
- 🔌 插件化架构设计

🛠️ 技术栈:
- Node.js + TypeScript
- MongoDB + PostgreSQL + Redis
- Docker + Docker Compose
- Nginx 反向代理

📚 包含完整文档和示例代码"

    log_success "初始提交创建完成"
}

# 设置远程仓库
setup_remote_repo() {
    log_info "设置远程仓库..."
    
    echo ""
    echo "请按照以下步骤设置 GitHub 仓库："
    echo ""
    echo "1. 访问 https://github.com/new"
    echo "2. 创建新仓库，仓库名建议: headless-tools-cms"
    echo "3. 不要初始化 README、.gitignore 或 LICENSE (我们已经创建了)"
    echo "4. 创建后复制仓库 URL"
    echo ""
    
    read -p "请输入您的 GitHub 仓库 URL (例如: https://github.com/username/headless-tools-cms.git): " repo_url
    
    if [ -z "$repo_url" ]; then
        log_warning "未输入仓库 URL，跳过远程仓库设置"
        return
    fi
    
    # 检查是否已有远程仓库
    if git remote get-url origin &> /dev/null; then
        log_warning "远程仓库 origin 已存在，更新 URL"
        git remote set-url origin "$repo_url"
    else
        git remote add origin "$repo_url"
    fi
    
    log_success "远程仓库设置完成: $repo_url"
}

# 推送到 GitHub
push_to_github() {
    log_info "推送到 GitHub..."
    
    # 检查是否有远程仓库
    if ! git remote get-url origin &> /dev/null; then
        log_warning "未设置远程仓库，跳过推送"
        return
    fi
    
    # 检查是否有提交
    if ! git log --oneline -1 &> /dev/null; then
        log_warning "没有提交记录，跳过推送"
        return
    fi
    
    echo ""
    read -p "是否现在推送到 GitHub? (y/n): " push_confirm
    
    if [ "$push_confirm" != "y" ] && [ "$push_confirm" != "Y" ]; then
        log_info "跳过推送，您可以稍后手动推送: git push -u origin main"
        return
    fi
    
    # 推送到远程仓库
    git branch -M main
    git push -u origin main
    
    log_success "推送到 GitHub 完成！"
}

# 显示完成信息
show_completion_info() {
    echo ""
    echo "🎉 Git 仓库设置完成！"
    echo "=================================="
    echo ""
    
    if git remote get-url origin &> /dev/null; then
        repo_url=$(git remote get-url origin)
        echo "📁 GitHub 仓库: $repo_url"
        echo ""
        echo "🔗 分享链接:"
        echo "  - 仓库主页: $repo_url"
        echo "  - 克隆命令: git clone $repo_url"
        echo ""
    fi
    
    echo "📝 LinuxDo 发帖建议:"
    echo "  1. 复制 'LinuxDo发帖内容.md' 的内容"
    echo "  2. 在帖子中添加 GitHub 仓库链接"
    echo "  3. 上传一些截图展示效果"
    echo "  4. 邀请大家测试和反馈"
    echo ""
    echo "🚀 下一步:"
    echo "  1. 完善项目文档"
    echo "  2. 添加更多示例"
    echo "  3. 发布到 LinuxDo 论坛"
    echo "  4. 收集社区反馈"
    echo ""
    echo "💡 常用 Git 命令:"
    echo "  - 查看状态: git status"
    echo "  - 添加文件: git add ."
    echo "  - 提交更改: git commit -m '描述'"
    echo "  - 推送更改: git push"
    echo ""
}

# 主函数
main() {
    echo "🚀 无头工具站 CMS - Git 仓库设置"
    echo "=================================="
    echo ""
    
    check_environment
    init_git_repo
    create_gitignore
    create_readme
    create_license
    add_files_to_git
    create_initial_commit
    setup_remote_repo
    push_to_github
    show_completion_info
}

# 执行主函数
main

log_success "Git 设置脚本执行完成！"
