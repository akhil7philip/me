import { Node, mergeAttributes } from '@tiptap/core';

export interface FootnoteOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    footnote: {
      /**
       * Insert a footnote
       */
      setFootnote: (options: { text: string; number?: number }) => ReturnType;
      /**
       * Update a footnote
       */
      updateFootnote: (options: { text: string; number: number }) => ReturnType;
      /**
       * Remove a footnote
       */
      removeFootnote: () => ReturnType;
    };
  }
}

export const Footnote = Node.create<FootnoteOptions>({
  name: 'footnote',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'inline',

  inline: true,

  selectable: false,

  atom: true,

  addAttributes() {
    return {
      text: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-footnote-text'),
        renderHTML: (attributes) => {
          if (!attributes.text) {
            return {};
          }
          return {
            'data-footnote-text': attributes.text,
          };
        },
      },
      number: {
        default: 1,
        parseHTML: (element) => {
          const num = element.getAttribute('data-footnote-number');
          return num ? parseInt(num, 10) : 1;
        },
        renderHTML: (attributes) => {
          if (!attributes.number) {
            return {};
          }
          return {
            'data-footnote-number': attributes.number.toString(),
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="footnote"]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const { number, text } = node.attrs;
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'footnote',
        'data-footnote-number': number.toString(),
        'data-footnote-text': text || '',
        class: 'footnote-reference',
      }),
      number.toString(),
    ];
  },

  addCommands() {
    return {
      setFootnote:
        (options) =>
        ({ commands, state }) => {
          const { text, number } = options;
          
          // Get all existing footnotes to determine the next number
          let nextNumber = number || 1;
          if (!number) {
            const footnotes: number[] = [];
            state.doc.descendants((node) => {
              if (node.type.name === 'footnote') {
                footnotes.push(node.attrs.number);
              }
            });
            if (footnotes.length > 0) {
              nextNumber = Math.max(...footnotes) + 1;
            }
          }

          return commands.insertContent({
            type: this.name,
            attrs: {
              text,
              number: nextNumber,
            },
          });
        },
      updateFootnote:
        (options) =>
        ({ tr, state }) => {
          const { text, number } = options;
          let updated = false;

          state.doc.descendants((node, pos) => {
            if (node.type.name === 'footnote' && node.attrs.number === number) {
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                text,
              });
              updated = true;
              return false; // Stop searching
            }
          });

          return updated;
        },
      removeFootnote:
        () =>
        ({ state, dispatch }) => {
          const { selection } = state;
          const { $from } = selection;

          // Find the footnote node at the current position
          let found = false;
          state.doc.nodesBetween($from.pos, $from.pos, (node, pos) => {
            if (node.type.name === 'footnote') {
              if (dispatch) {
                dispatch(state.tr.delete(pos, pos + node.nodeSize));
              }
              found = true;
              return false;
            }
          });

          return found;
        },
    };
  },
});

