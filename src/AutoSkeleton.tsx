import React, {
  ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { sameBoxes, scanSkeletons, type SkeletonBox } from './scan';
import { SkeletonPrimitive, type SkeletonAnimation } from './SkeletonPrimitive';
import { useDisplayedLoading } from './useDisplayedLoading';
import { usePrefersDark } from './usePrefersDark';

/** Crossfade duration (ms) between the skeleton and the real content. */
const FADE_MS = 200;

export interface AutoSkeletonProps {
  loading: boolean;
  children: ReactNode;
  /** Text announced to screen readers while loading. */
  loadingLabel?: string;
  /** Class name for the outer wrapper. */
  className?: string;
  /** Style for the outer wrapper; merged over the defaults (`position: relative; display: block`). */
  style?: React.CSSProperties;
  /**
   * When `loading` turns on after mount, wait this long (ms) before showing the
   * skeleton, so fast refetches never flash it. Not applied on mount. Default 150.
   */
  delay?: number;
  /** Once shown, keep the skeleton at least this long (ms). Default 400. */
  minDuration?: number;
  config?: {
    /**
     * `'adaptive'` (default) tints bars from the surrounding text color so they
     * match any theme; `'static'` uses fixed light/dark greys; any CSS color sets it.
     */
    color?: 'adaptive' | 'static' | (string & {});
    highlightColor?: string;
    borderRadius?: string | number;
    theme?: 'light' | 'dark' | 'auto';
    /** `pulse` (default), `shimmer`, or `none`. */
    animation?: SkeletonAnimation;
    // Theme-specific colors (override CSS variables)
    lightColor?: string;
    lightHighlightColor?: string;
    darkColor?: string;
    darkHighlightColor?: string;
  };
}

const VISUALLY_HIDDEN: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

export const AutoSkeleton: React.FC<AutoSkeletonProps> = ({
  loading,
  children,
  loadingLabel = 'Loading…',
  className,
  style,
  delay = 150,
  minDuration = 400,
  config,
}) => {
  const theme = config?.theme || 'auto';
  const colorMode = config?.color;
  // Adaptive unless a fixed palette was asked for (static mode or an explicit theme)
  const adaptive = colorMode !== 'static' && theme === 'auto';
  const explicitColor =
    colorMode === 'adaptive' || colorMode === 'static' ? undefined : colorMode;
  const prefersDark = usePrefersDark();
  // 'auto' follows the OS color scheme so light*/dark* colors apply there too
  const resolvedTheme =
    theme === 'auto' ? (prefersDark ? 'dark' : 'light') : theme;
  const showSkeleton = useDisplayedLoading(loading, { delay, minDuration });
  // Content stays hidden while data is missing or the skeleton is still held on screen
  const busy = loading || showSkeleton;

  // Once real content has been shown, a refetch keeps it on screen during `delay`
  // (so fast refetches change nothing visually). Before that, there is only
  // placeholder content, which must stay hidden.
  const [revealed, setRevealed] = useState(!busy);
  if (!busy && !revealed) setRevealed(true);
  const hidden = showSkeleton || (loading && !revealed);

  // Keep the overlay mounted while it fades out (set-state-during-render avoids a blank frame)
  const [fadingOut, setFadingOut] = useState(false);
  const [prevShowSkeleton, setPrevShowSkeleton] = useState(showSkeleton);
  if (prevShowSkeleton !== showSkeleton) {
    setPrevShowSkeleton(showSkeleton);
    setFadingOut(!showSkeleton);
  }
  useEffect(() => {
    if (!fadingOut) return;
    const timer = setTimeout(() => setFadingOut(false), FADE_MS);
    return () => clearTimeout(timer);
  }, [fadingOut]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [skeletons, setSkeletons] = useState<SkeletonBox[]>([]);
  // False until the first client-side measurement (always false on the server)
  const [measured, setMeasured] = useState(false);
  const borderRadius = config?.borderRadius;

  // Measure only while the skeleton is on screen. Layout effect: the first scan
  // happens before paint, so the overlay never shows a frame without bars.
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!showSkeleton || !container) return;

    const scan = () => {
      const next = scanSkeletons(container, borderRadius);
      setSkeletons((prev) => (sameBoxes(prev, next) ? prev : next));
      setMeasured(true);
    };
    scan();

    // Coalesce bursts of resize/mutation events into one scan per frame
    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        scan();
      });
    };
    // A theme switch mid-load (class/style on <html>, <body> or any wrapper
    // above us) changes the ink. Watch only the ancestor chain, not subtrees.
    const themeObserver = new MutationObserver(schedule);
    for (let el = container.parentElement; el; el = el.parentElement) {
      themeObserver.observe(el, {
        attributes: true,
        attributeFilter: ['class', 'style', 'data-theme', 'data-mode'],
      });
    }
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(container);
    const mutationObserver = new MutationObserver(schedule);
    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
    });

    return () => {
      cancelAnimationFrame(frame);
      themeObserver.disconnect();
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
    // prefersDark: an OS theme flip changes the inherited text color, so re-measure the ink
    // oxlint-disable-next-line react/exhaustive-effect-dependencies
  }, [showSkeleton, borderRadius, prefersDark]);

  // Determine effective colors based on theme
  const getEffectiveColors = () => {
    // If user passed explicit color/highlightColor, use those
    if (explicitColor || config?.highlightColor) {
      return {
        color: explicitColor,
        highlightColor: config?.highlightColor,
      };
    }
    // If theme-specific colors are provided, use them
    if (
      resolvedTheme === 'dark' &&
      (config?.darkColor || config?.darkHighlightColor)
    ) {
      return {
        color: config.darkColor,
        highlightColor: config.darkHighlightColor,
      };
    }
    if (
      resolvedTheme === 'light' &&
      (config?.lightColor || config?.lightHighlightColor)
    ) {
      return {
        color: config.lightColor,
        highlightColor: config.lightHighlightColor,
      };
    }
    // Otherwise, let CSS variables handle it (undefined = use CSS var defaults)
    return { color: undefined, highlightColor: undefined };
  };

  const effectiveColors = getEffectiveColors();

  return (
    <div
      className={className}
      style={{ position: 'relative', display: 'block', ...style }}
      {...(theme !== 'auto' ? { 'data-skeleton-theme': theme } : {})}
      aria-busy={busy}
    >
      {/* <output> is not reliably announced as a live region; role="status" is. */}
      {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role */}
      <span role="status" style={VISUALLY_HIDDEN}>
        {busy ? loadingLabel : ''}
      </span>
      <div
        ref={containerRef}
        style={{
          opacity: hidden ? 0 : 1,
          // Hide instantly (no ghost content under the bars); fade only on reveal
          transition: hidden ? 'none' : `opacity ${FADE_MS}ms ease`,
        }}
        aria-hidden={hidden}
        inert={busy}
      >
        {children}
      </div>

      {(showSkeleton || fadingOut) && (
        <div
          data-testid="skeleton-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            opacity: showSkeleton ? 1 : 0,
            transition: `opacity ${FADE_MS}ms ease`,
          }}
        >
          {!measured && (
            // Server render / before hydration: nothing can be measured yet, so
            // cover the reserved space with one block instead of showing nothing
            <SkeletonPrimitive
              width="100%"
              height="100%"
              adaptive={adaptive}
              color={effectiveColors.color}
              highlightColor={effectiveColors.highlightColor}
              animation={config?.animation}
            />
          )}
          {skeletons.map((sk) => (
            <div
              key={sk.key}
              style={{ position: 'absolute', top: sk.top, left: sk.left }}
            >
              {sk.type === 'primitive' ? (
                <SkeletonPrimitive
                  width={sk.width}
                  height={sk.height}
                  borderRadius={sk.borderRadius}
                  adaptive={adaptive}
                  ink={sk.ink}
                  color={effectiveColors.color}
                  highlightColor={effectiveColors.highlightColor}
                  animation={config?.animation}
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
                    boxSizing: 'border-box',
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
