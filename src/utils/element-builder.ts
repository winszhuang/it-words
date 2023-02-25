type CSSStyleDeclarationEx = Omit<CSSStyleDeclaration, 'length' | 'parentRule'>

export class ElementBuilder {
  private el: HTMLElement

  // eslint-disable-next-line no-undef
  constructor (tagName: keyof HTMLElementTagNameMap) {
    this.el = document.createElement(tagName)
  }

  attribute (qualifiedName: string, value: string) {
    this.el.setAttribute(qualifiedName, value)
    return this
  }

  style (styleName: keyof CSSStyleDeclarationEx, value: string) {
    this.el.style[styleName] = String(value) as any
    return this
  }

  text (text: string) {
    this.el.innerText = text
    return this
  }

  dependsOn (el: HTMLElement) {
    el.appendChild(this.el)
    return this
  }

  appendChild<T extends Node> (node: T) {
    this.el.appendChild(node)
    return this
  }

  appendChildEach<T extends Node, A> (list: A[], callback: (value: A) => T) {
    for (const el of list) {
      const toBeAppendEl = callback(el)
      this.el.appendChild(toBeAppendEl)
    }
    return this
  }

  getEl () {
    return this.el
  }
}
