import { CollectionConfig } from "payload/types"

const Tools: CollectionConfig = {
  slug: "tools",
  labels: {
    singular: "增强工具",
    plural: "增强工具",
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "category", "status", "usageCount", "rating", "createdAt"],
    group: "🛠️ 工具管理",
    listSearchableFields: ["name", "description", "tags"],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === "admin" || user?.role === "editor",
    update: ({ req: { user } }) => user?.role === "admin" || user?.role === "editor",
    delete: ({ req: { user } }) => user?.role === "admin",
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: "工具名称",
      required: true,
      unique: true,
      maxLength: 100,
    },
    {
      name: "slug",
      type: "text",
      label: "URL标识",
      required: true,
      unique: true,
      admin: {
        description: "用于URL路径，自动生成",
      },
      hooks: {
        beforeChange: [
          ({ value, data }) => {
            if (!value && data?.name) {
              return data.name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
                .trim()
            }
            return value
          },
        ],
      },
    },
    {
      name: "description",
      type: "textarea",
      label: "简短描述",
      required: true,
      maxLength: 200,
      admin: {
        description: "用于搜索结果和卡片展示",
      },
    },
    {
      name: "longDescription",
      type: "richText",
      label: "详细描述",
      admin: {
        description: "支持富文本格式的详细说明",
      },
    },
    {
      name: "category",
      type: "select",
      label: "主要分类",
      options: [
        { label: "��️ 图像处理", value: "image" },
        { label: "📄 文档转换", value: "document" },
        { label: "📊 数据分析", value: "analytics" },
        { label: "💻 开发工具", value: "development" },
        { label: "⚙️ 系统工具", value: "system" },
        { label: "🤖 AI工具", value: "ai" },
        { label: "🌐 网络工具", value: "network" },
        { label: "🔐 安全工具", value: "security" },
        { label: "🎨 设计工具", value: "design" },
        { label: "📱 移动工具", value: "mobile" },
        { label: "📈 商业工具", value: "business" },
        { label: "🔧 其他", value: "other" },
      ],
      required: true,
    },
    {
      name: "dockerImage",
      type: "text",
      label: "Docker镜像",
      required: true,
      admin: {
        description: "例如: nginx:alpine, node:18-alpine",
      },
    },
    {
      name: "status",
      type: "select",
      label: "状态",
      options: [
        { label: "✅ 正常运行", value: "active" },
        { label: "🔧 维护中", value: "maintenance" },
        { label: "⚠️ 测试版", value: "beta" },
        { label: "❌ 已停用", value: "inactive" },
      ],
      defaultValue: "active",
      required: true,
    },
    {
      name: "usageCount",
      type: "number",
      label: "使用次数",
      defaultValue: 0,
      admin: {
        readOnly: true,
        position: "sidebar",
      },
    },
    {
      name: "rating",
      type: "number",
      label: "评分",
      min: 0,
      max: 5,
      admin: {
        step: 0.1,
        readOnly: true,
        position: "sidebar",
      },
    },
    {
      name: "featured",
      type: "checkbox",
      label: "推荐工具",
      defaultValue: false,
      admin: {
        position: "sidebar",
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === "create") {
          data.usageCount = 0
          data.rating = 0
        }
        return data
      },
    ],
    afterChange: [
      ({ doc, operation }) => {
        if (operation === "create") {
          console.log(`新工具创建: ${doc.name}`)
        }
      },
    ],
  },
  timestamps: true,
}

export default Tools
