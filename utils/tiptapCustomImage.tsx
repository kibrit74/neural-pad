
import React, { useRef } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { WandIcon } from '../components/icons/Icons';

// FIX: Removed the complex custom props interface and used the base NodeViewProps
// to resolve a type incompatibility error with ReactNodeViewRenderer.
// The specific options are now cast from the generic `extension.options`.

// The React component that renders our custom image node
const ImageWithAiButton: React.FC<NodeViewProps> = ({ node, extension }) => {
    const { src, alt, title } = node.attrs;
    const { onAiMenuClick } = extension.options as { onAiMenuClick: (target: HTMLElement, src: string) => void; };
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Handle the click on the AI wand button
    const handleAiButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (buttonRef.current) {
            onAiMenuClick(buttonRef.current, src);
        }
    };

    return (
        <NodeViewWrapper as="span" className="relative inline-block my-2">
            <img 
                src={src} 
                alt={alt} 
                title={title} 
                className="gemini-writer-image rounded-md max-w-full h-auto" 
            />
            <button
                ref={buttonRef}
                contentEditable={false}
                onClick={handleAiButtonClick}
                className="absolute bottom-2 right-2 p-2 bg-primary text-primary-text rounded-full shadow-lg md:hidden hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background transition-transform transform active:scale-90"
                aria-label="Open AI Menu for image"
            >
                <WandIcon width="20" height="20" />
            </button>
        </NodeViewWrapper>
    );
};

// Extend the default Tiptap Image extension
export const CustomImage = Image.extend({
    // Add custom options to our extension
    addOptions() {
        return {
            ...this.parent?.(), // Inherit parent options
            onAiMenuClick: () => {}, // Provide a default empty function
        };
    },
    // Override the rendering logic with our React component
    addNodeView() {
        return ReactNodeViewRenderer(ImageWithAiButton);
    },
});
