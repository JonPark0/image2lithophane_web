import * as THREE from 'three'

export class MeshBuilder {
  /**
   * 평면형 리소페인 메쉬 생성
   */
  buildFlatLithophane(heightMap, width, height, minThickness, maxThickness) {
    const geometry = new THREE.BufferGeometry()

    const segmentsX = heightMap.width - 1
    const segmentsY = heightMap.height - 1

    const vertices = []
    const indices = []
    const normals = []

    // 앞면 정점 생성
    for (let y = 0; y <= segmentsY; y++) {
      for (let x = 0; x <= segmentsX; x++) {
        const u = x / segmentsX
        const v = y / segmentsY

        const posX = (u - 0.5) * width
        const posY = (0.5 - v) * height

        const brightness = heightMap.data[y * heightMap.width + x]
        const depth = this.brightnessToDepth(brightness, minThickness, maxThickness)

        vertices.push(posX, posY, depth / 2)
      }
    }

    // 뒷면 정점 생성
    for (let y = 0; y <= segmentsY; y++) {
      for (let x = 0; x <= segmentsX; x++) {
        const u = x / segmentsX
        const v = y / segmentsY

        const posX = (u - 0.5) * width
        const posY = (0.5 - v) * height

        vertices.push(posX, posY, -minThickness / 2)
      }
    }

    // 앞면 인덱스
    const frontOffset = 0
    for (let y = 0; y < segmentsY; y++) {
      for (let x = 0; x < segmentsX; x++) {
        const a = frontOffset + y * (segmentsX + 1) + x
        const b = frontOffset + y * (segmentsX + 1) + x + 1
        const c = frontOffset + (y + 1) * (segmentsX + 1) + x
        const d = frontOffset + (y + 1) * (segmentsX + 1) + x + 1

        indices.push(a, b, c)
        indices.push(b, d, c)
      }
    }

    // 뒷면 인덱스
    const backOffset = (segmentsX + 1) * (segmentsY + 1)
    for (let y = 0; y < segmentsY; y++) {
      for (let x = 0; x < segmentsX; x++) {
        const a = backOffset + y * (segmentsX + 1) + x
        const b = backOffset + y * (segmentsX + 1) + x + 1
        const c = backOffset + (y + 1) * (segmentsX + 1) + x
        const d = backOffset + (y + 1) * (segmentsX + 1) + x + 1

        indices.push(a, c, b)
        indices.push(b, c, d)
      }
    }

    // 측면 인덱스 추가 (테두리)
    this.addSideIndices(indices, vertices, segmentsX, segmentsY, frontOffset, backOffset)

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setIndex(indices)
    geometry.computeVertexNormals()

    return geometry
  }

  /**
   * 원통형 리소페인 메쉬 생성
   */
  buildCylinderLithophane(heightMap, diameter, height, minThickness, maxThickness, includeTop, includeBottom) {
    const geometry = new THREE.BufferGeometry()

    const radius = diameter / 2
    const segments = heightMap.width
    const heightSegments = heightMap.height

    const vertices = []
    const indices = []

    // 외부 표면 (이미지가 매핑되는 부분)
    for (let y = 0; y <= heightSegments - 1; y++) {
      for (let x = 0; x < segments; x++) {
        const u = x / segments
        const v = y / (heightSegments - 1)

        const angle = u * Math.PI * 2
        const brightness = heightMap.data[y * heightMap.width + x]
        const thickness = this.brightnessToDepth(brightness, minThickness, maxThickness)

        const r = radius + thickness / 2

        const posX = Math.cos(angle) * r
        const posZ = Math.sin(angle) * r
        const posY = (v - 0.5) * height

        vertices.push(posX, posY, posZ)
      }
    }

    // 내부 표면
    const innerOffset = segments * heightSegments
    for (let y = 0; y <= heightSegments - 1; y++) {
      for (let x = 0; x < segments; x++) {
        const u = x / segments
        const v = y / (heightSegments - 1)

        const angle = u * Math.PI * 2
        const r = radius - minThickness / 2

        const posX = Math.cos(angle) * r
        const posZ = Math.sin(angle) * r
        const posY = (v - 0.5) * height

        vertices.push(posX, posY, posZ)
      }
    }

    // 외부 표면 인덱스
    for (let y = 0; y < heightSegments - 1; y++) {
      for (let x = 0; x < segments; x++) {
        const a = y * segments + x
        const b = y * segments + ((x + 1) % segments)
        const c = (y + 1) * segments + x
        const d = (y + 1) * segments + ((x + 1) % segments)

        indices.push(a, b, c)
        indices.push(b, d, c)
      }
    }

    // 내부 표면 인덱스
    for (let y = 0; y < heightSegments - 1; y++) {
      for (let x = 0; x < segments; x++) {
        const a = innerOffset + y * segments + x
        const b = innerOffset + y * segments + ((x + 1) % segments)
        const c = innerOffset + (y + 1) * segments + x
        const d = innerOffset + (y + 1) * segments + ((x + 1) % segments)

        indices.push(a, c, b)
        indices.push(b, c, d)
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setIndex(indices)
    geometry.computeVertexNormals()

    return geometry
  }

  /**
   * n각기둥형 리소페인 메쉬 생성
   */
  buildPrismLithophane(heightMaps, sides, radius, height, minThickness, maxThickness, includeTop, includeBottom) {
    const geometries = []

    // 각 면에 대한 평면 리소페인 생성
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2
      const nextAngle = ((i + 1) / sides) * Math.PI * 2

      // 면의 너비 계산
      const sideWidth = 2 * radius * Math.sin(Math.PI / sides)

      const faceGeometry = this.buildFlatLithophane(
        heightMaps[i],
        sideWidth,
        height,
        minThickness,
        maxThickness
      )

      // 회전 및 이동
      const matrix = new THREE.Matrix4()
      matrix.makeRotationY(angle + Math.PI / 2)
      matrix.setPosition(
        Math.cos(angle + Math.PI / sides) * radius,
        0,
        Math.sin(angle + Math.PI / sides) * radius
      )
      faceGeometry.applyMatrix4(matrix)

      geometries.push(faceGeometry)
    }

    // 모든 지오메트리 병합
    const mergedGeometry = THREE.BufferGeometryUtils ?
      THREE.BufferGeometryUtils.mergeGeometries(geometries) :
      this.mergeGeometries(geometries)

    return mergedGeometry
  }

  /**
   * 측면 인덱스 추가 (평면형)
   */
  addSideIndices(indices, vertices, segmentsX, segmentsY, frontOffset, backOffset) {
    // 좌측
    for (let y = 0; y < segmentsY; y++) {
      const a = frontOffset + y * (segmentsX + 1)
      const b = frontOffset + (y + 1) * (segmentsX + 1)
      const c = backOffset + y * (segmentsX + 1)
      const d = backOffset + (y + 1) * (segmentsX + 1)

      indices.push(a, c, b)
      indices.push(b, c, d)
    }

    // 우측
    for (let y = 0; y < segmentsY; y++) {
      const a = frontOffset + y * (segmentsX + 1) + segmentsX
      const b = frontOffset + (y + 1) * (segmentsX + 1) + segmentsX
      const c = backOffset + y * (segmentsX + 1) + segmentsX
      const d = backOffset + (y + 1) * (segmentsX + 1) + segmentsX

      indices.push(a, b, c)
      indices.push(b, d, c)
    }

    // 상단
    for (let x = 0; x < segmentsX; x++) {
      const a = frontOffset + x
      const b = frontOffset + x + 1
      const c = backOffset + x
      const d = backOffset + x + 1

      indices.push(a, b, c)
      indices.push(b, d, c)
    }

    // 하단
    for (let x = 0; x < segmentsX; x++) {
      const a = frontOffset + segmentsY * (segmentsX + 1) + x
      const b = frontOffset + segmentsY * (segmentsX + 1) + x + 1
      const c = backOffset + segmentsY * (segmentsX + 1) + x
      const d = backOffset + segmentsY * (segmentsX + 1) + x + 1

      indices.push(a, c, b)
      indices.push(b, c, d)
    }
  }

  /**
   * 밝기를 깊이로 변환
   */
  brightnessToDepth(brightness, minThickness, maxThickness) {
    const normalized = brightness / 255
    return minThickness + (1 - normalized) * (maxThickness - minThickness)
  }

  /**
   * 간단한 지오메트리 병합 (Three.js 유틸이 없을 경우)
   */
  mergeGeometries(geometries) {
    const merged = new THREE.BufferGeometry()

    let vertexCount = 0
    let indexCount = 0

    geometries.forEach(geo => {
      vertexCount += geo.attributes.position.count
      indexCount += geo.index ? geo.index.count : 0
    })

    const positions = new Float32Array(vertexCount * 3)
    const indices = new Uint32Array(indexCount)

    let posOffset = 0
    let idxOffset = 0
    let vertOffset = 0

    geometries.forEach(geo => {
      const pos = geo.attributes.position.array
      positions.set(pos, posOffset)
      posOffset += pos.length

      if (geo.index) {
        const idx = geo.index.array
        for (let i = 0; i < idx.length; i++) {
          indices[idxOffset + i] = idx[i] + vertOffset
        }
        idxOffset += idx.length
        vertOffset += geo.attributes.position.count
      }
    })

    merged.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    merged.setIndex(new THREE.BufferAttribute(indices, 1))
    merged.computeVertexNormals()

    return merged
  }
}
