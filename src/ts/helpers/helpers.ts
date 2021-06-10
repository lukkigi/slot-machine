import {
  ASSET_COUNT,
  ASSET_PATH,
  ASSET_SUFFIX,
  COLUMN_TOP_PADDING,
  FOOTER_SIZE,
  VISIBLE_ITEMS_COUNT,
} from '../constants';

export const buildAssetPath = (assetNumber: number): string => {
  return ASSET_PATH + (assetNumber % ASSET_COUNT) + ASSET_SUFFIX;
};

export const getVerticalCoord = (screenHeight: number): number => {
  return Math.round(
    (screenHeight - FOOTER_SIZE - COLUMN_TOP_PADDING) / VISIBLE_ITEMS_COUNT
  );
};

export const getVerticalCoordForNthElement = (
  elementPosition: number,
  screenHeight: number
): number => {
  return Math.round(elementPosition * getVerticalCoord(screenHeight));
};

/*
 * We need this to get values between our start and end point, taking the time into consideration
 * without using this function there would be just the end animation happening
 *
 * Function used is from https://en.wikipedia.org/wiki/Linear_interpolation
 */
export const linearInterpolation = (
  start: number,
  end: number,
  alpha: number
): number => {
  return (1 - alpha) * start + end * alpha;
};

// Taken from https://github.com/tweenjs/tween.js/blob/master/src/Easing.ts and modified s to fit my needs
export const bounce = (amount: number): number => {
  const s = 0.50158;
  return amount === 0 ? 0 : --amount * amount * ((s + 1) * amount + s) + 1;
};
