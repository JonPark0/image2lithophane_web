import { ImageProcessor } from './image-processor.js'
import { MeshBuilder } from './mesh-builder.js'

export class LithophaneGenerator {
  constructor() {
    this.imageProcessor = new ImageProcessor()
    this.meshBuilder = new MeshBuilder()
  }

  /**
   * 리소페인 생성
   * @param {Object} options - 생성 옵션
   * @returns {THREE.BufferGeometry} 생성된 3D 지오메트리
   */
  async generate(options) {
    const { type, images, dimensions, adjustmentMode, resolution, includeTop, includeBottom } = options

    if (type === 'flat') {
      return this.generateFlat(images[0], dimensions, adjustmentMode, resolution)
    } else if (type === 'cylinder') {
      return this.generateCylinder(images[0], dimensions, adjustmentMode, resolution, includeTop, includeBottom)
    } else if (type === 'prism') {
      return this.generatePrism(images, dimensions, adjustmentMode, resolution, includeTop, includeBottom)
    }

    throw new Error('Unknown lithophane type')
  }

  /**
   * 평면형 리소페인 생성
   */
  generateFlat(image, dimensions, adjustmentMode, resolution = 2) {
    const { width, height, minThickness, maxThickness } = dimensions

    // 해상도 설정 (mm당 픽셀 수)
    const targetWidth = Math.floor(width * resolution)
    const targetHeight = Math.floor(height * resolution)

    // 이미지 처리
    const heightMap = this.imageProcessor.processImage(
      image,
      targetWidth,
      targetHeight,
      adjustmentMode
    )

    // 메쉬 생성
    return this.meshBuilder.buildFlatLithophane(
      heightMap,
      width,
      height,
      minThickness,
      maxThickness
    )
  }

  /**
   * 원통형 리소페인 생성
   */
  generateCylinder(image, dimensions, adjustmentMode, resolution = 2, includeTop, includeBottom) {
    const { diameter, height, minThickness, maxThickness } = dimensions

    // 해상도 설정
    const circumference = Math.PI * diameter
    const targetWidth = Math.floor(circumference * resolution)
    const targetHeight = Math.floor(height * resolution)

    // 이미지 처리
    const heightMap = this.imageProcessor.processImage(
      image,
      targetWidth,
      targetHeight,
      adjustmentMode
    )

    // 메쉬 생성
    return this.meshBuilder.buildCylinderLithophane(
      heightMap,
      diameter,
      height,
      minThickness,
      maxThickness,
      includeTop,
      includeBottom
    )
  }

  /**
   * n각기둥형 리소페인 생성
   */
  generatePrism(images, dimensions, adjustmentMode, resolution = 2, includeTop, includeBottom) {
    const { sides, radius, height, minThickness, maxThickness } = dimensions

    // 각 면의 너비 계산
    const sideWidth = 2 * radius * Math.sin(Math.PI / sides)

    // 해상도 설정
    const targetWidth = Math.floor(sideWidth * resolution)
    const targetHeight = Math.floor(height * resolution)

    // 각 이미지 처리
    const heightMaps = images.slice(0, sides).map(image =>
      this.imageProcessor.processImage(
        image,
        targetWidth,
        targetHeight,
        adjustmentMode
      )
    )

    // 메쉬 생성
    return this.meshBuilder.buildPrismLithophane(
      heightMaps,
      sides,
      radius,
      height,
      minThickness,
      maxThickness,
      includeTop,
      includeBottom
    )
  }
}
