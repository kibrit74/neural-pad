import React, { useRef } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { WandIcon } from '../components/icons/Icons';
import { Plugin } from 'prosemirror-state';

const ImageWithAiButton: React.FC<NodeViewProps> = ({ node, extension }) => {
    const { src, alt, title } = node.attrs;
    const { onAiMenuClick } = extension.options as { onAiMenuClick: (target: HTMLElement, src: string) => void; };
    const buttonRef = useRef<HTMLButtonElement>(null);

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

export const CustomImage = Image.extend({
    addOptions() {
        return {
            ...this.parent?.(),
            onAiMenuClick: () => {},
        };
    },
    addNodeView() {
        return ReactNodeViewRenderer(ImageWithAiButton);
    },
    addProseMirrorPlugins() {
        return [
            new Plugin({
                props: {
                    handlePaste: (view, event, slice) => {
                        const items = event.clipboardData?.items;
                        if (!items) return false;

                        const imageItem = Array.from(items).find(item => item.type.startsWith('image/'));
                        if (!imageItem) return false;

                        const file = imageItem.getAsFile();
                        if (!file) return false;

                        event.preventDefault();
                        console.log('[CustomImage] Pasted image file detected:', file.name);
                        file.arrayBuffer().then(buffer => {
                            console.log(`[CustomImage] Image converted to buffer, size: ${buffer.byteLength}. Sending to main process...`);
                            (window as any).electron.files.saveImage(new Uint8Array(buffer))
                                .then((url: string | null) => {
                                    if (url) {
                                        console.log(`[CustomImage] Received image URL: ${url}. Inserting into editor.`);
                                        const { schema } = view.state;
                                        const node = schema.nodes.image.create({ src: url });
                                        const transaction = view.state.tr.replaceSelectionWith(node);
                                        view.dispatch(transaction);
                                    } else {
                                        console.error('[CustomImage] Main process failed to return a valid image URL.');
                                    }
                                })
                                .catch((error: any) => {
                                    console.error('[CustomImage] Error saving image via IPC:', error);
                                });
                        });
                        return true;
                    },
                    handleDrop: (view, event, slice, moved) => {
                        if (moved || !event.dataTransfer?.files?.length) return false;

                        const imageFile = Array.from(event.dataTransfer.files).find(file => file.type.startsWith('image/'));
                        if (!imageFile) return false;

                        event.preventDefault();

                        console.log('[CustomImage] Dropped image file detected:', imageFile.name);
                        imageFile.arrayBuffer().then(buffer => {
                            console.log(`[CustomImage] Image converted to buffer, size: ${buffer.byteLength}. Sending to main process...`);
                            (window as any).electron.files.saveImage(new Uint8Array(buffer))
                                .then((url: string | null) => {
                                    if (url) {
                                        console.log(`[CustomImage] Received image URL: ${url}. Inserting at drop position.`);
                                        const { schema } = view.state;
                                        const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                                        if (coordinates) {
                                            const node = schema.nodes.image.create({ src: url });
                                            const transaction = view.state.tr.insert(coordinates.pos, node);
                                            view.dispatch(transaction);
                                        }
                                    } else {
                                        console.error('[CustomImage] Main process failed to return a valid image URL.');
                                    }
                                })
                                .catch((error: any) => {
                                    console.error('[CustomImage] Error saving image via IPC:', error);
                                });
                        });
                        return true;
                    },
                },
            }),
        ];
    },
});
