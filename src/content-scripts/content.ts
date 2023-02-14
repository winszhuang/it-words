import { Message } from '@/types/type'
import { buildHighlightedWordEl } from '@/utils/scan-words'
import { Button } from './button'
import { Dialog } from './dialog'
import { TranslatePopup } from './translate-popup'

// addTailwindCssInThisWeb()

const defaultXOffset = 40
const defaultYOffset = 20

let currentWord: string = ''

const button = new Button('儲存')
const dialog = new Dialog('我是dialog')

const translatePopup = new TranslatePopup(document.body)

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

button.onClick(() => {
  translatePopup.show()
  buildHighlightedWordEl(currentWord.trim())
  console.log('123')
  chrome.runtime.sendMessage(
    {
      event: 'add-word',
      data: currentWord.trim()
    },
    (res) => {
      if (res.success) {
        console.log('新增單字成功')
        console.log(res.data)
        button.hide()
        currentWord = ''
      }
    })
})

chrome.runtime.onMessage.addListener((message: Message, sender, senderResponse) => {
  console.log(message)
  switch (message.event) {
    case 'show-option-dialog':
      if (message.data) {
        dialog.show()
        console.log('dialog顯示瞜')
      } else {
        dialog.hide()
      }
      break
    default:
  }
  // 此處資料將會在瀏覽器關閉後消失
  // 可以在自己儲存至某個資料庫裏面(自己寫api)
})

function getSectionWord () {
  return window?.getSelection()?.toString() || ''
}
