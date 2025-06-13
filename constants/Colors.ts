/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// Patagonia inspired palette
const tintColorLight = '#119DA4';
const tintColorDark = '#70CDE7';

export const Colors = {
  light: {
    text: '#0A1F2F',
    background: '#F0F4F5',
    tint: tintColorLight,
    icon: '#19647E',
    tabIconDefault: '#19647E',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#E0FBFC',
    background: '#0A1F2F',
    tint: tintColorDark,
    icon: '#77A6B6',
    tabIconDefault: '#77A6B6',
    tabIconSelected: tintColorDark,
  },
};
