const RED_500_HEX = '#f44336';
const PINK_500_HEX = '#e91e63';
const PURPLE_500_HEX = '#9c27b0';
const DEEP_PURPLE_500_HEX = '#673ab7';
const INDIGO_500_HEX = '#3f51b5';
const BLUE_500_HEX = '#2196f3';
const LIGHT_BLUE_500_HEX = '#03a9f4';
const CYAN_500_HEX = '#00bcd4';
const TEAL_500_HEX = '#009688';
const GREEN_500_HEX = '#4caf50';
const LIGHT_GREEN_500_HEX = '#8bc34a';
const LIME_500_HEX = '#cddc39';
const YELLOW_500_HEX = '#ffeb3b';
const AMBER_500_HEX = '#ffc107';
const ORANGE_500_HEX = '#ff9800';
const DEEP_ORANGE_500_HEX = '#ff5722';
const BROWN_500_HEX = '#795548';
const GREY_500_HEX = '#9e9e9e';
const BLUE_GREY_500_HEX = '#607d8b';

export class ColorPalette {
  static readonly COLOR_RED = {500: {hex: RED_500_HEX, dark: true}};
  static readonly COLOR_PINK = {500: {hex: PINK_500_HEX, dark: true}};
  static readonly COLOR_PURPLE = {500: {hex: PURPLE_500_HEX, dark: true}};
  static readonly COLOR_DEEP_PURPLE = {500: {hex: DEEP_PURPLE_500_HEX, dark: true}};
  static readonly COLOR_INDIGO = {500: {hex: INDIGO_500_HEX, dark: true}};
  static readonly COLOR_BLUE = {500: {hex: BLUE_500_HEX, dark: false}};
  static readonly COLOR_LIGHT_BLUE = {500: {hex: LIGHT_BLUE_500_HEX, dark: false}};
  static readonly COLOR_CYAN = {500: {hex: CYAN_500_HEX, dark: false}};
  static readonly COLOR_TEAL = {500: {hex: TEAL_500_HEX, dark: false}};
  static readonly COLOR_GREEN = {500: {hex: GREEN_500_HEX, dark: false}};
  static readonly COLOR_LIGHT_GREEN = {500: {hex: LIGHT_GREEN_500_HEX, dark: false}};
  static readonly COLOR_LIME = {500: {hex: LIME_500_HEX, dark: false}};
  static readonly COLOR_YELLOW = {500: {hex: YELLOW_500_HEX, dark: false}};
  static readonly COLOR_AMBER = {500: {hex: AMBER_500_HEX, dark: false}};
  static readonly COLOR_ORANGE = {500: {hex: ORANGE_500_HEX, dark: false}};
  static readonly COLOR_DEEP_ORANGE = {500: {hex: DEEP_ORANGE_500_HEX, dark: false}};
  static readonly COLOR_BROWN = {500: {hex: BROWN_500_HEX, dark: true}};
  static readonly COLOR_GREY = {500: {hex: GREY_500_HEX, dark: false}};
  static readonly COLOR_BLUE_GREY = {500: {hex: BLUE_GREY_500_HEX, dark: false}};

  static COLORS_BY_HEX;

  static {
    ColorPalette.COLORS_BY_HEX = {};
    for (const propName of Object.getOwnPropertyNames(ColorPalette)) {
      if (propName.startsWith('COLOR_')) {
        const color = ColorPalette[propName];
        for (const tint of Object.getOwnPropertyNames(color)) {
          ColorPalette.COLORS_BY_HEX[color[tint].hex] = color[tint];
        }
      }
    }
  }

  static isDark(hex: string): boolean {
    const color = ColorPalette.COLORS_BY_HEX[hex];
    return color && color.dark;
  }
}
