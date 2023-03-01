export class Button {
  private el = document.createElement('button')

  constructor (text: string, absolute = true) {
    document.body.appendChild(this.el)
    this.el.innerHTML = text
    this.el.style.position = absolute ? 'absolute' : 'relative'
    this.el.style.backgroundColor = 'white'
    this.el.style.border = '1px solid black'
    this.el.style.zIndex = '9999999999'
  }

  public setPosition (x: number, y: number) {
    this.el.style.left = `${x}px`
    this.el.style.top = `${y}px`
  }

  public show () {
    this.el.style.display = 'block'
  }

  public hide () {
    this.el.style.display = 'none'
  }

  public remove () {
    this.el.remove()
  }

  public onClick (callback: (e: MouseEvent) => void) {
    this.el.addEventListener('click', callback)
  }

  public getEl () {
    return this.el
  }
}
