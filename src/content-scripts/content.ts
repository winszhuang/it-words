import { Message } from '@/types/type'
import { Button } from './button'
import { Dialog } from './dialog'

const defaultXOffset = 40
const defaultYOffset = 20

let currentWord: string = ''

const button = new Button('儲存')
const dialog = new Dialog('我是dialog')

document.addEventListener('dblclick', (e) => {
  currentWord = window?.getSelection()?.toString() || ''
  if (currentWord) {
    button.show()
    button.setPosition(
      e.clientX + defaultXOffset,
      e.clientY + window.scrollY + defaultYOffset
    )
  }
})

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement

  if (!currentWord) return

  // 點在button外面且當前有文字被選中
  if (!button.getEl().contains(target)) {
    button.hide()
  }
})

button.onClick(() => {
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
