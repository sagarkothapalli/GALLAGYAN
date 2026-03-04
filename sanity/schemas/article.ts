import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required().max(250),
      description: 'Short summary for cards and SEO. Keep under 160 chars for meta description.',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', type: 'string', title: 'Alt Text', validation: (Rule) => Rule.required() },
            { name: 'caption', type: 'string', title: 'Caption' },
          ],
        },
        {
          type: 'code',
          title: 'Code Block',
          options: { withFilename: true },
        },
        {
          type: 'object',
          name: 'calculatorEmbed',
          title: 'Calculator Embed',
          fields: [
            {
              name: 'calculatorType',
              title: 'Calculator Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Tax Estimator', value: 'tax' },
                  { title: 'Emergency Fund', value: 'emergency' },
                  { title: 'Pricing Converter', value: 'pricing' },
                ],
              },
            },
          ],
          preview: {
            select: { type: 'calculatorType' },
            prepare: ({ type }: { type: string }) => ({
              title: `Calculator: ${type}`,
            }),
          },
        },
        {
          type: 'object',
          name: 'ctaBlock',
          title: 'CTA Block',
          fields: [
            { name: 'heading', type: 'string', title: 'Heading' },
            { name: 'text', type: 'text', title: 'Text' },
            { name: 'buttonText', type: 'string', title: 'Button Text' },
            { name: 'buttonUrl', type: 'url', title: 'Button URL' },
          ],
        },
      ],
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt Text' }],
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Taxes', value: 'taxes' },
          { title: 'Cash Flow', value: 'cash-flow' },
          { title: 'Pricing', value: 'pricing' },
          { title: 'Savings', value: 'savings' },
          { title: 'Business Structure', value: 'business-structure' },
          { title: 'Compliance', value: 'compliance' },
          { title: 'Mental Health & Wellbeing', value: 'mental-health' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'level',
      title: 'Level',
      type: 'string',
      options: {
        list: [
          { title: 'Beginner', value: 'beginner' },
          { title: 'Intermediate', value: 'intermediate' },
          { title: 'Advanced', value: 'advanced' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'format',
      title: 'Format',
      type: 'string',
      options: {
        list: [
          { title: 'Article', value: 'article' },
          { title: 'Video', value: 'video' },
          { title: 'Calculator', value: 'calculator' },
          { title: 'Quiz', value: 'quiz' },
        ],
      },
      initialValue: 'article',
    }),
    defineField({
      name: 'readTime',
      title: 'Read Time (minutes)',
      type: 'number',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
      description: 'Show this article in the featured section on the education hub.',
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      description: 'Override the default title for search engines. Max 60 chars.',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 2,
      description: 'Override the excerpt for search engines. Max 160 chars.',
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Last Updated',
      type: 'datetime',
    }),
    defineField({
      name: 'complianceReviewDate',
      title: 'Compliance Review Date',
      type: 'date',
      description: 'Date this content was last reviewed for accuracy by a qualified professional.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      media: 'featuredImage',
    },
  },
  orderings: [
    {
      title: 'Published, Newest',
      name: 'publishedDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
});
