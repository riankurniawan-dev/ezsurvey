export type WatermarkInfo = {
  projectName: string
  area: string
  item: string
  surveyor: string
  latitude?: number
  longitude?: number
  accuracy?: number
}

/**
 * Applies a watermark to an image source and returns a base64 encoded string
 */
export const addWatermarkToImage = async (
  imageSource: string | HTMLImageElement,
  info: WatermarkInfo
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      canvas.width = img.width
      canvas.height = img.height

      // Draw original image
      ctx.drawImage(img, 0, 0)

      // Configure watermark style
      const fontSize = Math.max(16, Math.floor(img.width * 0.025))
      ctx.font = `${fontSize}px Inter, sans-serif`
      
      // Draw background for text to ensure readability
      const padding = 15
      const lines = [
        `Project: ${info.projectName}`,
        `Area: ${info.area} | Item: ${info.item}`,
        `Surveyor: ${info.surveyor}`,
        info.latitude && info.longitude 
          ? `GPS: ${info.latitude.toFixed(6)}, ${info.longitude.toFixed(6)} (Acc: ${info.accuracy?.toFixed(1)}m)` 
          : 'GPS: Not Available',
        `Date: ${new Date().toLocaleString('id-ID')}`
      ]

      const lineHeight = fontSize * 1.5
      const rectHeight = (lines.length * lineHeight) + (padding * 2)
      
      // Find longest string for rect width
      let maxWidth = 0
      lines.forEach(line => {
        const metrics = ctx.measureText(line)
        if (metrics.width > maxWidth) maxWidth = metrics.width
      })
      const rectWidth = maxWidth + (padding * 2)

      // Bottom left position
      const x = 20
      const y = canvas.height - rectHeight - 20

      // Draw semi-transparent black background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
      ctx.roundRect ? ctx.roundRect(x, y, rectWidth, rectHeight, 8) : ctx.fillRect(x, y, rectWidth, rectHeight)
      ctx.fill()

      // Draw text
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      
      lines.forEach((line, index) => {
        ctx.fillText(line, x + padding, y + padding + (index * lineHeight))
      })

      // Draw HYDANT Logo/Text on bottom right
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.font = `bold ${fontSize * 1.2}px Inter, sans-serif`
      ctx.textAlign = 'right'
      ctx.textBaseline = 'bottom'
      ctx.fillText('HYDANT', canvas.width - 20, canvas.height - 20)

      resolve(canvas.toDataURL('image/jpeg', 0.9))
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image for watermarking'))
    }

    if (typeof imageSource === 'string') {
      img.src = imageSource
    } else {
      img.src = imageSource.src
    }
  })
}
