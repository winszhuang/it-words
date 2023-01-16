export class Dialog {
  private el = document.createElement('div')
  private containerEl = document.createElement('div')

  constructor (text: string, absolute = true) {
    document.body.appendChild(this.containerEl)

    this.containerEl.appendChild(this.el)
    this.containerEl.style.position = 'fixed'
    this.containerEl.style.width = '100vw'
    this.containerEl.style.height = '100vh'
    this.containerEl.style.display = 'flex'
    this.containerEl.style.justifyContent = 'center'
    this.containerEl.style.alignItems = 'center'

    this.el.innerHTML = text
    this.el.style.padding = '10px'
    this.el.style.border = '2px solid black'
    this.el.style.width = '350px'
    this.el.style.height = '240px'
    // this.el.style.position = absolute ? 'absolute' : 'relative'
    this.el.style.backgroundColor = 'white'
    this.hide()
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
