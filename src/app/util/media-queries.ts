export class MediaQueries {
  private constructor() {
  }

  static readonly XS = 'screen and (max-width: 599px)';
  static readonly SM = 'screen and (min-width: 600px) and (max-width: 959px)';
  static readonly MD = 'screen and (min-width: 960px) and (max-width: 1279px)';
  static readonly lg = 'screen and (min-width: 1280px) and (max-width: 1919px)';
  static readonly xl = 'screen and (min-width: 1920px) and (max-width: 5000px)';

  static readonly LT_SM = 'screen and (max-width: 599px)';
  static readonly LT_MD = 'screen and (max-width: 959px)';
  static readonly LT_LG = 'screen and (max-width: 1279px)';
  static readonly LT_XL = 'screen and (max-width: 1919px)';

  static readonly GT_XS = 'screen and (min-width: 600px)';
  static readonly GT_SM = 'screen and (min-width: 960px)';
  static readonly GT_MD = 'screen and (min-width: 1280px)';
  static readonly GT_LG = 'screen and (min-width: 1920px)';
}
