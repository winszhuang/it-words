import { translate } from './google-translate'
import { generateRandomId, getAbsoluteCoords } from './helper'

const SIGN = 'data-word'

export function buildHighlightedWordEl (text: string) {
  const textNodes = getTextNodesIn(document.body)
  text = text.toLowerCase()
  // 接著遍歷所有文字節點，看哪些節點的文字中有包含 "vue" 字樣
  for (const node of textNodes) {
    const nodeText = node.nodeValue?.toLowerCase() as string
    if (!nodeText.includes(text)) {
      continue
    }
    if (nodeText.includes('(function()')) {
      continue
    }
    let startIndex = nodeText.indexOf(text)

    try {
      while (startIndex !== -1) {
        const id = generateRandomId()
        // 如果找到了，則使用 Range 對該段文字創建一個新的節點，並把它加入到 body 的最後面
        const range = document.createRange()
        range.setStart(node, startIndex)
        range.setEnd(node, startIndex + text.length)

        const span = document.createElement('span')
        span.setAttribute(SIGN, `word:${nodeText}`)
        span.style.borderBottom = '1px solid red'
        span.addEventListener('mouseenter', (e) => showTranslate(span, text, id))
        span.addEventListener('mouseleave', (e) => hideTranslate(text, id))
        span.appendChild(range.extractContents())
        range.insertNode(span)

        // 再次查找，看是否還有其他的 "vue" 字樣
        startIndex = nodeText.indexOf(text, startIndex + 1)
      }
    } catch (error) {
      console.log(error)
      console.warn(`errorText is ${nodeText}`)
    }
  }
}

async function showTranslate (el: HTMLElement, text: string, id: string) {
  console.log(`enter ${id}`)
  const tooltip = document.createElement('div')
  tooltip.setAttribute('data-translate', `${text} $ ${id}`)
  tooltip.style.boxShadow = 'rgba(0, 0, 0, 0.24) 0px 3px 8px'
  tooltip.style.padding = '4px'
  tooltip.style.backgroundColor = 'white'

  try {
    const translationData = await translate({ text })
    if (translationData) {
      const { detailed = [], result = [] } = translationData
      const resultUl = document.createElement('ul')
      resultUl.style.listStyle = 'none'
      resultUl.style.fontWeight = 'bold'
      resultUl.style.fontSize = '1.2rem'

      result.forEach(value => {
        const li = document.createElement('li')
        li.innerText = value
        resultUl.appendChild(li)
      })
      const detailedUl = document.createElement('ul')
      detailedUl.style.listStyle = 'none'
      detailed.forEach(value => {
        const li = document.createElement('li')
        li.innerText = value
        detailedUl.appendChild(li)
      })

      tooltip.appendChild(resultUl)
      tooltip.appendChild(document.createElement('hr'))
      tooltip.appendChild(detailedUl)
    }

    // 掛載
    const { x, y } = getAbsoluteCoords(el)
    const fixedWall = document.createElement('div')
    fixedWall.style.position = 'fixed'
    fixedWall.style.zIndex = '999'
    fixedWall.style.left = `${x + -1 * scrollX}px`
    fixedWall.style.top = `${y + el.getBoundingClientRect().height + -1 * scrollY}px`
    document.body.appendChild(fixedWall)
    fixedWall.appendChild(tooltip)

    document.addEventListener('scroll', () => {
      fixedWall.style.top = `${y + el.getBoundingClientRect().height + -1 * scrollY}px`
      fixedWall.style.left = `${x + -1 * scrollX}px`
    })
  } catch (error) {
    console.log((error as Error).message)
  }
}

function hideTranslate (text: string, id: string) {
  console.log(`leave ${id}`)
  const elList = document.querySelectorAll(`[data-translate="${text} $ ${id}"]`)
  if (elList.length && elList[0].parentElement) {
    elList.forEach(el => {
      el.parentElement?.remove()
    })
  } else {
    console.warn(`cant find ${text} $ ${id} el!!`)
  }
}

function getTextNodesIn (node: Node) {
  const textNodes: Node[] = []

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
