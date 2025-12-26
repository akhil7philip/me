import { Mark, mergeAttributes } from '@tiptap/core';

export interface ArticleLinkOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    articleLink: {
      /**
       * Set an article link
       */
      setArticleLink: (options: { slug: string; text?: string }) => ReturnType;
      /**
       * Unset an article link
       */
      unsetArticleLink: () => ReturnType;
    };
  }
}

export const ArticleLink = Mark.create<ArticleLinkOptions>({
  name: 'articleLink',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  priority: 1000,

  keepOnSplit: false,

  inclusive: false,

  addAttributes() {
    return {
      slug: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-article-slug'),
        renderHTML: (attributes) => {
          if (!attributes.slug) {
            return {};
          }
          return {
            'data-article-slug': attributes.slug,
          };
        },
      },
      href: {
        default: null,
        parseHTML: (element) => element.getAttribute('href'),
        renderHTML: (attributes) => {
          if (!attributes.slug) {
            return {};
          }
          return {
            href: `/articles/${attributes.slug}`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'a[data-article-slug]',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const element = node as HTMLElement;
          return {
            slug: element.getAttribute('data-article-slug'),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'a',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'article-link',
        'data-article-slug': HTMLAttributes.slug,
        href: `/articles/${HTMLAttributes.slug}`,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setArticleLink:
        (options) =>
        ({ commands }) => {
          const { slug, text } = options;
          
          if (text) {
            // Insert text and wrap it with article link
            return commands.insertContent({
              type: 'text',
              text,
              marks: [
                {
                  type: this.name,
                  attrs: { slug },
                },
              ],
            });
          } else {
            // Wrap selected text with article link
            return commands.setMark(this.name, { slug });
          }
        },
      unsetArticleLink:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});

