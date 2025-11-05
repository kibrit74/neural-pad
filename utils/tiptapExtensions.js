import { Extension } from '@tiptap/core';

/**
 * FontSize extension
 * This extension adds a `fontSize` attribute to the `textStyle` mark.
 * This allows for setting the font size of text.
 */
export const FontSize = Extension.create({
    name: 'fontSize',
    addOptions() {
        return {
            types: ['textStyle'],
        };
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        // Parse the font-size style from pasted HTML
                        parseHTML: element => element.style.fontSize,
                        // Render the font-size style to the HTML output
                        renderHTML: attributes => {
                            if (!attributes.fontSize) {
                                return {};
                            }
                            return {
                                style: `font-size: ${attributes.fontSize}`,
                            };
                        },
                    },
                },
            },
        ];
    },
});

export default FontSize;
