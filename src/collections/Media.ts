import { CollectionConfig } from 'payload/types'

const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: '媒体文件',
    plural: '媒体文件',
  },
  admin: {
    useAsTitle: 'filename',
    group: '📁 媒体管理',
    defaultColumns: ['filename', 'alt', 'mimeType', 'filesize', 'createdAt'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  upload: {
    staticURL: '/media',
    staticDir: 'media',
    adminThumbnail: 'thumbnail',
    mimeTypes: [
      'image/*',
      'video/*',
      'audio/*',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
    ],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        height: 300,
        position: 'centre',
        formatOptions: {
          format: 'webp',
          options: {
            quality: 80,
          },
        },
      },
      {
        name: 'card',
        width: 640,
        height: 480,
        position: 'centre',
        formatOptions: {
          format: 'webp',
          options: {
            quality: 85,
          },
        },
      },
      {
        name: 'feature',
        width: 1200,
        height: 630,
        position: 'centre',
        formatOptions: {
          format: 'webp',
          options: {
            quality: 90,
          },
        },
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: '替代文本',
      admin: {
        description: '用于屏幕阅读器和SEO优化',
      },
    },
    {
      name: 'caption',
      type: 'richText',
      label: '图片说明',
      admin: {
        description: '可选的图片说明文字',
      },
    },
    {
      name: 'category',
      type: 'select',
      label: '分类',
      options: [
        { label: '头像', value: 'avatar' },
        { label: '封面图', value: 'cover' },
        { label: '内容图片', value: 'content' },
        { label: '图标', value: 'icon' },
        { label: '背景图', value: 'background' },
        { label: '文档', value: 'document' },
        { label: '视频', value: 'video' },
        { label: '音频', value: 'audio' },
        { label: '其他', value: 'other' },
      ],
      defaultValue: 'other',
    },
    {
      name: 'tags',
      type: 'array',
      label: '标签',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: '用于搜索和分类',
      },
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      label: '公开访问',
      defaultValue: true,
      admin: {
        description: '是否允许公开访问此文件',
      },
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      label: '上传者',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'downloadCount',
      type: 'number',
      label: '下载次数',
      defaultValue: 0,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'metadata',
      type: 'group',
      label: '元数据',
      admin: {
        condition: (data) => data?.mimeType?.startsWith('image/'),
      },
      fields: [
        {
          name: 'width',
          type: 'number',
          label: '宽度',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'height',
          type: 'number',
          label: '高度',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'colorPalette',
          type: 'array',
          label: '主要颜色',
          fields: [
            {
              name: 'color',
              type: 'text',
              required: true,
            },
          ],
          maxRows: 5,
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO设置',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'SEO标题',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'SEO描述',
          maxLength: 160,
        },
        {
          name: 'keywords',
          type: 'text',
          label: 'SEO关键词',
          admin: {
            description: '用逗号分隔多个关键词',
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        if (req.user) {
          data.uploadedBy = req.user.id
        }
        return data
      },
    ],
    afterRead: [
      ({ doc, req }) => {
        // 增加下载计数（仅当实际下载时）
        if (req.query?.download === 'true') {
          req.payload.update({
            collection: 'media',
            id: doc.id,
            data: {
              downloadCount: (doc.downloadCount || 0) + 1,
            },
          })
        }
        return doc
      },
    ],
  },
  timestamps: true,
}

export default Media
