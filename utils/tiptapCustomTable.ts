import { Table } from '@tiptap/extension-table';

// Extend Tiptap Table to support dynamic class attributes
export const CustomTable = Table.extend({
  name: 'table',

  addAttributes() {
    return {
      ...this.parent?.(),
      class: {
        default: null,
        parseHTML: element => element.getAttribute('class'),
        renderHTML: attributes => {
          if (!attributes.class) return {};
          return { class: attributes.class };
        },
      },
    };
  },
});

export default CustomTable;