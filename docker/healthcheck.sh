#!/bin/sh

# 🏥 无头工具站 CMS - 健康检查脚本
# 检查应用程序和关键服务的健康状态

set -e

# 配置
HEALTH_URL="http://localhost:3000/health"
TIMEOUT=10
MAX_RETRIES=3

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 日志函数
log_info() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] $1"
}

log_success() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') ${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') ${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') ${RED}[ERROR]${NC} $1"
}

# 检查 HTTP 端点
check_http_endpoint() {
    local url=$1
    local name=$2
    local timeout=${3:-$TIMEOUT}
    
    log_info "检查 $name: $url"
    
    if curl -f -s --max-time "$timeout" "$url" > /dev/null 2>&1; then
        log_success "$name 健康检查通过"
        return 0
    else
        log_error "$name 健康检查失败"
        return 1
    fi
}

# 检查端口是否开放
check_port() {
    local port=$1
    local name=$2
    
    log_info "检查端口 $port ($name)"
    
    if nc -z localhost "$port" 2>/dev/null; then
        log_success "端口 $port ($name) 可访问"
        return 0
    else
        log_error "端口 $port ($name) 不可访问"
        return 1
    fi
}

# 检查进程
check_process() {
    local process_name=$1
    
    log_info "检查进程: $process_name"
    
    if pgrep -f "$process_name" > /dev/null; then
        log_success "进程 $process_name 正在运行"
        return 0
    else
        log_error "进程 $process_name 未运行"
        return 1
    fi
}

# 检查内存使用
check_memory() {
    local max_usage=${1:-80}
    
    log_info "检查内存使用情况"
    
    # 获取内存使用百分比
    memory_usage=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')
    
    if [ "$memory_usage" -lt "$max_usage" ]; then
        log_success "内存使用正常: ${memory_usage}%"
        return 0
    else
        log_warning "内存使用较高: ${memory_usage}%"
        return 1
    fi
}

# 检查磁盘空间
check_disk_space() {
    local max_usage=${1:-90}
    local path=${2:-/}
    
    log_info "检查磁盘空间: $path"
    
    # 获取磁盘使用百分比
    disk_usage=$(df "$path" | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [ "$disk_usage" -lt "$max_usage" ]; then
        log_success "磁盘空间正常: ${disk_usage}%"
        return 0
    else
        log_warning "磁盘空间不足: ${disk_usage}%"
        return 1
    fi
}

# 检查数据库连接
check_database() {
    log_info "检查数据库连接"
    
    # 通过健康检查端点验证数据库连接
    if curl -f -s --max-time "$TIMEOUT" "${HEALTH_URL}" | grep -q "healthy"; then
        log_success "数据库连接正常"
        return 0
    else
        log_error "数据库连接失败"
        return 1
    fi
}

# 主健康检查函数
main_health_check() {
    local exit_code=0
    
    log_info "开始健康检查..."
    
    # 检查主应用端点
    if ! check_http_endpoint "$HEALTH_URL" "Payload CMS"; then
        exit_code=1
    fi
    
    # 检查主端口
    if ! check_port 3000 "Payload CMS"; then
        exit_code=1
    fi
    
    # 检查 Node.js 进程
    if ! check_process "node"; then
        exit_code=1
    fi
    
    # 检查数据库连接
    if ! check_database; then
        exit_code=1
    fi
    
    # 检查系统资源
    check_memory 85 || log_warning "内存使用较高，但仍在可接受范围内"
    check_disk_space 90 "/" || log_warning "磁盘空间不足，建议清理"
    
    # 检查关键文件
    if [ ! -d "/app/uploads" ]; then
        log_error "上传目录不存在"
        exit_code=1
    fi
    
    if [ ! -d "/app/logs" ]; then
        log_error "日志目录不存在"
        exit_code=1
    fi
    
    # 检查环境变量
    if [ -z "$PAYLOAD_SECRET" ]; then
        log_error "PAYLOAD_SECRET 环境变量未设置"
        exit_code=1
    fi
    
    if [ -z "$DATABASE_URI" ]; then
        log_error "DATABASE_URI 环境变量未设置"
        exit_code=1
    fi
    
    return $exit_code
}

# 详细健康检查
detailed_health_check() {
    log_info "执行详细健康检查..."
    
    # 检查 API 端点
    local endpoints=(
        "/health"
        "/api/globals/settings"
        "/api/users"
        "/api/tools"
    )
    
    for endpoint in "${endpoints[@]}"; do
        local url="http://localhost:3000${endpoint}"
        check_http_endpoint "$url" "API $endpoint" 5 || true
    done
    
    # 检查集成服务状态
    log_info "检查集成服务状态..."
    
    # 检查 Redis 连接 (如果配置了)
    if [ -n "$REDIS_URL" ]; then
        log_info "检查 Redis 连接"
        # 这里可以添加 Redis 连接检查
    fi
    
    # 输出系统信息
    log_info "系统信息:"
    echo "  - 容器 ID: $(hostname)"
    echo "  - 运行时间: $(uptime -p 2>/dev/null || echo 'N/A')"
    echo "  - 负载平均: $(uptime | awk -F'load average:' '{print $2}' 2>/dev/null || echo 'N/A')"
    echo "  - 内存使用: $(free -h | grep Mem | awk '{print $3 "/" $2}' 2>/dev/null || echo 'N/A')"
    echo "  - 磁盘使用: $(df -h / | tail -1 | awk '{print $3 "/" $2 " (" $5 ")"}' 2>/dev/null || echo 'N/A')"
}

# 快速健康检查
quick_health_check() {
    log_info "执行快速健康检查..."
    
    # 只检查最关键的服务
    if check_http_endpoint "$HEALTH_URL" "Payload CMS" 5; then
        log_success "快速健康检查通过"
        return 0
    else
        log_error "快速健康检查失败"
        return 1
    fi
}

# 解析命令行参数
case "${1:-quick}" in
    "quick")
        quick_health_check
        ;;
    "detailed")
        detailed_health_check
        ;;
    "full")
        main_health_check
        ;;
    *)
        echo "用法: $0 [quick|detailed|full]"
        echo "  quick    - 快速健康检查 (默认)"
        echo "  detailed - 详细健康检查"
        echo "  full     - 完整健康检查"
        exit 1
        ;;
esac

exit_code=$?

if [ $exit_code -eq 0 ]; then
    log_success "健康检查完成 - 所有检查通过"
else
    log_error "健康检查完成 - 发现问题"
fi

exit $exit_code
