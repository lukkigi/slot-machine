import { ASSET_COUNT, ASSET_PATH, ASSET_SUFFIX, BOUNCE_FACTOR, COLUMN_TOP_PADDING, FOOTER_SIZE, ITEM_PADDING, VISIBLE_ITEMS_COUNT } from '../constants';

export const buildAssetPath = (assetNumber: number): string | null => {
  if (assetNumber == null) {
    return null;
  }

  return ASSET_PATH + (assetNumber % ASSET_COUNT) + ASSET_SUFFIX;
};

// Returns the y coordinate for an element at the first position, so all visible elements will be shown regardless of screen height
export const getVerticalCoord = (screenHeight: number): number => {
  if (!screenHeight) {
    return 0;
  }

  return Math.round((screenHeight - FOOTER_SIZE - COLUMN_TOP_PADDING + ITEM_PADDING * 3) / VISIBLE_ITEMS_COUNT);
};

// Calls getVerticalCoord() but returns it multiplicated with the position offset to account for the position of every element after the first one
export const getVerticalCoordForNthElement = (elementPosition: number, screenHeight: number): number => {
  if (elementPosition == null || screenHeight == null) {
    return 0;
  }

  return Math.round(elementPosition * getVerticalCoord(screenHeight));
};

/**
 * We need this to get values between our start and end point, taking the time into consideration
 * without using this function there would be just the end animation happening
 *
 * Function used is from https://en.wikipedia.org/wiki/Linear_interpolation
 */
export const linearInterpolation = (start: number, end: number, alpha: number): number => {
  return (1 - alpha) * start + end * alpha;
};

// Taken from https://easings.net/#easeOutBack and modified the BOUNCE_FACTOR to fit my needs
export const bounce = (alpha: number): number => {
  return 1 + (BOUNCE_FACTOR + 1) * Math.pow(alpha - 1, 3) + BOUNCE_FACTOR * Math.pow(alpha - 1, 2);
};
