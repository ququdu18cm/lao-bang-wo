import { CollectionConfig } from 'payload/types'

const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: '用户',
    plural: '用户',
  },
  auth: {
    tokenExpiration: 7200, // 2 hours
    verify: {
      generateEmailHTML: ({ token, user }) => {
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>验证您的邮箱地址</h2>
            <p>您好 ${user.firstName || '用户'}，</p>
            <p>请点击下面的链接来验证您的邮箱地址：</p>
            <a href="${process.env.PAYLOAD_PUBLIC_SERVER_URL}/verify?token=${token}" 
               style="background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              验证邮箱
            </a>
            <p>如果您没有注册账户，请忽略此邮件。</p>
            <p>此链接将在24小时后过期。</p>
          </div>
        `
      },
    },
    forgotPassword: {
      generateEmailHTML: ({ token, user }) => {
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>重置您的密码</h2>
            <p>您好 ${user.firstName || '用户'}，</p>
            <p>您请求重置密码。请点击下面的链接来设置新密码：</p>
            <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}" 
               style="background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              重置密码
            </a>
            <p>如果您没有请求重置密码，请忽略此邮件。</p>
            <p>此链接将在1小时后过期。</p>
          </div>
        `
      },
    },
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['firstName', 'lastName', 'email', 'role', 'lastLoginAt'],
    group: '用户管理',
  },
  access: {
    create: () => true,
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      return {
        id: {
          equals: user?.id,
        },
      }
    },
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      return {
        id: {
          equals: user?.id,
        },
      }
    },
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'firstName',
      type: 'text',
      label: '名',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      label: '姓',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      label: '角色',
      options: [
        {
          label: '管理员',
          value: 'admin',
        },
        {
          label: '编辑者',
          value: 'editor',
        },
        {
          label: '用户',
          value: 'user',
        },
      ],
      defaultValue: 'user',
      required: true,
      access: {
        create: ({ req: { user } }) => user?.role === 'admin',
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      label: '头像',
    },
    {
      name: 'bio',
      type: 'textarea',
      label: '个人简介',
      maxLength: 500,
    },
    {
      name: 'company',
      type: 'text',
      label: '公司',
    },
    {
      name: 'website',
      type: 'text',
      label: '网站',
      validate: (val) => {
        if (val && !val.match(/^https?:\/\/.+/)) {
          return '请输入有效的网站URL'
        }
        return true
      },
    },
    {
      name: 'socialMedia',
      type: 'group',
      label: '社交媒体',
      fields: [
        {
          name: 'twitter',
          type: 'text',
          label: 'Twitter',
        },
        {
          name: 'github',
          type: 'text',
          label: 'GitHub',
        },
        {
          name: 'linkedin',
          type: 'text',
          label: 'LinkedIn',
        },
      ],
    },
    {
      name: 'preferences',
      type: 'group',
      label: '偏好设置',
      fields: [
        {
          name: 'theme',
          type: 'select',
          label: '主题',
          options: [
            { label: '浅色', value: 'light' },
            { label: '深色', value: 'dark' },
            { label: '自动', value: 'auto' },
          ],
          defaultValue: 'auto',
        },
        {
          name: 'language',
          type: 'select',
          label: '语言',
          options: [
            { label: '中文', value: 'zh' },
            { label: 'English', value: 'en' },
          ],
          defaultValue: 'zh',
        },
        {
          name: 'emailNotifications',
          type: 'checkbox',
          label: '接收邮件通知',
          defaultValue: true,
        },
        {
          name: 'marketingEmails',
          type: 'checkbox',
          label: '接收营销邮件',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'lastLoginAt',
      type: 'date',
      label: '最后登录时间',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'loginCount',
      type: 'number',
      label: '登录次数',
      defaultValue: 0,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: '账户状态',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
      access: {
        create: ({ req: { user } }) => user?.role === 'admin',
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
  ],
  hooks: {
    beforeLogin: [
      async ({ user }) => {
        // 更新登录统计
        if (user) {
          await user.collection.findByIdAndUpdate(user.id, {
            $inc: { loginCount: 1 },
            $set: { lastLoginAt: new Date() },
          })
        }
      },
    ],
    afterChange: [
      async ({ operation, doc, previousDoc }) => {
        // 发送欢迎邮件给新用户
        if (operation === 'create') {
          // 这里可以集成邮件发送逻辑
          console.log(`新用户注册: ${doc.email}`)
        }
        
        // 记录用户角色变更
        if (operation === 'update' && previousDoc?.role !== doc.role) {
          console.log(`用户 ${doc.email} 角色从 ${previousDoc?.role} 变更为 ${doc.role}`)
        }
      },
    ],
  },
  timestamps: true,
}

export default Users
