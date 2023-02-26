export function getAbsoluteCoords (element: HTMLElement) {
  let x = 0
  let y = 0
  while (element) {
    x += element.offsetLeft
    y += element.offsetTop
    element = element.offsetParent as HTMLElement
  }
  return { x, y }
}

export function generateRandomId () {
  return Math.random().toString(16).slice(2) + Date.now().toString()
}

export function getStartEndIndexListByWord (sentence: string, word: string) {
  let z: RegExpExecArray | null
  const list: Array<{ startIndex: number, endIndex: number }> = []
  const regex = new RegExp(`(?<= )${word}(?= )`, 'gm')

  while ((z = regex.exec(sentence)) !== null) {
    list.push({ startIndex: z.index, endIndex: z.index + word.length })
  }

  return list
}
