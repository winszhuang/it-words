import { Message } from '@/types/type'
import { getIsHighlight, getWordsData, pushWordData } from '@/utils/chrome/storage'
import { translate } from '@/utils/google-translate'
import { buildHighlightedWordEl } from '@/utils/scan-words'
import { Button } from './button'

const defaultXOffset = 40
const defaultYOffset = 20

let currentWord: string = ''

const button = new Button('儲存')

document.addEventListener('mouseup', (e) => {
  currentWord = getSectionWord()
  if (currentWord) {
    currentWord = currentWord.trim()
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
  const translationData = await translate({ text: currentWord })
  if (!translationData) {
    alert('fail to get translate data!!')
    return
  }

  await pushWordData(translationData)
  buildHighlightedWordEl(translationData)
})

chrome.runtime.onMessage.addListener(async (message: Message, sender, senderResponse) => {
  if (message.event === 'highlight-words') {
    const isHighlight = message.data
    if (isHighlight) {
      await highlightAllWords()
    } else {
      unHighlightAllWords()
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
    buildHighlightedWordEl(wordData)
  })
}

function unHighlightAllWords () {
  const nodeList = document.querySelectorAll('[data-word]')
  nodeList.forEach(node => {
    const newNode = document.createTextNode(node.textContent || node.innerHTML)

    node.parentElement?.replaceChild(newNode, node)
  })
}

init().catch(console.error)
