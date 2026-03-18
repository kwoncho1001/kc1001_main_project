import { DigitalInkObject, InkObjectType } from './types';

export type DigitalInkObjectSkeleton = Partial<DigitalInkObject> & { type: InkObjectType; x: number; y: number };

export const convertToDigitalInkObjects = (
  skeletons: DigitalInkObjectSkeleton[],
  options: { regenerateIds?: boolean } = {}
): DigitalInkObject[] => {
  return skeletons.map((skeleton) => {
    const id = options.regenerateIds ? Math.random().toString(36).substr(2, 9) : (skeleton.id || Math.random().toString(36).substr(2, 9));
    return {
      id,
      type: skeleton.type,
      x: skeleton.x,
      y: skeleton.y,
      width: skeleton.width || 100,
      height: skeleton.height || 100,
      strokeColor: skeleton.strokeColor || 'var(--foreground)',
      backgroundColor: skeleton.backgroundColor || 'transparent',
      strokeWidth: skeleton.strokeWidth || 2,
      opacity: skeleton.opacity || 1,
      points: skeleton.points || [],
      text: skeleton.text || '',
      fontSize: skeleton.fontSize || 16,
      fontFamily: skeleton.fontFamily || 'Inter',
      imageUrl: skeleton.imageUrl || '',
      version: skeleton.version || 1,
      versionNonce: skeleton.versionNonce || Date.now(),
      isDeleted: skeleton.isDeleted || false,
      customData: skeleton.customData || {},
    };
  });
};

export const newElementWith = (
  element: DigitalInkObject,
  updates: Partial<DigitalInkObject>
): DigitalInkObject => {
  return {
    ...element,
    ...updates,
    version: element.version + 1,
    versionNonce: Date.now(),
  };
};

export const bumpElementVersions = (elements: DigitalInkObject[]): DigitalInkObject[] => {
  return elements.map((el) => ({
    ...el,
    version: el.version + 1,
    versionNonce: Date.now(),
  }));
};
