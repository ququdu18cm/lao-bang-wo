import { CollectionConfig } from 'payload/types'
import { slugField } from '../fields/slug'

const Tools: CollectionConfig = {
  slug: 'tools',
  labels: {
    singular: '工具',
    plural: '工具',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'isActive', 'dockerImage', 'updatedAt'],
    group: '内容管理',
  },
  access: {
    create: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'editor',
    read: () => true,
    update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'editor',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: '工具名称',
      required: true,
      unique: true,
    },
    slugField(),
    {
      name: 'description',
      type: 'textarea',
      label: '工具描述',
      required: true,
      maxLength: 500,
    },
    {
      name: 'longDescription',
      type: 'richText',
      label: '详细描述',
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      label: '分类',
      required: true,
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      label: '标签',
      hasMany: true,
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
      label: '工具图标',
    },
    {
      name: 'screenshots',
      type: 'array',
      label: '截图',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
          label: '说明',
        },
      ],
    },
    {
      name: 'dockerImage',
      type: 'text',
      label: 'Docker 镜像',
      required: true,
      validate: (val) => {
        if (!val) return '请输入 Docker 镜像名称'
        // 简单的 Docker 镜像名称验证
        if (!val.match(/^[a-z0-9]+(?:[._-][a-z0-9]+)*(?:\/[a-z0-9]+(?:[._-][a-z0-9]+)*)*(?::[a-z0-9]+(?:[._-][a-z0-9]+)*)?$/i)) {
          return '请输入有效的 Docker 镜像名称'
        }
        return true
      },
    },
    {
      name: 'dockerConfig',
      type: 'group',
      label: 'Docker 配置',
      fields: [
        {
          name: 'ports',
          type: 'array',
          label: '端口映射',
          fields: [
            {
              name: 'containerPort',
              type: 'number',
              label: '容器端口',
              required: true,
            },
            {
              name: 'hostPort',
              type: 'number',
              label: '主机端口',
            },
            {
              name: 'protocol',
              type: 'select',
              label: '协议',
              options: [
                { label: 'TCP', value: 'tcp' },
                { label: 'UDP', value: 'udp' },
              ],
              defaultValue: 'tcp',
            },
          ],
        },
        {
          name: 'environment',
          type: 'array',
          label: '环境变量',
          fields: [
            {
              name: 'key',
              type: 'text',
              label: '变量名',
              required: true,
            },
            {
              name: 'value',
              type: 'text',
              label: '变量值',
              required: true,
            },
            {
              name: 'description',
              type: 'text',
              label: '说明',
            },
          ],
        },
        {
          name: 'volumes',
          type: 'array',
          label: '数据卷',
          fields: [
            {
              name: 'hostPath',
              type: 'text',
              label: '主机路径',
              required: true,
            },
            {
              name: 'containerPath',
              type: 'text',
              label: '容器路径',
              required: true,
            },
            {
              name: 'mode',
              type: 'select',
              label: '模式',
              options: [
                { label: '读写', value: 'rw' },
                { label: '只读', value: 'ro' },
              ],
              defaultValue: 'rw',
            },
          ],
        },
        {
          name: 'command',
          type: 'text',
          label: '启动命令',
        },
        {
          name: 'workingDir',
          type: 'text',
          label: '工作目录',
        },
        {
          name: 'user',
          type: 'text',
          label: '运行用户',
        },
        {
          name: 'restart',
          type: 'select',
          label: '重启策略',
          options: [
            { label: '不重启', value: 'no' },
            { label: '总是重启', value: 'always' },
            { label: '失败时重启', value: 'on-failure' },
            { label: '除非停止否则重启', value: 'unless-stopped' },
          ],
          defaultValue: 'unless-stopped',
        },
      ],
    },
    {
      name: 'requirements',
      type: 'group',
      label: '系统要求',
      fields: [
        {
          name: 'minMemory',
          type: 'number',
          label: '最小内存 (MB)',
          defaultValue: 512,
        },
        {
          name: 'minCpu',
          type: 'number',
          label: '最小 CPU 核心数',
          defaultValue: 1,
        },
        {
          name: 'minDisk',
          type: 'number',
          label: '最小磁盘空间 (MB)',
          defaultValue: 1024,
        },
        {
          name: 'supportedArchitectures',
          type: 'select',
          label: '支持的架构',
          hasMany: true,
          options: [
            { label: 'x86_64', value: 'amd64' },
            { label: 'ARM64', value: 'arm64' },
            { label: 'ARM32', value: 'arm' },
          ],
          defaultValue: ['amd64'],
        },
      ],
    },
    {
      name: 'usage',
      type: 'group',
      label: '使用说明',
      fields: [
        {
          name: 'quickStart',
          type: 'richText',
          label: '快速开始',
        },
        {
          name: 'documentation',
          type: 'text',
          label: '文档链接',
        },
        {
          name: 'examples',
          type: 'array',
          label: '使用示例',
          fields: [
            {
              name: 'title',
              type: 'text',
              label: '示例标题',
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
              label: '示例描述',
            },
            {
              name: 'code',
              type: 'code',
              label: '示例代码',
            },
          ],
        },
      ],
    },
    {
      name: 'metadata',
      type: 'group',
      label: '元数据',
      fields: [
        {
          name: 'version',
          type: 'text',
          label: '版本',
          defaultValue: '1.0.0',
        },
        {
          name: 'author',
          type: 'text',
          label: '作者',
        },
        {
          name: 'license',
          type: 'text',
          label: '许可证',
          defaultValue: 'MIT',
        },
        {
          name: 'sourceUrl',
          type: 'text',
          label: '源码地址',
        },
        {
          name: 'homepageUrl',
          type: 'text',
          label: '项目主页',
        },
        {
          name: 'issuesUrl',
          type: 'text',
          label: '问题反馈',
        },
      ],
    },
    {
      name: 'analytics',
      type: 'group',
      label: '使用统计',
      admin: {
        readOnly: true,
      },
      fields: [
        {
          name: 'viewCount',
          type: 'number',
          label: '查看次数',
          defaultValue: 0,
        },
        {
          name: 'downloadCount',
          type: 'number',
          label: '下载次数',
          defaultValue: 0,
        },
        {
          name: 'deployCount',
          type: 'number',
          label: '部署次数',
          defaultValue: 0,
        },
        {
          name: 'rating',
          type: 'number',
          label: '平均评分',
          min: 0,
          max: 5,
        },
        {
          name: 'ratingCount',
          type: 'number',
          label: '评分人数',
          defaultValue: 0,
        },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: '启用状态',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      label: '推荐工具',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
      access: {
        create: ({ req: { user } }) => user?.role === 'admin',
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: '发布时间',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create' && !data.publishedAt) {
          data.publishedAt = new Date()
        }
        return data
      },
    ],
    afterChange: [
      async ({ operation, doc }) => {
        if (operation === 'create') {
          console.log(`新工具发布: ${doc.name}`)
          // 这里可以添加通知逻辑
        }
      },
    ],
  },
  timestamps: true,
}

export default Tools
