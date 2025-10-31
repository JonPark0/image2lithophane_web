export class TypeSelector {
  constructor(onTypeSelected) {
    this.onTypeSelected = onTypeSelected
    this.selectedType = null
    this.init()
  }

  init() {
    const buttons = document.querySelectorAll('.lithophane-type-btn')
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectType(btn.dataset.type)
        buttons.forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
      })
    })
  }

  selectType(type) {
    this.selectedType = type
    this.onTypeSelected(type)
  }
}
