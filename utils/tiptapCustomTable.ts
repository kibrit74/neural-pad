import { Table } from '@tiptap/extension-table';

// Extend Tiptap Table to support dynamic class attributes
export const CustomTable = Table.extend({
  name: 'table',

  addAttributes(this: { parent: () => Record<string, any> }) {
    return {
      ...this.parent(),
      class: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('class'),
        renderHTML: (attributes: { class: string }) => {
          if (!attributes.class) return {};
          return { class: attributes.class };
        },
      },
    };
  },
});

export default CustomTable;