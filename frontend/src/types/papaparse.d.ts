declare module 'papaparse' {
  interface ParseResult<T> {
    data: T[]
    errors: any[]
    meta: any
  }

  interface UnparseConfig {
    quotes?: boolean | 'strings'
    delimiter?: string
    newline?: string
    header?: boolean
    columns?: string[]
    skipEmptyLines?: boolean | 'greedy'
    quoteChar?: string
    escapeChar?: string
    trimHeaders?: boolean
    transform?: (value: string, field: string) => string
  }

  export function parse<T>(csv: string, config?: any): ParseResult<T>
  export function unparse(data: any, config?: UnparseConfig): string

  const Papa: {
    parse: typeof parse
    unparse: typeof unparse
  }

  export default Papa
}
