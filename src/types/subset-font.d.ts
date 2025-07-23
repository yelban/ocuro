declare module 'subset-font' {
  export class Subset {
    constructor(fontBuffer: Buffer)
    subset(text: string): Promise<Buffer>
  }
}
