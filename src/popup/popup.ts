const goPageButton = document.getElementById('goPage')
const onTimeSettingButton = document.getElementById('onTimeSetting')
const exportWordButton = document.getElementById('exportWord')

goPageButton?.addEventListener('click', (e) => {
  goPage()
})

onTimeSettingButton?.addEventListener('click', (e) => {
  console.log(e)
})

exportWordButton?.addEventListener('click', (e) => {
  chrome.runtime.sendMessage(
    {
      event: 'get-all-words'
    },
    (res) => {
      const wordList = res.data as string[]
      // 下載至本地
      download(JSON.stringify(wordList), `${Date.now().toString()}.json`, 'application/json')
    })
})

async function goPage () {
  // const url = chrome.runtime.getURL('../index.html')
  await chrome.tabs.create({ url: 'http://localhost:8080/index.html' })
}

function download (content: string, fileName: string, contentType: string) {
  const a = document.createElement('a')
  const file = new Blob([content], { type: contentType })
  a.href = URL.createObjectURL(file)
  a.download = fileName
  a.click()
}
