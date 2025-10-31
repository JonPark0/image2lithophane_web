import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export class PreviewViewer {
  constructor() {
    this.container = document.getElementById('preview-container')
    this.scene = null
    this.camera = null
    this.renderer = null
    this.controls = null
    this.mesh = null
  }

  init() {
    // Scene 설정
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0xf0f0f0)

    // Camera 설정
    const width = this.container.clientWidth
    const height = this.container.clientHeight
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    this.camera.position.set(0, 0, 200)

    // Renderer 설정
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.container.innerHTML = ''
    this.container.appendChild(this.renderer.domElement)

    // Controls 설정
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05

    // 조명 설정
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 10, 5)
    this.scene.add(directionalLight)

    // 그리드 헬퍼
    const gridHelper = new THREE.GridHelper(200, 20, 0x888888, 0xcccccc)
    this.scene.add(gridHelper)

    // 리사이즈 이벤트
    window.addEventListener('resize', () => this.onResize())

    // 애니메이션 시작
    this.animate()
  }

  render(geometry) {
    if (!this.renderer) {
      this.init()
    }

    // 기존 메쉬 제거
    if (this.mesh) {
      this.scene.remove(this.mesh)
    }

    // 새 메쉬 추가
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      flatShading: false
    })

    this.mesh = new THREE.Mesh(geometry, material)
    this.scene.add(this.mesh)

    // 카메라 위치 조정 (모델 크기에 따라)
    const box = new THREE.Box3().setFromObject(this.mesh)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())

    const maxDim = Math.max(size.x, size.y, size.z)
    const fov = this.camera.fov * (Math.PI / 180)
    let cameraZ = Math.abs(maxDim / Math.sin(fov / 2)) * 1.5

    this.camera.position.set(cameraZ, cameraZ * 0.5, cameraZ)
    this.camera.lookAt(center)
    this.controls.target.copy(center)
  }

  animate() {
    requestAnimationFrame(() => this.animate())
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }

  onResize() {
    const width = this.container.clientWidth
    const height = this.container.clientHeight

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(width, height)
  }
}
