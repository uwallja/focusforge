// theme.ts
import { vars } from "nativewind";

export interface ThemeFonts {
  heading: {
    family: string;
    weights: Record<string, string>;
  };
  body: {
    family: string;
    weights: Record<string, string>;
  };
  mono: {
    family: string;
    weights: Record<string, string>;
  };
}

export const themeFonts: ThemeFonts = {
  heading: {
    family: 'Inter',
    weights: {
      normal: 'Inter_400Regular',
      medium: 'Inter_500Medium',
      semibold: 'Inter_600SemiBold',
      bold: 'Inter_700Bold',
    },
  },
  body: {
    family: 'Inter',
    weights: {
      normal: 'Inter_400Regular',
      medium: 'Inter_500Medium',
      semibold: 'Inter_600SemiBold',
    },
  },
  mono: {
    family: 'JetBrainsMono',
    weights: {
      normal: 'JetBrainsMono_400Regular',
      medium: 'JetBrainsMono_500Medium',
    },
  },
};

// FocusForge palette — deep indigo canvas with violet + blue accents.
export const lightTheme = vars({
  "--radius": "14",

  "--background": "246 246 252",
  "--foreground": "30 27 48",

  "--card": "255 255 255",
  "--card-foreground": "30 27 48",

  "--popover": "255 255 255",
  "--popover-foreground": "30 27 48",

  "--primary": "124 58 237",
  "--primary-foreground": "255 255 255",

  "--secondary": "238 236 250",
  "--secondary-foreground": "76 29 149",

  "--muted": "238 236 250",
  "--muted-foreground": "122 120 150",

  "--accent": "59 130 246",
  "--accent-foreground": "255 255 255",

  "--destructive": "220 38 38",

  "--border": "231 230 240",
  "--input": "231 230 240",
  "--ring": "168 139 250",

  "--chart-1": "139 92 246",
  "--chart-2": "59 130 246",
  "--chart-3": "16 185 129",
  "--chart-4": "245 158 11",
  "--chart-5": "236 72 153",

  "--sidebar": "250 250 253",
  "--sidebar-foreground": "30 27 48",
  "--sidebar-primary": "124 58 237",
  "--sidebar-primary-foreground": "255 255 255",
  "--sidebar-accent": "238 236 250",
  "--sidebar-accent-foreground": "76 29 149",
  "--sidebar-border": "231 230 240",
  "--sidebar-ring": "168 139 250",
});

export const darkTheme = vars({
  "--radius": "14",

  "--background": "14 14 24",
  "--foreground": "238 237 250",

  "--card": "24 22 40",
  "--card-foreground": "238 237 250",

  "--popover": "28 25 46",
  "--popover-foreground": "238 237 250",

  "--primary": "167 139 250",
  "--primary-foreground": "22 14 45",

  "--secondary": "38 34 60",
  "--secondary-foreground": "221 214 254",

  "--muted": "38 34 60",
  "--muted-foreground": "150 145 180",

  "--accent": "96 165 250",
  "--accent-foreground": "18 26 45",

  "--destructive": "239 68 68",

  "--border": "40 36 64",
  "--input": "40 36 64",
  "--ring": "167 139 250",

  "--chart-1": "167 139 250",
  "--chart-2": "96 165 250",
  "--chart-3": "52 211 153",
  "--chart-4": "251 191 36",
  "--chart-5": "244 114 182",

  "--sidebar": "24 22 40",
  "--sidebar-foreground": "238 237 250",
  "--sidebar-primary": "167 139 250",
  "--sidebar-primary-foreground": "22 14 45",
  "--sidebar-accent": "38 34 60",
  "--sidebar-accent-foreground": "221 214 254",
  "--sidebar-border": "40 36 64",
  "--sidebar-ring": "167 139 250",
});
