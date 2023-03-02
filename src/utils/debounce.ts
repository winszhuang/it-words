export function debounce (timeout: number, callback: Function) {
  let timeoutID = 0
  return (event: any) => {
    clearTimeout(timeoutID)
    timeoutID = window.setTimeout(() => callback(event), timeout)
  }
}
