export function addWatermark(imageDataUrl: string): string {
  if (!imageDataUrl.startsWith('data:image')) {
    return imageDataUrl;
  }
  
  const base64Data = imageDataUrl.split(',')[1];
  if (!base64Data) {
    return imageDataUrl;
  }

  const watermarkText = "AI Generated";
  const encodedWatermark = Buffer.from(watermarkText).toString('base64');
  
  return `${imageDataUrl}#wm=${encodedWatermark}`;
}

export function createWatermarkedSvgOverlay(width: number, height: number): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        <pattern id="watermark" patternUnits="userSpaceOnUse" width="200" height="200">
          <text x="100" y="100" 
                font-family="sans-serif" 
                font-size="14" 
                fill="rgba(255,255,255,0.3)" 
                text-anchor="middle"
                transform="rotate(-45 100 100)">
            AI Generated
          </text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#watermark)"/>
    </svg>
  `;
}
