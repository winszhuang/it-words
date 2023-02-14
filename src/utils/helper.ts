export function getAbsoluteCoords (element: HTMLElement) {
  let x = 0
  let y = 0
  while (element) {
    x += element.offsetLeft
    y += element.offsetTop
    element = element.offsetParent as HTMLElement
  }
  return { x, y }
}

export function generateRandomId () {
  return Math.random().toString(16).slice(2) + Date.now().toString()
}
