import { Button } from './button'

const defaultXOffset = 40
const defaultYOffset = 20

let currentWord: string = ''

const button = new Button('儲存')

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
      data: currentWord
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
