import React, { useContext, useMemo } from 'react';
import { ImageDefinition } from '../utils/themeParser';

// We need to define the context shape, but since we are extracting this,
// we'll need to export the Context from somewhere or define it here and export it.
// For simplicity, let's define a Context provider in a separate file or
// keep it simple and pass props if we don't want to over-engineer.
// However, the Context approach was good for avoiding prop drilling of 'images' and 'colors'.

// Let's create a ThemeContext file.
import { ThemeContext } from './ThemeContext';

interface ThemedImageProps {
  name?: string;
  def?: ImageDefinition;
  style?: React.CSSProperties;
  className?: string;
  width?: number | string;
  height?: number | string;
}

// Helper to resolve color variable or return raw string
const resolveColor = (color: string | undefined, colors: Map<string, string>): string | undefined => {
  if (!color) return undefined;
  if (color.startsWith('#')) return color;
  return colors.get(color) || color;
};

const ThemedImage: React.FC<ThemedImageProps> = ({ name, def: propDef, style, className, width, height }) => {
  const { images, colors, dimensions, processedImages } = useContext(ThemeContext);

  const def = useMemo(() => {
      if (propDef) return propDef;
      if (name) return images.get(name);
      return undefined;
  }, [name, propDef, images]);

  if (!def) return null;

  // Handle Alias
  if (def.type === 'alias' && def.ref) {
      const refDef = images.get(def.ref);
      if (!refDef) return null;

      return (
          <div
            className={className}
            style={{
                position: 'absolute',
                top: def.inset?.top,
                right: def.inset?.right,
                bottom: def.inset?.bottom,
                left: def.inset?.left,
                width: width || '100%',
                height: height || '100%',
                ...style
            }}
          >
              <ThemedImage
                def={{ ...refDef, tint: def.tint || refDef.tint }}
                width="100%"
                height="100%"
              />
          </div>
      );
  }

  // Handle Composed / Grid
  if (def.type === 'composed' || def.type === 'grid') {
      return (
          <div
            className={className}
            style={{
                position: 'relative',
                width: width || '100%',
                height: height || '100%',
                ...style
            }}
          >
              {def.children?.map((child, idx) => (
                  <ThemedImage
                    key={idx}
                    def={child}
                    style={{
                        position: 'absolute',
                        top: child.inset?.top || 0,
                        left: child.inset?.left || 0,
                        right: child.inset?.right !== undefined ? child.inset.right : undefined,
                        bottom: child.inset?.bottom !== undefined ? child.inset.bottom : undefined,
                        width: child.sizeOverwriteH ? parseInt(child.sizeOverwriteH) : undefined,
                        height: child.sizeOverwriteV ? parseInt(child.sizeOverwriteV) : undefined,
                    }}
                  />
              ))}
          </div>
      );
  }

  // Handle Area (Leaf node with image)
  if (def.type === 'area' || def.file) {
      const tint = resolveColor(def.tint, colors);

      const bgStyle: React.CSSProperties = {};
      let isBorderImage = false;

      // Try to find a processed (cropped) image
      const key = def.file && def.xywh ? `${def.file}:${def.xywh}` : undefined;
      const processedUrl = key ? processedImages.get(key) : undefined;

      if (def.file) {
          const xywhParts = def.xywh && def.xywh !== '*' ? def.xywh.split(',').map(Number) : undefined;

          let useBorderImage = false;

          // Check for split (9-slice)
          if (def.splitx && def.splity) {
              const parseSplit = (str: string, prefix1: string, prefix2: string) => {
                  const p1 = str.match(new RegExp(`${prefix1}(\\d+)`));
                  const p2 = str.match(new RegExp(`${prefix2}(\\d+)`));
                  return [p1 ? parseInt(p1[1]) : 0, p2 ? parseInt(p2[1]) : 0];
              };
              const [l, r] = parseSplit(def.splitx, 'L', 'R');
              const [t, b] = parseSplit(def.splity, 'T', 'B');

              if (processedUrl) {
                  // Use processed image (already cropped to xywh)
                  bgStyle.borderImageSource = `url(${processedUrl})`;
                  // Since image is cropped, slice is just the split values
                  bgStyle.borderImageSlice = `${t} ${r} ${b} ${l} fill`;
                  bgStyle.borderWidth = `${t}px ${r}px ${b}px ${l}px`;
                  bgStyle.borderStyle = 'solid';
                  bgStyle.boxSizing = 'border-box';
                  useBorderImage = true;
              } else if (!processedUrl && !xywhParts) {
                  // Whole image 9-slice (if xywh='*') or no xywh
                  bgStyle.borderImageSource = `url(${def.file})`;
                  bgStyle.borderImageSlice = `${t} ${r} ${b} ${l} fill`;
                  bgStyle.borderWidth = `${t}px ${r}px ${b}px ${l}px`;
                  bgStyle.borderStyle = 'solid';
                  bgStyle.boxSizing = 'border-box';
                  useBorderImage = true;
              }
          }

          if (!useBorderImage) {
              if (processedUrl) {
                   // Use processed image as background, stretched to fill container
                   bgStyle.backgroundImage = `url(${processedUrl})`;
                   bgStyle.backgroundSize = '100% 100%';
                   bgStyle.backgroundRepeat = 'no-repeat';
                   // Fallback natural size if container doesn't set width/height
                   if (xywhParts) {
                       bgStyle.width = xywhParts[2];
                       bgStyle.height = xywhParts[3];
                   }
              } else if (xywhParts) {
                  // Just a region, treat as fill using atlas (can't stretch safely)
                  const [x, y, w, h] = xywhParts;
                  bgStyle.backgroundImage = `url(${def.file})`;
                  bgStyle.backgroundPosition = `-${x}px -${y}px`;
                  bgStyle.width = w;
                  bgStyle.height = h;
                  bgStyle.backgroundRepeat = 'no-repeat';
              } else {
                   // Whole image
                   bgStyle.backgroundImage = `url(${def.file})`;
                   bgStyle.backgroundSize = 'contain';
                   bgStyle.backgroundRepeat = 'no-repeat';
              }
          }
      }

      const content = (
          <div
            className={className}
            style={{
                position: 'relative',
                width: width || bgStyle.width,
                height: height || bgStyle.height,
                ...style
            }}
          >
              <div style={{ ...bgStyle, width: '100%', height: '100%' }} />

              {tint && (
                  <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: tint,
                        mixBlendMode: 'multiply',
                        pointerEvents: 'none'
                    }}
                  />
              )}
          </div>
      );

      return content;
  }

  // Select - Render first child
  if (def.type === 'select' && def.children?.[0]) {
      return <ThemedImage def={def.children[0]} style={style} className={className} width={width} height={height} />;
  }

  return null;
};

export default ThemedImage;
