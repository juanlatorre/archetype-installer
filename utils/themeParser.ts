import { ColorTheme } from '../types';

export interface Inset {
    top: number;
    left: number;
    bottom: number;
    right: number;
}

export interface ImageDefinition {
  type: string;
  name?: string;
  file?: string;
  xywh?: string;
  tint?: string;
  inset?: Inset;
  children?: ImageDefinition[];
  ref?: string;
  weightsX?: string;
  weightsY?: string;
  splitx?: string;
  splity?: string;
  sizeOverwriteH?: string;
  sizeOverwriteV?: string;
  if?: string;
  flip?: string;
}

export const fetchXML = async (path: string): Promise<Document> => {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to fetch XML at ${path}: ${response.statusText}`);
  }
  const text = await response.text();
  const parser = new DOMParser();
  return parser.parseFromString(text, 'text/xml');
};

export const parseColors = (xmlDoc: Document): Map<string, string> => {
  const colors = new Map<string, string>();
  const constantDefs = xmlDoc.getElementsByTagName('constantDef');
  for (let i = 0; i < constantDefs.length; i++) {
    const constantDef = constantDefs[i];
    const name = constantDef.getAttribute('name');
    const colorNode = constantDef.getElementsByTagName('color')[0];
    const color = colorNode?.textContent;
    if (name && color) {
      colors.set(name, color);
    }
  }
  return colors;
};

export const parseImages = (xmlDoc: Document, basePath: string): Map<string, ImageDefinition> => {
  const images = new Map<string, ImageDefinition>();

  const processNode = (node: Element, parentFile?: string): ImageDefinition | null => {
    const tagName = node.tagName;

    // Attributes
    const name = node.getAttribute('name') || undefined;
    let file = node.getAttribute('file');
    if (file) {
        // Assume file path is relative to the XML's directory (basePath)
        file = `${basePath}/${file}`;
    } else {
        file = parentFile;
    }

    const xywh = node.getAttribute('xywh') || undefined;
    const tint = node.getAttribute('tint') || undefined;

    let inset: Inset | undefined;
    const insetStr = node.getAttribute('inset');
    if (insetStr) {
        const parts = insetStr.split(',').map(Number);
        if (parts.length === 1) inset = { top: parts[0], left: parts[0], bottom: parts[0], right: parts[0] };
        else if (parts.length === 2) inset = { top: parts[1], left: parts[0], bottom: parts[1], right: parts[0] };
        else if (parts.length === 4) inset = { top: parts[0], left: parts[3], bottom: parts[2], right: parts[1] };
    }

    const ref = node.getAttribute('ref') || undefined;
    const weightsX = node.getAttribute('weightsX') || undefined;
    const weightsY = node.getAttribute('weightsY') || undefined;
    const splitx = node.getAttribute('splitx') || undefined;
    const splity = node.getAttribute('splity') || undefined;
    const sizeOverwriteH = node.getAttribute('sizeOverwriteH') || undefined;
    const sizeOverwriteV = node.getAttribute('sizeOverwriteV') || undefined;
    const ifCond = node.getAttribute('if') || undefined;
    const flip = node.getAttribute('flip') || undefined;

    const children: ImageDefinition[] = [];
    // Process child nodes
    for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (child.nodeType === 1) { // Element node
            const childDef = processNode(child, file);
            if (childDef) {
                children.push(childDef);
            }
        }
    }

    // Construct definition
    const def: ImageDefinition = {
        type: tagName,
        name,
        file,
        xywh,
        tint,
        inset,
        children: children.length > 0 ? children : undefined,
        ref,
        weightsX,
        weightsY,
        splitx,
        splity,
        sizeOverwriteH,
        sizeOverwriteV,
        if: ifCond,
        flip
    };

    if (name) {
        images.set(name, def);
    }

    // <images> tag is just a container and provider of 'file' context
    if (tagName === 'images') {
        return null;
    }

    return def;
  };

  // Iterate over top-level nodes of <themes>
  const root = xmlDoc.documentElement; // <themes>
  for (let i = 0; i < root.children.length; i++) {
      processNode(root.children[i]);
  }

  return images;
};

export const loadThemeColors = async (themeId: string, customThemeOverride?: ColorTheme): Promise<Map<string, string>> => {
    let filename = 'CHOOSE_YOUR_COLORS.xml';

    const map: Record<string, string> = {
        default: 'CHOOSE_YOUR_COLORS.xml',
        frostbite: 'CHOOSE_YOUR_COLORS_FROSTBITE.xml',
        industrial: 'CHOOSE_YOUR_COLORS_INDUSTRIAL.xml',
        rose: 'CHOOSE_YOUR_COLORS_ROSÉ.xml',
        sunrise: 'CHOOSE_YOUR_COLORS_SUNRISE.xml',
        twilight: 'CHOOSE_YOUR_COLORS_TWILIGHT.xml',
        green420: 'CHOOSE_YOUR_COLORS_420GREEN.xml',
        ember: 'CHOOSE_YOUR_COLORS_EMBER.xml',
        arcticwhite: 'CHOOSE_YOUR_COLORS_ARCTICWHITE.xml'
    };

    if (map[themeId]) {
        filename = map[themeId];
    } else if (themeId !== 'custom') {
        filename = 'CHOOSE_YOUR_COLORS.xml';
    }
    try {
        const xmlDoc = await fetchXML(`/archetype/theme/${filename}`);
        const colors = parseColors(xmlDoc);

        if (themeId === 'custom' && customThemeOverride) {
            colors.set('main-color', customThemeOverride.hex);
            colors.set('sub-color', customThemeOverride.sub);
            colors.set('font-main-color', customThemeOverride.textOnMain);
            colors.set('font-sub-color', customThemeOverride.textOnSub);
            colors.set('hp-high-color', customThemeOverride.hpHigh);
            colors.set('xp-color', customThemeOverride.xp);
            colors.set('friendship-color', customThemeOverride.friendship);
        }

        return colors;
    } catch (e) {
        try {
             const xmlDoc = await fetchXML(`/themes/colors/${filename}`);
             const colors = parseColors(xmlDoc);
             return colors;
        } catch (e2) {
             console.error("Error loading theme colors:", e);
             return new Map();
        }
    }
};

export const loadBattleImages = async (shape: string = 'Round'): Promise<{ images: Map<string, ImageDefinition>; dimensions: Map<string, { w: number; h: number }> }> => {
    const allImages = new Map<string, ImageDefinition>();
    const fileSet = new Set<string>();

    const themeRoot = '/archetype/theme';

    // 1. Load Main Theme XML to find includes
    try {
        const themeXmlDoc = await fetchXML(`${themeRoot}/theme.xml`);
        const root = themeXmlDoc.documentElement;
        const includes = root.getElementsByTagName('include');

        const filesToLoad: string[] = [];

        for (let i = 0; i < includes.length; i++) {
            const filename = includes[i].getAttribute('filename');
            if (filename) {
                filesToLoad.push(filename);
            }
        }

        const shapeFile = `assets/${shape}.xml`;
        filesToLoad.push(shapeFile);

        const uniqueFiles = Array.from(new Set(filesToLoad));

        await Promise.all(uniqueFiles.map(async (file) => {
            try {
                // Determine full path and base path for this file
                const fullPath = `${themeRoot}/${file}`;
                const lastSlash = fullPath.lastIndexOf('/');
                const basePath = lastSlash !== -1 ? fullPath.substring(0, lastSlash) : themeRoot;

                const xmlDoc = await fetchXML(fullPath);

                const images = parseImages(xmlDoc, basePath);
                images.forEach((v, k) => {
                    allImages.set(k, v);
                    if (v.file) fileSet.add(v.file);
                });
            } catch (e) {
                // console.warn(`Skipping optional or missing file: ${file}`);
            }
        }));

    } catch (e) {
        console.error("Error loading theme.xml:", e);
    }

    // Recursively find files in nested children (composed)
    const findFiles = (def: ImageDefinition) => {
        if (def.file) fileSet.add(def.file);
        def.children?.forEach(findFiles);
    };
    allImages.forEach(findFiles);

    const dimensions = new Map<string, { w: number; h: number }>();
    await Promise.all(Array.from(fileSet).map(async (src) => {
        return new Promise<void>((resolve) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => {
                dimensions.set(src, { w: img.naturalWidth, h: img.naturalHeight });
                resolve();
            };
            img.onerror = () => {
                // console.warn(`Failed to load image: ${src}`);
                resolve();
            };
            img.src = src;
        });
    }));

    return { images: allImages, dimensions };
};
