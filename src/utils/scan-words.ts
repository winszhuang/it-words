import { ElementBuilder } from './element-builder'
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
        span.addEventListener('mouseenter', (e) => showPopup(span, text, id))
        span.addEventListener('mouseleave', (e) => hidePopup(text, id))
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

async function showPopup (el: HTMLElement, text: string, id: string) {
  const translationData = await translate({ text })
  if (!translationData) {
    alert('fail to get translate data!!')
    return
  }

  const { detailed = [], result = [] } = translationData
  const resultUl = new ElementBuilder('ul')
    .style('listStyle', 'none')
    .style('fontWeight', 'bold')
    .style('fontSize', '1.2rem')
    .appendChildEach(result, (str) => {
      const li = document.createElement('li')
      li.innerText = str
      return li
    })
    .getEl()

  const detailedUl = new ElementBuilder('ul')
    .style('listStyle', 'none')
    .appendChildEach(detailed, (str) => {
      const li = document.createElement('li')
      li.innerText = str
      return li
    })
    .getEl()

  const tooltip = new ElementBuilder('div')
    .attribute('data-translate', generateDataTranslateValue(text, id))
    .style('position', 'fixed')
    .style('boxShadow', 'rgba(0, 0, 0, 0.24) 0px 3px 8px')
    .style('padding', '4px')
    .style('backgroundColor', 'white')
    .appendChild(resultUl)
    .appendChild(document.createElement('hr'))
    .appendChild(detailedUl)
    .dependsOn(document.body)
    .getEl()

  const { x, y } = getAbsoluteCoords(el)
  updateLocate(tooltip, x, y + el.getBoundingClientRect().height)

  document.addEventListener('scroll', () =>
    updateLocate(tooltip, x, y + el.getBoundingClientRect().height))
}

function hidePopup (text: string, id: string) {
  const elList = document.querySelectorAll(`[data-translate="${text} $ ${id}"]`)
  if (elList.length) {
    elList.forEach(el => {
      el.remove()
    })
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

function updateLocate (el: HTMLElement, x: number, y: number) {
  el.style.top = `${y + -1 * scrollY}px`
  el.style.left = `${x + -1 * scrollX}px`
}

function generateDataTranslateValue (text: string, id: string) {
  return `${text} $ ${id}`
}
