import React, { useRef, useEffect, useState, ReactNode } from 'react';
import { SkeletonPrimitive } from './SkeletonPrimitive';

interface AutoSkeletonProps {
    loading: boolean;
    children: ReactNode;
    config?: {
        color?: string;
        highlightColor?: string;
        borderRadius?: string | number;
    };
}

export const AutoSkeleton: React.FC<AutoSkeletonProps> = ({
    loading,
    children,
    config,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [skeletons, setSkeletons] = useState<Array<{
        key: string;
        type: 'primitive' | 'container';
        width: number;
        height: number;
        top: number;
        left: number;
        borderRadius: string;
        style?: React.CSSProperties; // For container styles
    }>>([]);

    const updateSkeletons = () => {
        if (!containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const newSkeletons: typeof skeletons = [];

        // Helper to categorize node
        const getSkeletonType = (el: Element): { type: 'primitive' | 'container', styles?: React.CSSProperties } | null => {
            const tagName = el.tagName.toLowerCase();
            const style = window.getComputedStyle(el);

            // 1. Atomic Content (always pulse)
            if (['img', 'input', 'button', 'textarea', 'select'].includes(tagName)) {
                return { type: 'primitive' };
            }

            // 2. Text Content (always pulse)
            const hasText = Array.from(el.childNodes).some(
                n => n.nodeType === Node.TEXT_NODE && n.textContent?.trim()
            );
            if (hasText) return { type: 'primitive' };

            // 3. Structural Container (static clone)
            // If it has visible styles but no direct text => it's a container
            const hasBackground = style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent';
            const hasBorder = style.borderWidth !== '0px' && style.borderStyle !== 'none' && style.borderColor !== 'rgba(0, 0, 0, 0)' && style.borderColor !== 'transparent';
            const hasShadow = style.boxShadow !== 'none';

            if (hasBackground || hasBorder || hasShadow) {
                return {
                    type: 'container',
                    styles: {
                        backgroundColor: style.backgroundColor,
                        border: style.border,
                        borderRadius: style.borderRadius,
                        boxShadow: style.boxShadow,
                    }
                };
            }

            return null;
        };

        // Traverse
        const walker = document.createTreeWalker(
            containerRef.current,
            NodeFilter.SHOW_ELEMENT,
            {
                acceptNode: (node) => {
                    const el = node as Element;
                    const style = window.getComputedStyle(el);
                    if (style.display === 'none') return NodeFilter.FILTER_REJECT;

                    // If it matches a type, accept it. 
                    // Note: We want to accept containers AND traverse their children.
                    // FILTER_ACCEPT does both.
                    if (getSkeletonType(el)) return NodeFilter.FILTER_ACCEPT;

                    return NodeFilter.FILTER_SKIP;
                }
            }
        );

        let node = walker.nextNode();
        let idx = 0;
        while (node) {
            const el = node as Element;
            const rect = el.getBoundingClientRect();
            const typeData = getSkeletonType(el);

            if (typeData) {
                // Determine border radius logic
                let borderRadius = config?.borderRadius || typeData.styles?.borderRadius || window.getComputedStyle(el).borderRadius;

                if (typeData.type === 'primitive') {
                    // Auto-detect circle for rounded primitives
                    if (borderRadius === '0px' || !borderRadius) {
                        if (window.getComputedStyle(el).borderRadius === '50%' || (rect.width === rect.height && rect.width < 50)) {
                            // Keep heuristic or default
                        }
                        borderRadius = '4px';
                        if (el.tagName.toLowerCase() === 'button') borderRadius = '6px';
                        if (el.tagName.toLowerCase() === 'img') borderRadius = '4px';
                    }
                }

                newSkeletons.push({
                    key: `${idx++}`,
                    type: typeData.type,
                    width: rect.width,
                    height: rect.height,
                    top: rect.top - containerRect.top,
                    left: rect.left - containerRect.left,
                    borderRadius: borderRadius as string,
                    style: typeData.styles
                });
            }

            node = walker.nextNode();
        }

        // If no content nodes found, but container has size (maybe a canvas or simple div w/ background), 
        // Fallback? Or maybe user wants the single block behavior. 
        // Let's add that fallback if newSkeletons is empty but container has dimension.
        if (newSkeletons.length === 0 && (containerRect.width > 0 || containerRect.height > 0)) {
            newSkeletons.push({
                key: 'fallback',
                type: 'primitive',
                width: containerRect.width,
                height: containerRect.height,
                top: 0,
                left: 0,
                borderRadius: config?.borderRadius as string || '4px'
            });
        }

        setSkeletons(newSkeletons);
    };

    useEffect(() => {
        if (!containerRef.current) return;

        // Initial measure
        updateSkeletons();

        const observer = new ResizeObserver(() => {
            updateSkeletons();
        });

        observer.observe(containerRef.current);
        // Also observe children mutations if possible, but ResizeObserver on container catches layout changes often.
        // For robust child changes:
        const mutationObserver = new MutationObserver(() => updateSkeletons());
        mutationObserver.observe(containerRef.current, { childList: true, subtree: true, characterData: true });

        return () => {
            observer.disconnect();
            mutationObserver.disconnect();
        };
    }, [loading, children]); // Re-scan when children change

    return (
        <div style={{ position: 'relative', display: 'inline-block', width: 'auto' }}>
            <div
                ref={containerRef}
                style={{
                    opacity: loading ? 0 : 1,
                    transition: 'opacity 0.2s ease', // Smooth transition when loading finishes
                }}
                aria-hidden={loading}
            >
                {children}
            </div>

            {loading && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                    }}
                >
                    {skeletons.map((sk) => (
                        <div key={sk.key} style={{ position: 'absolute', top: sk.top, left: sk.left }}>
                            {sk.type === 'primitive' ? (
                                <SkeletonPrimitive
                                    width={sk.width}
                                    height={sk.height}
                                    borderRadius={sk.borderRadius}
                                    color={config?.color}
                                    highlightColor={config?.highlightColor}
                                />
                            ) : (
                                /* Container Clone: Renders static style */
                                <div
                                    style={{
                                        width: sk.width,
                                        height: sk.height,
                                        borderRadius: sk.borderRadius,
                                        ...sk.style, // Apply captured container styles
                                        // Ensure it doesn't hide children if z-index issues arise, 
                                        // but since we render in DOM order, children come later and sit on top.
                                        boxSizing: 'border-box'
                                    }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
