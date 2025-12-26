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

  renderHTML({ HTMLAttributes, mark }) {
    // For marks, attributes are in mark.attrs, but TipTap also merges them into HTMLAttributes
    const slug = mark?.attrs?.slug || HTMLAttributes?.slug;
    
    if (!slug) {
      console.warn('ArticleLink: slug is missing in renderHTML', { 
        HTMLAttributes, 
        markAttrs: mark?.attrs,
        mark 
      });
      // Return a plain link without the article link attributes
      return ['a', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    }
    
    return [
      'a',
      mergeAttributes(
        this.options.HTMLAttributes, 
        HTMLAttributes, 
        {
          class: 'article-link',
          'data-article-slug': slug,
          href: `/articles/${slug}`,
        }
      ),
      0,
    ];
  },

  addCommands() {
    return {
      setArticleLink:
        (options) =>
        ({ commands, state, tr, dispatch }) => {
          const { slug, text } = options;
          
          if (!slug) {
            console.error('ArticleLink: slug is required');
            return false;
          }
          
          if (text) {
            // Insert text first, then apply the mark
            // This is more reliable than insertContent with marks
            const { from } = state.selection;
            const to = from + text.length;
            
            // Insert the text
            tr.insertText(text, from);
            
            // Apply the mark with attributes to the inserted text
            const markType = this.type;
            const mark = markType.create({ slug });
            tr.addMark(from, to, mark);
            
            if (dispatch) {
              dispatch(tr);
            }
            
            return true;
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

