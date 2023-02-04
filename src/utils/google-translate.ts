// https://github.com/lokalise/i18n-ally/blob/main/src/translators/engines/google.ts
interface TranslateOptions {
  text: string
  from?: string
  to?: string
}

export interface TranslateResult {
  text: string
  from: string
  to: string
  response: any
  error?: Error
  result?: string[]
  detailed?: string[]
}

const apiRoot = 'https://translate.googleapis.com'

export async function translate (options: TranslateOptions) {
  const {
    from = 'en',
    to = 'zh-TW'
  } = options

  try {
    const resource = await fetch(`${apiRoot}/translate_a/single?client=gtx&sl=${from}&tl=${to}&hl=zh-TW&dt=t&dt=bd&ie=UTF-8&oe=UTF-8&dj=1&source=icon&q=${encodeURI(options.text)}`)

    const json = await resource.json()

    return transform(json, options)
  } catch (error) {
    console.error((error as Error).message)
  }
}

async function transform (response: any, options: TranslateOptions) {
  const {
    text,
    to = 'auto'
  } = options

  const r: TranslateResult = {
    text,
    to,
    from: response.src,
    response
  }
  // 尝试获取详细释义
  try {
    const detailed: string[] = []
    response.dict.forEach((v: any) => {
      detailed.push(`${v.pos}：${(v.terms.slice(0, 3) || []).join(',')}`)
    })
    r.detailed = detailed
  } catch (e) {}

  // 尝试取得翻译结果
  try {
    const result: string[] = []
    response.sentences.forEach((v: any) => {
      result.push(v.trans)
    })
    r.result = result
  } catch (e) {}

  return r
}
