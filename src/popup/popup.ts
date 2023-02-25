import { getWordsData, isActiveTabShouldHighlightWord, setIsHighlight } from '@/utils/chrome/storage'
import { Message } from '@/types/type'

const wordsArea = document.getElementById('wordsArea')
const goPageButton = document.getElementById('goPage')
const exportWordButton = document.getElementById('exportWord')
const toggleHighlightCheckbox = document.getElementById('toggleHighlight') as HTMLInputElement

initCheckboxState().catch(console.error)
renderRecentlyWords().catch(console.error)

goPageButton?.addEventListener('click', () => goPage().catch(console.error))
exportWordButton?.addEventListener('click', () => downloadWordsJson().catch(console.error))
toggleHighlightCheckbox?.addEventListener('change', (e) => onToggleCheckbox(e).catch(console.error))

chrome.runtime.onMessage.addListener((message: Message) => {
  if (message.event === 'update-words') {
    renderRecentlyWords().catch(console.error)
  }
})

async function goPage () {
  await chrome.tabs.create({ url: 'http://jzlin-blog.logdown.com/posts/154248-chrome-extension-advanced-cors' })
}

async function downloadWordsJson () {
  const words = await getWordsData()
  console.log(words)
  // 下載至本地
  download(JSON.stringify(words), `${Date.now().toString()}.json`, 'application/json')
}

async function onToggleCheckbox (e: Event) {
  // active: true 表示只取當前的tab，所以tabs會只有一個元素
  const isChecked = (e.target as any).checked
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  await setIsHighlight(tab.id!, isChecked)
}

async function initCheckboxState () {
  toggleHighlightCheckbox.checked = await isActiveTabShouldHighlightWord()
}

async function renderRecentlyWords () {
  wordsArea!.innerHTML = ''
  const ul = document.createElement('ol')
  const words = (await getWordsData()).reverse().slice(0, 10)
  words.forEach(word => {
    const li = document.createElement('li')
    li.innerText = word.text
    ul.appendChild(li)
  })
  wordsArea?.appendChild(ul)
}

function download (content: string, fileName: string, contentType: string) {
  const a = document.createElement('a')
  const file = new Blob([content], { type: contentType })
  a.href = URL.createObjectURL(file)
  a.download = fileName
  a.click()
}
