// - Import react component
import { storageRef } from 'data/firebaseClient'

// - Interface declaration
interface FileReaderEventTarget extends EventTarget {
  result: string
}

interface FileReaderEvent extends Event {
  target: FileReaderEventTarget
  getMessage (): string
}

// - Get file Extension
const getExtension = (fileName: string) => {
  let re: RegExp = /(?:\.([^.]+))?$/
  return re.exec(fileName)![1]
}

// Converts image to canvas returns new canvas element
const convertImageToCanvas = (image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap) => {
  let canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  canvas.getContext('2d')!.drawImage(image, 0, 0)

  return canvas
}

/**
 * Upload image on the server
 * @param {file} file
 * @param {string} fileName
 */
const uploadImage = (file: any, fileName: string, progress: (percentage: number, status: boolean) => void) => {

  return new Promise<any>((resolve, reject) => {
            // Create a storage refrence
    let storegeFile = storageRef.child(`images/${fileName}`)

    // Upload file
    let task = storegeFile.put(file)
    task.then((result) => {
      resolve(result)
    }).catch((error) => {
      reject(error)
    })

            // Upload storage bar
    task.on('state_changed', (snapshot: any) => {
      let percentage: number = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      progress(percentage, true)
    }, (error) => {
      console.log('========== Upload Image ============')
      console.log(error)
      console.log('====================================')

    }, () => {
      progress(100, false)
    })
  })

}

/**
 * Constraint image size
 * @param {file} file
 * @param {number} maxWidth
 * @param {number} maxHeight
 */
const constraintImage = (file: File,fileName: string, maxWidth?: number, maxHeight?: number) => {
    // Ensure it's an image
  if (file.type.match(/image.*/)) {
        // Load the image
    let reader = new FileReader()
    reader.onload = function (readerEvent: FileReaderEvent) {
      let image = new Image()
      image.onload = function (imageEvent: Event) {

                // Resize the image
        let canvas: HTMLCanvasElement = document.createElement('canvas')
        let maxSize: number = 986// TODO : pull max size from a site config
        let width: number = image.width
        let height: number = image.height
        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height
            height = maxSize
          }
        }
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d')!.drawImage(image, 0, 0, width, height)
        let dataUrl = canvas.toDataURL()
        let resizedImage = dataURLToBlob(dataUrl)
        let evt = new CustomEvent('onSendResizedImage', { detail: {resizedImage,fileName} })
        window.dispatchEvent(evt)

      }
      image.src = readerEvent.target.result
    }
    reader.readAsDataURL(file)
  }
}

/**
 * Convert data URL to blob
 * @param {object} dataURL
 */
const dataURLToBlob = (dataURL: string) => {

  let BASE64_MARKER = 'base64,'
  if (dataURL.indexOf(BASE64_MARKER) === -1) {
    let parts = dataURL.split(',')
    let contentType = parts[0].split(':')[1]
    let raw = parts[1]

    return new Blob([raw], {type: contentType})
  }

  let parts = dataURL.split(BASE64_MARKER)
  let contentType = parts[0].split(':')[1]
  let raw = window.atob(parts[1])
  let rawLength = raw.length

  let uInt8Array = new Uint8Array(rawLength)

  for (let i = 0 ;i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i)
  }

  return new Blob([uInt8Array], {type: contentType})
}

export default {
  dataURLToBlob,
  convertImageToCanvas,
  getExtension,
  constraintImage,
  uploadImage

}
