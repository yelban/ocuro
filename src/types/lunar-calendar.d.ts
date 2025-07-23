declare module 'lunar-calendar' {
  export function solarToLunar(
    year: number,
    month: number,
    day: number
  ): {
    year: number
    month: number
    day: number
    isLeap: boolean
    zodiac: string
  }
}
