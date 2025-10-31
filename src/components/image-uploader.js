export class ImageUploader {
  constructor(onImagesUploaded) {
    this.onImagesUploaded = onImagesUploaded
    this.images = []
    this.imageCount = 1
    this.container = document.getElementById('upload-container')
  }

  setImageCount(count) {
    this.imageCount = count
    this.images = []
    this.render()
  }

  render() {
    if (this.imageCount === 1) {
      this.container.innerHTML = `
        <div class="space-y-4">
          <input type="file" id="image-input-0" accept="image/*" class="hidden">
          <label for="image-input-0" class="cursor-pointer inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
            이미지 선택
          </label>
          <div id="preview-0" class="mt-4"></div>
        </div>
      `
    } else {
      const inputs = Array.from({ length: this.imageCount }, (_, i) => `
        <div class="control-group">
          <label class="control-label">면 ${i + 1} 이미지</label>
          <input type="file" id="image-input-${i}" accept="image/*" class="control-input">
          <div id="preview-${i}" class="mt-2"></div>
        </div>
      `).join('')

      this.container.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">${inputs}</div>`
    }

    // 이벤트 리스너 추가
    for (let i = 0; i < this.imageCount; i++) {
      const input = document.getElementById(`image-input-${i}`)
      input.addEventListener('change', (e) => this.handleImageUpload(e, i))
    }
  }

  handleImageUpload(event, index) {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        this.images[index] = img
        this.showPreview(index, e.target.result)

        // 모든 이미지가 업로드되었는지 확인
        if (this.images.filter(Boolean).length === this.imageCount) {
          this.onImagesUploaded(this.images)
        }
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  }

  showPreview(index, src) {
    const preview = document.getElementById(`preview-${index}`)
    preview.innerHTML = `
      <img src="${src}" alt="Preview" class="max-w-full h-32 object-contain border rounded">
    `
  }
}
