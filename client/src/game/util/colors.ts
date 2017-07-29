type Color = number

interface IColor {
  light: Color,
  medium: Color,
  dark: Color
}

export const insideBackground: IColor = {
  light: 0xD3DFB8,
  medium: 0xD3DFB8,
  dark: 0xD3DFB8,
}

export const character: IColor = {
  light: 0x161116,
  medium: 0x161116,
  dark: 0x161116,
}

export const sun: IColor = {
  light: 0xF2E86D,
  medium: 0xF2E86D,
  dark: 0xF2E86D,
}

export const outsideBackground: IColor = {
  light: 0x45BEB7,
  medium: 0x45BEB7,
  dark: 0x45BEB7,
}

export const machine: IColor = {
  light: 0x815655,
  medium: 0x815655,
  dark: 0x815655,
}

export const platform: IColor = {
  light: 0x438B60,
  medium: 0x438B60,
  dark: 0x438B60,
}

