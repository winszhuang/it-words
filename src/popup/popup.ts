import { getWordsData, isActiveTabShouldHighlightWord, setIsHighlight } from '@/utils/chrome/storage'

const goPageButton = document.getElementById('goPage')
const exportWordButton = document.getElementById('exportWord')
const toggleHighlightCheckbox = document.getElementById('toggleHighlight') as HTMLInputElement

initCheckboxState().catch(console.error)

goPageButton?.addEventListener('click', () => goPage().catch(console.error))
exportWordButton?.addEventListener('click', () => downloadWordsJson().catch(console.error))
toggleHighlightCheckbox?.addEventListener('change', (e) => onToggleCheckbox(e).catch(console.error))

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

function download (content: string, fileName: string, contentType: string) {
  const a = document.createElement('a')
  const file = new Blob([content], { type: contentType })
  a.href = URL.createObjectURL(file)
  a.download = fileName
  a.click()
}
