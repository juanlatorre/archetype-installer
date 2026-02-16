import React, { useContext, useMemo } from 'react';
import { ImageDefinition } from '../utils/themeParser';
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

      // If alias has inset, we usually want to wrap it in a container that applies the inset,
      // OR pass the inset down if possible.
      // But standard alias behavior often implies "render this thing here".

      const containerStyle: React.CSSProperties = {
          position: 'absolute',
          top: def.inset?.top !== undefined ? def.inset.top : 0,
          left: def.inset?.left !== undefined ? def.inset.left : 0,
          right: def.inset?.right !== undefined ? def.inset.right : 0,
          bottom: def.inset?.bottom !== undefined ? def.inset.bottom : 0,
          width: width, // Inherit or override
          height: height,
          ...style
      };

      // If alias overrides tint
      const childDef = refDef ? { ...refDef, tint: def.tint || refDef.tint } : undefined;

      if (!childDef) {
          // If ref is 'none' or missing, render nothing (or just the container if it has styles?)
          if (def.ref === 'none') return null;
          return null;
      }

      return (
          <div className={className} style={containerStyle}>
              <ThemedImage
                def={childDef}
                width="100%"
                height="100%"
              />
          </div>
      );
  }

  // Handle Composed / Grid
  if (def.type === 'composed' || def.type === 'grid') {
      const isGrid = def.type === 'grid';
      const isComposed = def.type === 'composed';

      const containerStyle: React.CSSProperties = {
          position: 'relative',
          width: width || '100%',
          height: height || '100%',
          ...style
      };

      if (isGrid) {
          containerStyle.display = 'flex';
          if (def.weightsX) {
              containerStyle.flexDirection = 'row';
          } else if (def.weightsY) {
              containerStyle.flexDirection = 'column';
          }
          // If both or neither, row is often default for simple grids, but usually weights are present.
      }

      const weights = def.weightsX
          ? def.weightsX.split(',').map(Number)
          : def.weightsY
              ? def.weightsY.split(',').map(Number)
              : [];

      return (
          <div className={className} style={containerStyle}>
              {def.children?.map((child, idx) => {
                  const weight = weights[idx] !== undefined ? weights[idx] : 0;
                  const childStyle: React.CSSProperties = {};

                  // Propagate tint from parent composed/grid to child if child doesn't have one
                  const childDef = { ...child, tint: child.tint || def.tint };

                  if (isComposed) {
                      childStyle.position = 'absolute';

                      // Inset handling
                      if (child.inset) {
                          childStyle.top = child.inset.top;
                          childStyle.left = child.inset.left;
                          childStyle.right = child.inset.right;
                          childStyle.bottom = child.inset.bottom;
                      } else {
                          // Default to filling parent if not specified?
                          // Or should we let it be auto?
                          // "composed" usually means layers filling the parent.
                          childStyle.top = 0;
                          childStyle.left = 0;
                          childStyle.right = 0;
                          childStyle.bottom = 0;
                      }

                      // Size Overwrites
                      if (child.sizeOverwriteH) {
                          childStyle.width = parseInt(child.sizeOverwriteH);
                          childStyle.right = undefined; // Fixed width, so don't anchor right
                          // If inset.left is missing, maybe center? But usually left is 0.
                      }
                      if (child.sizeOverwriteV) {
                          childStyle.height = parseInt(child.sizeOverwriteV);
                          childStyle.bottom = undefined;
                      }
                  } else if (isGrid) {
                      // Grid Item Logic
                      childStyle.position = 'relative';
                      childStyle.flexGrow = weight;

                      if (weight === 0) {
                          childStyle.flexShrink = 0;
                          // If it's a fixed size item (weight 0), it might have sizeOverwrite
                          if (child.sizeOverwriteH) childStyle.width = parseInt(child.sizeOverwriteH);
                          if (child.sizeOverwriteV) childStyle.height = parseInt(child.sizeOverwriteV);
                          // Or it might depend on content (natural image size)
                      } else {
                          // Flexible item
                          childStyle.flexBasis = 0;
                          childStyle.minWidth = 0;
                          childStyle.minHeight = 0;
                      }

                      // Inset in grid often implies margin/padding
                      if (child.inset) {
                          childStyle.marginTop = child.inset.top;
                          childStyle.marginLeft = child.inset.left;
                          childStyle.marginBottom = child.inset.bottom;
                          childStyle.marginRight = child.inset.right;
                      }
                  }

                  return (
                      <ThemedImage
                        key={idx}
                        def={childDef}
                        style={childStyle}
                      />
                  );
              })}
          </div>
      );
  }

  // Handle Select (Render first matching child - simplified to first child for preview)
  if (def.type === 'select') {
      // In a real engine, we'd check 'if' conditions (hover, disabled, etc.)
      // For preview, we mostly want the default state.
      // Often the last child is the default or 'fallback'.
      // OR there's a child with no 'if' condition.

      let selectedChild = def.children?.[def.children.length - 1]; // Default to last?

      // Try to find one without 'if', or where 'if' is 'default' (not standard XML but logic wise)
      // Actually, many selects have: <alias ... if="hover"/> <alias .../>
      // The one without 'if' is the default.

      const defaultChild = def.children?.find(c => !c.if);
      if (defaultChild) selectedChild = defaultChild;

      if (!selectedChild) return null;

      // Propagate tint
      const childDef = { ...selectedChild, tint: selectedChild.tint || def.tint };

      return <ThemedImage def={childDef} style={style} className={className} width={width} height={height} />;
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
                    //    bgStyle.width = xywhParts[2];
                    //    bgStyle.height = xywhParts[3];
                       // Don't force width/height here if parent controls it,
                       // but for 'area' type, it often defines the size.
                   }
              } else if (xywhParts) {
                  // Just a region, treat as fill using atlas (can't stretch safely)
                  const [x, y, w, h] = xywhParts;
                  bgStyle.backgroundImage = `url(${def.file})`;
                  bgStyle.backgroundPosition = `-${x}px -${y}px`;
                  // If we use backgroundPosition, we assume the container is exactly w x h
                  // But ThemedImage props might say '100%'.
                  // Standard CSS sprites don't stretch.
                  // For now, let's assume 'contain' or 'cover' isn't what we want for sprites.
                  bgStyle.width = w;
                  bgStyle.height = h;
                  bgStyle.backgroundRepeat = 'no-repeat';
              } else {
                   // Whole image
                   bgStyle.backgroundImage = `url(${def.file})`;
                   bgStyle.backgroundSize = 'contain'; // or 100% 100%?
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

  return null;
};

export default ThemedImage;
