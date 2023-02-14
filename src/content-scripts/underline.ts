export class Underline {
  private el = document.createElement('div')

  constructor (absolute = true) {
    document.body.appendChild(this.el)
    this.el.style.position = absolute ? 'absolute' : 'relative'
    this.el.style.backgroundColor = 'red'
    this.el.style.height = '1px'
    // this.el.style.border = '1px solid black'
    this.hide()
  }

  public setPosition (x: number, y: number) {
    this.el.style.left = `${x}px`
    this.el.style.top = `${y}px`
  }

  public setWidth (width: number) {
    this.el.style.width = `${width}px`
  }

  public show () {
    this.el.style.display = 'block'
  }

  public hide () {
    this.el.style.display = 'none'
  }

  public onClick (callback: (e: MouseEvent) => void) {
    this.el.addEventListener('click', callback)
  }

  public getEl () {
    return this.el
  }
}
