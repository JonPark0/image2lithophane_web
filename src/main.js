import './styles/main.css'
import { TypeSelector } from './components/type-selector.js'
import { ImageUploader } from './components/image-uploader.js'
import { DimensionControls } from './components/dimension-controls.js'
import { PreviewViewer } from './components/preview-viewer.js'
import { LithophaneGenerator } from './core/lithophane-generator.js'
import { STLExporter } from './utils/stl-exporter.js'

class App {
  constructor() {
    this.state = {
      selectedType: null,
      images: [],
      dimensions: {},
      adjustmentMode: 'fit',
      resolution: 2,
      includeTop: false,
      includeBottom: false,
      lithophaneModel: null
    }

    this.components = {
      typeSelector: null,
      imageUploader: null,
      dimensionControls: null,
      previewViewer: null
    }

    this.init()
  }

  init() {
    // 컴포넌트 초기화
    this.components.typeSelector = new TypeSelector(this.onTypeSelected.bind(this))
    this.components.imageUploader = new ImageUploader(this.onImagesUploaded.bind(this))
    this.components.dimensionControls = new DimensionControls(this.onDimensionsChanged.bind(this))
    this.components.previewViewer = new PreviewViewer()

    // 이미지 조정 버튼 이벤트
    this.setupAdjustmentButtons()

    // 해상도 슬라이더 이벤트
    this.setupResolutionControl()

    // 추가 옵션 이벤트
    this.setupAdditionalOptions()

    // 변환 버튼 이벤트
    document.getElementById('convert-btn').addEventListener('click', () => this.onConvert())

    // 다운로드 버튼 이벤트
    document.getElementById('download-btn').addEventListener('click', () => this.onDownload())
  }

  onTypeSelected(type) {
    this.state.selectedType = type
    document.getElementById('settings-area').classList.remove('hidden')

    // 타입에 따라 이미지 업로더 설정
    const imageCount = type === 'flat' || type === 'cylinder' ? 1 : this.state.prismSides || 4
    this.components.imageUploader.setImageCount(imageCount)

    // 치수 컨트롤 업데이트
    this.components.dimensionControls.setType(type)

    // 추가 옵션 표시 여부
    if (type === 'cylinder' || type === 'prism') {
      document.getElementById('additional-options').classList.remove('hidden')
    } else {
      document.getElementById('additional-options').classList.add('hidden')
    }

    // 미리보기 및 다운로드 숨김
    document.getElementById('preview').classList.add('hidden')
    document.getElementById('download').classList.add('hidden')
  }

  onImagesUploaded(images) {
    this.state.images = images
    this.checkConvertReady()
  }

  onDimensionsChanged(dimensions) {
    this.state.dimensions = dimensions
    this.checkConvertReady()
  }

  setupAdjustmentButtons() {
    const buttons = document.querySelectorAll('.adjustment-btn')
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
        this.state.adjustmentMode = btn.dataset.mode
      })
    })

    // 기본값 설정
    buttons[1].click() // 'fit' 모드
  }

  setupResolutionControl() {
    const slider = document.getElementById('resolution-slider')
    const valueDisplay = document.getElementById('resolution-value')

    slider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value)
      this.state.resolution = value
      valueDisplay.textContent = value
    })
  }

  setupAdditionalOptions() {
    document.getElementById('include-top').addEventListener('change', (e) => {
      this.state.includeTop = e.target.checked
    })

    document.getElementById('include-bottom').addEventListener('change', (e) => {
      this.state.includeBottom = e.target.checked
    })
  }

  checkConvertReady() {
    const btn = document.getElementById('convert-btn')
    const ready = this.state.images.length > 0 && Object.keys(this.state.dimensions).length > 0
    btn.disabled = !ready
  }

  async onConvert() {
    const btn = document.getElementById('convert-btn')
    btn.disabled = true
    btn.textContent = '변환 중...'

    try {
      const generator = new LithophaneGenerator()
      this.state.lithophaneModel = await generator.generate({
        type: this.state.selectedType,
        images: this.state.images,
        dimensions: this.state.dimensions,
        adjustmentMode: this.state.adjustmentMode,
        resolution: this.state.resolution,
        includeTop: this.state.includeTop,
        includeBottom: this.state.includeBottom
      })

      // 미리보기 표시
      document.getElementById('preview').classList.remove('hidden')
      this.components.previewViewer.render(this.state.lithophaneModel)

      // 다운로드 버튼 표시
      document.getElementById('download').classList.remove('hidden')

      btn.textContent = '재변환하기'
    } catch (error) {
      console.error('변환 중 오류 발생:', error)
      alert('변환 중 오류가 발생했습니다. 다시 시도해주세요.')
      btn.textContent = '변환하기'
    } finally {
      btn.disabled = false
    }
  }

  onDownload() {
    if (!this.state.lithophaneModel) {
      alert('먼저 리소페인을 생성해주세요.')
      return
    }

    const exporter = new STLExporter()
    exporter.export(this.state.lithophaneModel, `lithophane_${this.state.selectedType}.stl`)
  }
}

// 앱 초기화
new App()
