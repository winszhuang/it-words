// 首先把頁面中所有的文字節點全部抓出來
const textNodes = getTextNodesIn(document.body)
const wordsArea = document.createElement('div')
document.body.appendChild(wordsArea)
wordsArea.style.position = 'absolute'

export function buildHighlightedWordEl (text: string) {
  text = text.toLowerCase()
  // 接著遍歷所有文字節點，看哪些節點的文字中有包含 "vue" 字樣
  for (const node of textNodes) {
    const nodeText = node.nodeValue?.toLowerCase() as string
    if (!nodeText.includes(text)) {
      continue
    }
    console.log(nodeText)
    if (nodeText.includes('(function()')) {
      continue
    }
    let startIndex = nodeText.indexOf(text)

    while (startIndex !== -1) {
    // 如果找到了，則使用 Range 對該段文字創建一個新的節點，並把它加入到 body 的最後面
      const range = document.createRange()
      range.setStart(node, startIndex)
      range.setEnd(node, startIndex + text.length)
      const span = document.createElement('span')
      // span.style.backgroundColor = 'yellow'
      span.appendChild(range.extractContents())
      range.insertNode(span)

      const { x, y } = getAbsoluteCoords(span)
      // const { width, bottom, left, height } = range.getBoundingClientRect()
      const div = document.createElement('div')
      // div.style.width = `${width}px`
      div.style.bottom = `${y}px`
      div.style.left = `${x}px`
      div.style.position = 'absolute'
      div.style.backgroundColor = 'red'
      // div.style.height = `${height}px`
      div.setAttribute('data-word-id', `word-${nodeText}`)
      document.body.appendChild(div)

      // 再次查找，看是否還有其他的 "vue" 字樣
      startIndex = nodeText.indexOf(text, startIndex + 1)
    }
  }
}
// export function buildHighlightedWordEl (text: string) {
//   for (const node of textNodes) {
//     const nodeText = node.nodeValue
//     let startIndex = nodeText.indexOf(text)

//     while (startIndex !== -1) {
//       // 如果找到了，則使用 Range 對該段文字創建一個新的節點，並把它加入到 body 的最後面
//       const range = document.createRange()
//       range.setStart(node, startIndex)
//       range.setEnd(node, startIndex + text.length)
//       const span = document.createElement('span')
//       span.style.backgroundColor = 'yellow'
//       span.appendChild(range.extractContents())
//       range.insertNode(span)

//       // 再次查找，看是否還有其他的 "vue" 字樣
//       startIndex = nodeText.indexOf(text, startIndex + 1)
//     }
//   }
// }

function getTextNodesIn (node: Node) {
  const textNodes: Node[] = []

  console.log(node.nodeName)

  if (node.nodeName === 'STYLE' || node.nodeName === 'NOSCRIPT') {
    // nothing
  } else if (node.nodeType === 3) {
    textNodes.push(node)
  } else if (node.nodeType === 1) {
    for (const child of node.childNodes) {
      textNodes.push(...getTextNodesIn(child))
    }
  }

  return textNodes
}

function getAbsoluteCoords (element: HTMLElement) {
  let x = 0
  let y = 0
  while (element) {
    x += element.offsetLeft
    y += element.offsetTop
    element = element.offsetParent as HTMLElement
  }
  return { x, y }
}
