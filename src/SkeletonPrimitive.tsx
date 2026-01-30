import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface SkeletonPrimitiveProps extends HTMLMotionProps<'div'> {
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
    color?: string;
    highlightColor?: string;
}

export const SkeletonPrimitive: React.FC<SkeletonPrimitiveProps> = ({
    width,
    height,
    borderRadius = '4px',
    color = '#eee',
    highlightColor = '#f5f5f5',
    style,
    ...props
}) => {
    return (
        <motion.div
            style={{
                width,
                height,
                borderRadius,
                backgroundColor: color,
                ...style,
            }}
            animate={{
                backgroundColor: [color, highlightColor, color],
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
            data-testid="skeleton"
            {...props}
        />
    );
};
