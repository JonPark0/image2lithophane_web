export class DimensionControls {
  constructor(onDimensionsChanged) {
    this.onDimensionsChanged = onDimensionsChanged
    this.type = null
    this.dimensions = {}
    this.container = document.getElementById('dimension-controls')
  }

  setType(type) {
    this.type = type
    this.dimensions = {}
    this.render()
  }

  render() {
    if (!this.type) return

    let html = ''

    if (this.type === 'flat') {
      html = `
        <div class="control-group">
          <label class="control-label">가로 크기 (mm)</label>
          <input type="number" id="width" class="control-input" value="100" min="10" max="300">
        </div>
        <div class="control-group">
          <label class="control-label">세로 크기 (mm)</label>
          <input type="number" id="height" class="control-input" value="100" min="10" max="300">
        </div>
        <div class="control-group">
          <label class="control-label">최소 두께 (mm)</label>
          <input type="number" id="minThickness" class="control-input" value="0.8" min="0.4" max="5" step="0.1">
        </div>
        <div class="control-group">
          <label class="control-label">최대 두께 (mm)</label>
          <input type="number" id="maxThickness" class="control-input" value="3" min="1" max="10" step="0.1">
        </div>
      `
    } else if (this.type === 'cylinder') {
      html = `
        <div class="control-group">
          <label class="control-label">지름 (mm)</label>
          <input type="number" id="diameter" class="control-input" value="80" min="20" max="200">
        </div>
        <div class="control-group">
          <label class="control-label">높이 (mm)</label>
          <input type="number" id="height" class="control-input" value="100" min="10" max="300">
        </div>
        <div class="control-group">
          <label class="control-label">최소 두께 (mm)</label>
          <input type="number" id="minThickness" class="control-input" value="0.8" min="0.4" max="5" step="0.1">
        </div>
        <div class="control-group">
          <label class="control-label">최대 두께 (mm)</label>
          <input type="number" id="maxThickness" class="control-input" value="3" min="1" max="10" step="0.1">
        </div>
      `
    } else if (this.type === 'prism') {
      html = `
        <div class="control-group">
          <label class="control-label">면의 개수 (3~8)</label>
          <input type="number" id="sides" class="control-input" value="4" min="3" max="8">
        </div>
        <div class="control-group">
          <label class="control-label">중심에서 면까지의 거리 (mm)</label>
          <input type="number" id="radius" class="control-input" value="40" min="10" max="100">
        </div>
        <div class="control-group">
          <label class="control-label">높이 (mm)</label>
          <input type="number" id="height" class="control-input" value="100" min="10" max="300">
        </div>
        <div class="control-group">
          <label class="control-label">최소 두께 (mm)</label>
          <input type="number" id="minThickness" class="control-input" value="0.8" min="0.4" max="5" step="0.1">
        </div>
        <div class="control-group">
          <label class="control-label">최대 두께 (mm)</label>
          <input type="number" id="maxThickness" class="control-input" value="3" min="1" max="10" step="0.1">
        </div>
      `
    }

    this.container.innerHTML = html

    // 이벤트 리스너 추가
    const inputs = this.container.querySelectorAll('input')
    inputs.forEach(input => {
      input.addEventListener('input', () => this.updateDimensions())
    })

    // 초기값 설정
    this.updateDimensions()
  }

  updateDimensions() {
    const inputs = this.container.querySelectorAll('input')
    inputs.forEach(input => {
      this.dimensions[input.id] = parseFloat(input.value)
    })
    this.onDimensionsChanged(this.dimensions)
  }
}
