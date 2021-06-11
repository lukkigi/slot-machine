import { buildAssetPath, getVerticalCoord, getVerticalCoordForNthElement, linearInterpolation, bounce } from '../helpers/helpers';

const ASSET_PATH_FIRST_ITEM = 'assets/1.png';
const ASSET_PATH_TENTH_ITEM = 'assets/3.png';

const SCREEN_HEIGHT = 1080;
const EXPECTED_VERTICAL_COORD = 293;
const EXPECTED_VERTICAL_COORD_MAX_INTEGER = 3002399751580264;
const EXPECTED_VERTICAL_COORD_0TH_ELEMENT = 0;
const EXPECTED_VERTICAL_COORD_2ND_ELEMENT = 586;

const LINEAR_INTERPOLATION_START = 0;
const LINEAR_INTERPOLATION_END = 20;

const EXPECTED_BOUNCE_MIDDLE_POINT_VALUE = 0.9249999999999999;
const EXPECTED_BOUNCE_NEAR_END_POINT_VALUE = 1.003125;

describe('buildAssetPath', () => {
  it('should return the correct path', () => {
    expect(buildAssetPath(1)).toBe(ASSET_PATH_FIRST_ITEM);
  });

  it('should handle overflowing asset numbers correctly', () => {
    expect(buildAssetPath(10)).toBe(ASSET_PATH_TENTH_ITEM);
  });

  it('should return undefined if assetNumber is undefined', () => {
    expect(buildAssetPath(undefined)).toBeNull();
  });
});

describe('getVerticalCoord', () => {
  it('should return the vertical coordinate correctly', () => {
    expect(getVerticalCoord(SCREEN_HEIGHT)).toBe(EXPECTED_VERTICAL_COORD);
  });

  it('should return zero if screenHeight is undefined', () => {
    expect(getVerticalCoord(undefined)).toBe(0);
  });

  it('should be able to handle large values - just in case', () => {
    expect(getVerticalCoord(Number.MAX_SAFE_INTEGER)).toBe(EXPECTED_VERTICAL_COORD_MAX_INTEGER);
  });
});

describe('getVerticalCoordForNthElement', () => {
  it('should return the vertical coordinate for the 0th element correctly', () => {
    expect(getVerticalCoordForNthElement(0, SCREEN_HEIGHT)).toBe(EXPECTED_VERTICAL_COORD_0TH_ELEMENT);
  });

  it('should return the vertical coordinate for the 2nd element correctly', () => {
    expect(getVerticalCoordForNthElement(2, SCREEN_HEIGHT)).toBe(EXPECTED_VERTICAL_COORD_2ND_ELEMENT);
  });

  it('should return zero if elementPosition or screenHeight is undefined', () => {
    expect(getVerticalCoordForNthElement(undefined, undefined)).toBe(0);
  });
});

describe('linearInterpolation', () => {
  it('should return the origin point correctly', () => {
    expect(linearInterpolation(LINEAR_INTERPOLATION_START, LINEAR_INTERPOLATION_END, 0)).toBe(LINEAR_INTERPOLATION_START);
  });

  it('should return the target point correctly', () => {
    expect(linearInterpolation(LINEAR_INTERPOLATION_START, LINEAR_INTERPOLATION_END, 1)).toBe(LINEAR_INTERPOLATION_END);
  });

  it('should return the halfway point correctly', () => {
      expect(linearInterpolation(LINEAR_INTERPOLATION_START, LINEAR_INTERPOLATION_END, 0.5)).toBe(LINEAR_INTERPOLATION_END / 2);
  });

  it('should return the point at 0.3 correctly', () => {
      expect(linearInterpolation(LINEAR_INTERPOLATION_START, LINEAR_INTERPOLATION_END, 0.3)).toBe(Math.floor(LINEAR_INTERPOLATION_END / 3));
  })
});

describe('bounce', () => {
    it('should return 0 for the first point on the bounce curve', () => {
        expect(Math.round(bounce(0))).toBe(0);
    });

    it('should return 1 for the last point on the bounce curve', () => {
        expect(bounce(1)).toBe(1);
    });

    it('should return the correct value for the middle point on the bounce curve', () => {
        expect(bounce(0.5)).toBe(EXPECTED_BOUNCE_MIDDLE_POINT_VALUE);
    });

    it('should return the correct value for the 3/4 point on the bounce curve', () => {
        expect(bounce(0.75)).toBe(EXPECTED_BOUNCE_NEAR_END_POINT_VALUE);
    })
});