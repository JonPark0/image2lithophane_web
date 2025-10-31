export class ImageProcessor {
  constructor() {
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
  }

  /**
   * 이미지를 처리하여 높이맵 데이터 생성
   * @param {Image} image - 원본 이미지
   * @param {number} targetWidth - 목표 너비
   * @param {number} targetHeight - 목표 높이
   * @param {string} mode - 조정 모드 (stretch, fit, cover, tile)
   * @returns {Object} { data: Uint8ClampedArray, width: number, height: number }
   */
  processImage(image, targetWidth, targetHeight, mode = 'fit') {
    const { width, height, offsetX, offsetY, sourceWidth, sourceHeight } =
      this.calculateDimensions(image, targetWidth, targetHeight, mode)

    this.canvas.width = width
    this.canvas.height = height

    // 배경을 흰색으로 채우기 (여백이 생길 경우)
    this.ctx.fillStyle = '#ffffff'
    this.ctx.fillRect(0, 0, width, height)

    if (mode === 'tile') {
      // 타일 모드
      const tilesX = Math.ceil(width / image.width)
      const tilesY = Math.ceil(height / image.height)
      for (let y = 0; y < tilesY; y++) {
        for (let x = 0; x < tilesX; x++) {
          this.ctx.drawImage(image, x * image.width, y * image.height)
        }
      }
    } else {
      // stretch, fit, cover 모드
      this.ctx.drawImage(
        image,
        0, 0, sourceWidth, sourceHeight,
        offsetX, offsetY, width - offsetX * 2, height - offsetY * 2
      )
    }

    // 이미지 데이터 가져오기
    const imageData = this.ctx.getImageData(0, 0, width, height)

    // 그레이스케일 변환 (밝기 값 계산)
    const grayscaleData = this.toGrayscale(imageData.data)

    return {
      data: grayscaleData,
      width,
      height
    }
  }

  calculateDimensions(image, targetWidth, targetHeight, mode) {
    const imgRatio = image.width / image.height
    const targetRatio = targetWidth / targetHeight

    let width = targetWidth
    let height = targetHeight
    let offsetX = 0
    let offsetY = 0
    let sourceWidth = image.width
    let sourceHeight = image.height

    if (mode === 'stretch' || mode === 'tile') {
      // 늘리기 또는 타일: 그대로 사용
      width = targetWidth
      height = targetHeight
    } else if (mode === 'fit') {
      // 맞추기: 이미지 전체가 보이도록
      if (imgRatio > targetRatio) {
        height = width / imgRatio
        offsetY = (targetHeight - height) / 2
      } else {
        width = height * imgRatio
        offsetX = (targetWidth - width) / 2
      }
    } else if (mode === 'cover') {
      // 채우기: 여백 없이 채우기
      if (imgRatio > targetRatio) {
        sourceWidth = image.height * targetRatio
        sourceHeight = image.height
        offsetX = (image.width - sourceWidth) / 2
      } else {
        sourceWidth = image.width
        sourceHeight = image.width / targetRatio
        offsetY = (image.height - sourceHeight) / 2
      }
      width = targetWidth
      height = targetHeight
      offsetX = 0
      offsetY = 0
    }

    return { width, height, offsetX, offsetY, sourceWidth, sourceHeight }
  }

  /**
   * RGB 이미지 데이터를 그레이스케일로 변환
   * @param {Uint8ClampedArray} data - RGBA 이미지 데이터
   * @returns {Uint8ClampedArray} 그레이스케일 데이터 (0-255)
   */
  toGrayscale(data) {
    const grayscale = new Uint8ClampedArray(data.length / 4)

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // 밝기 계산 (표준 luminosity 공식)
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b
      grayscale[i / 4] = brightness
    }

    return grayscale
  }

  /**
   * 밝기 값을 높이 값으로 변환
   * @param {number} brightness - 밝기 값 (0-255)
   * @param {number} minThickness - 최소 두께
   * @param {number} maxThickness - 최대 두께
   * @returns {number} 높이 값
   */
  brightnessToHeight(brightness, minThickness, maxThickness) {
    // 밝을수록 얇게, 어두울수록 두껍게
    const normalized = brightness / 255
    return minThickness + (1 - normalized) * (maxThickness - minThickness)
  }
}
