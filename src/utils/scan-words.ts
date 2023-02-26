import { DataSetKey } from '@/enum'
import { deleteWordData } from './chrome/storage'
import { ElementBuilder } from './element-builder'
import { TranslateResult } from './google-translate'
import { generateRandomId, getAbsoluteCoords, getStartEndIndexListByWord } from './helper'

interface HoverOptions {
  /** 翻譯字卡 */
  translate?: boolean
  /** 畫紅線單字 */
  word?: boolean
}

/** 公差。確保說滑鼠從下划紅線移動到翻譯字卡可以順利讓翻譯字卡不會消失 */
const TOLERANCE = 5
const hoverState: Record<string, HoverOptions> = {}

export function appendHighlight (data: TranslateResult) {
  let { text } = data
  const textNodes = getTextNodesIn(document.body)
  text = text.toLowerCase()
  // 接著遍歷所有文字節點，看哪些節點的文字中有包含 "vue" 字樣
  for (const node of textNodes) {
    const nodeText = node.nodeValue?.toLowerCase() as string
    if (!nodeText.includes(text)) continue

    const startEndIndexList = getStartEndIndexListByWord(nodeText, text)
    startEndIndexList.forEach(o => {
      const id = generateRandomId()
      const range = document.createRange()
      range.setStart(node, o.startIndex)
      range.setEnd(node, o.endIndex)

      const span = document.createElement('span')
      span.setAttribute(DataSetKey.word, generateDataTranslateValue(text, id))
      span.style.borderBottom = '1px solid red'
      span.addEventListener('mouseenter', () => {
        updateHoverState(id, { word: true })
        showTooltip(span, data, id)
      })
      span.addEventListener('mouseleave', (e) => {
        updateHoverState(id, { word: false })
        hideTooltip(text, id)
      })
      span.appendChild(range.extractContents())
      range.insertNode(span)
    })
  }
}

async function showTooltip (el: HTMLElement, translationData: TranslateResult, id: string) {
  const { detailed = [], result = [], text } = translationData

  const existElList = document.querySelectorAll(`[${DataSetKey.translate}="${text} $ ${id}"]`)
  if (existElList.length) {
    return
  }

  const deleteWordButton = new ElementBuilder('button')
    .attribute(DataSetKey.translateDelete, id)
    .text('刪除')
    .getEl()

  const resultUl = new ElementBuilder('ul')
    .style('listStyle', 'none')
    .style('fontWeight', 'bold')
    .style('fontSize', '1.2rem')
    .style('margin', '0')
    .style('padding', '0')
    .appendChildEach(result, (str) => {
      const li = document.createElement('li')
      li.innerText = str
      return li
    })
    .getEl()

  const detailedUl = new ElementBuilder('ul')
    .style('listStyle', 'none')
    .style('margin', '0')
    .style('padding', '0')
    .appendChildEach(detailed, (str) => {
      const li = document.createElement('li')
      li.innerText = str
      return li
    })
    .getEl()

  const tooltip = new ElementBuilder('div')
    .style('boxShadow', 'rgba(0, 0, 0, 0.24) 0px 3px 8px')
    .style('padding', '4px')
    .style('backgroundColor', 'white')
    .appendChild(resultUl)
    .appendChild(document.createElement('hr'))
    .appendChild(detailedUl)
    .appendChild(document.createElement('hr'))
    .appendChild(deleteWordButton)
    .getEl()

  const tooltipContainer = new ElementBuilder('div')
    .attribute(DataSetKey.translate, generateDataTranslateValue(text, id))
    .style('position', 'fixed')
    .style('paddingTop', `${TOLERANCE}px`)
    .dependsOn(document.body)
    .appendChild(tooltip)
    .getEl()

  tooltipContainer.addEventListener('mouseenter', () => {
    updateHoverState(id, { translate: true })
  })
  tooltipContainer.addEventListener('mouseleave', () => {
    updateHoverState(id, { translate: false })
    hideTooltip(text, id)
  })
  deleteWordButton.addEventListener('click', () => {
    deleteWordData(text)
  })

  const { x, y } = getAbsoluteCoords(el)
  // 讓高度減掉公差，確保滑鼠還沒移出紅線單字前可以正常過度到翻譯字卡
  updateLocate(tooltipContainer, x, y + el.getBoundingClientRect().height - TOLERANCE)

  document.addEventListener('scroll', () =>
    updateLocate(tooltipContainer, x, y + el.getBoundingClientRect().height - TOLERANCE))
}

function hideTooltip (text: string, id: string) {
  const elList = document.querySelectorAll(`[${DataSetKey.translate}="${text} $ ${id}"]`)
  if (!elList.length) return

  const shouldNotBeHidden = hoverState[id]?.translate || hoverState[id]?.word
  if (!shouldNotBeHidden) {
    elList.forEach((el) => {
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

function updateHoverState (id: string, options: HoverOptions) {
  if (!hoverState[id]) {
    hoverState[id] = {}
  }

  Object.assign(hoverState[id], options)
}

function generateDataTranslateValue (text: string, id: string) {
  return `${text} $ ${id}`
}
