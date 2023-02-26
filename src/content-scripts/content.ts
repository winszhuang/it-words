import { DataSetKey } from '@/enum'
import { Message } from '@/types/type'
import { getIsHighlight, getWordsData, pushWordData } from '@/utils/chrome/storage'
import { translate, TranslateResult } from '@/utils/google-translate'
import { appendHighlight } from '@/utils/scan-words'
import { Button } from './button'

const defaultXOffset = 40
const defaultYOffset = 20

let currentWord: string = ''

const button = new Button('儲存')

document.addEventListener('mouseup', (e) => {
  currentWord = getSectionWord()
  if (currentWord) {
    button.show()
    button.setPosition(
      e.clientX + defaultXOffset,
      e.clientY + window.scrollY + defaultYOffset
    )
  }
})

document.addEventListener('click', (e) => {
  currentWord = getSectionWord()
  if (!currentWord) {
    currentWord = ''
    button.hide()
  }
})

button.onClick(async () => {
  const translationData = await translate({ text: currentWord.trim().toLowerCase() })
  if (!translationData) {
    alert('fail to get translate data!!')
    return
  }

  await pushWordData(translationData)
  appendHighlight(translationData)
})

chrome.runtime.onMessage.addListener(async (message: Message, sender, senderResponse) => {
  if (message.event === 'highlight-words') {
    const isHighlight = message.data
    if (isHighlight) {
      await highlightAllWords()
    } else {
      unHighlightAllWords()
    }
  } else if (message.event === 'update-words') {
    const data = message.data as { operate: 'add' | 'delete', change: TranslateResult }
    if (data.operate === 'add') {
      console.log(`新增字彙${data.change.text}搂`)
      appendHighlight(data.change)
    } else if (data.operate === 'delete') {
      console.log(`刪除字彙${data.change.text}搂`)
      unHighlightWords(data.change.text)
    }
  }
})

function getSectionWord () {
  return window?.getSelection()?.toString() || ''
}

async function init () {
  const id = await initTabId()

  const shouldHighlightWords = await getIsHighlight(id!)
  if (shouldHighlightWords) {
    await highlightAllWords()
  } else {
    unHighlightAllWords()
  }
}

async function initTabId (): Promise<number | undefined> {
  return new Promise((resolve, reject) => {
    chrome.runtime.onMessage.addListener(callback)

    function callback (message: Message) {
      if (message.event === 'get-tab-id') {
        chrome.runtime.onMessage.removeListener(callback)
        resolve(message.data)
      }
    }
  })
}

async function highlightAllWords () {
  const words = await getWordsData()
  words.forEach((wordData) => {
    appendHighlight(wordData)
  })
}

function unHighlightAllWords () {
  const nodeList = document.querySelectorAll(`[${DataSetKey.word}]`)
  nodeList.forEach(node => {
    const newNode = document.createTextNode(node.textContent || node.innerHTML)

    node.parentElement?.replaceChild(newNode, node)
  })
}

function unHighlightWords (word: string) {
  const nodeList = document.querySelectorAll(`[${DataSetKey.word}]`)
  const matchWordList = Array.from(nodeList)
    .filter(node => node.getAttribute(DataSetKey.word)?.split(' $ ')[0] === word)
  matchWordList.forEach(node => {
    const newNode = document.createTextNode(node.textContent || node.innerHTML)

    node.parentElement?.replaceChild(newNode, node)
  })
}

init().catch(console.error)
