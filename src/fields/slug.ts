import { Field } from 'payload/types'

export const slugField = (overrides: Partial<Field> = {}): Field => ({
  name: 'slug',
  type: 'text',
  label: 'URL标识',
  required: true,
  unique: true,
  admin: {
    description: '用于URL路径，只能包含字母、数字和连字符',
    ...overrides.admin,
  },
  validate: (val) => {
    if (val && !val.match(/^[a-z0-9-]+$/)) {
      return 'URL标识只能包含小写字母、数字和连字符'
    }
    return true
  },
  hooks: {
    beforeChange: [
      ({ value, data }) => {
        if (!value && data?.name) {
          return data.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
        }
        return value
      },
    ],
  },
  ...overrides,
})
