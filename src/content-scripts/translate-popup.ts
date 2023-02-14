export class TranslatePopup {
  private el: HTMLElement
  private data = {
    title: 'word',
    content: 'translate word'
  }

  constructor (parentEl: HTMLElement, defaultShow = false) {
    this.el = document.createElement('div')
    parentEl.appendChild(this.el)
    this.render()
    defaultShow ? this.show() : this.hide()
  }

  public show () {
    this.el.style.display = 'block'
  }

  public hide () {
    this.el.style.display = 'none'
  }

  private render () {
    this.el.innerHTML = `
    <div class="fixed top-0 left-0 h-screen w-screen flex items-center justify-center">
      <div class="min-w-[250px] shadow-lg p-4 space-y-1 text-sm">
        <h2 class="text-lg">
          ${this.data.title}
        </h2>
        <div>
          ${this.data.content}
        </div>
      </div>
    </div>
  `
  }

  updateData (data: typeof this.data) {
    this.data = data
    this.render()
  }
}
