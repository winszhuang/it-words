import { TranslateResult } from '../google-translate'
import { getActiveTab } from './tabs'

export async function getWordsData () {
  const { words } = await chrome.storage.local.get('words')
  return words as TranslateResult[] ?? []
}

export async function setWordsData (words: TranslateResult[]) {
  await chrome.storage.local.set({ words })
}

export async function pushWordData (translationData: TranslateResult) {
  const words = await getWordsData()
  const existWord = words.find((wordData) => wordData.text === translationData.text)
  if (existWord) {
    console.warn(`word ${translationData.text} is already exist!!`)
    return
  }
  await setWordsData([...words, translationData])
}

export async function deleteWordData (text: string) {
  const words = await getWordsData()
  await setWordsData(words.filter(item => item.text !== text))
}

export async function isActiveTabShouldHighlightWord () {
  const currentTabId = (await getActiveTab()).id!
  return await getIsHighlight(currentTabId)
}

export async function setIsHighlight (tabId: number, enable: boolean) {
  await chrome.storage.local.set({ highlight: { [tabId]: enable } })
}

export async function getIsHighlight (tabId: number) {
  const { highlight } = await chrome.storage.local.get('highlight')
  const highlightData = highlight as Record<number, boolean>
  return highlightData[tabId]
}
