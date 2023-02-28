export function useHoverCounter (ms: number, callback: Function) {
  let timerId = 0
  let count = 0
  let isEnter = false

  function onMouseEnter () {
    if (isEnter) return
    isEnter = true
    timerId = window.setInterval(() => {
      count++
      if (count >= ms) {
        callback()
        clearInterval(timerId)
      }
    }, 1)
  }
  function onMouseLeave () {
    isEnter = false
    clearInterval(timerId)
  }

  return {
    onMouseEnter,
    onMouseLeave
  }
}
