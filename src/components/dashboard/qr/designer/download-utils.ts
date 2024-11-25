import html2canvas from 'html2canvas';
import { generateUUID } from '@/lib/generate-uuid';

export const downloadQRCode = async (
  qrRef: HTMLDivElement | null,
  format: 'svg' | 'png',
  filename: string = 'qr-code'
) => {
  return new Promise<boolean>(async (resolve, reject) => {
    if (!qrRef) {
      reject(new Error('QR code reference not found'));
      return;
    }

    try {
      const uuid = generateUUID();
      const fullFilename = `${filename}-${uuid}`;
      const container = qrRef;
      
      if (format === 'png') {
        const canvas = await html2canvas(container as HTMLElement, {
          scale: 3,
          backgroundColor: null,
          logging: false,
          useCORS: true,
          allowTaint: true,
        });

        const link = document.createElement('a');
        link.download = `${fullFilename}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        resolve(true);
      } else {
        const canvas = container.querySelector('canvas');
        if (!canvas) {
          throw new Error('Canvas element not found');
        }

        // Convert canvas to base64 PNG with proper formatting
        const canvasData = canvas.toDataURL('image/png').replace(/^data:image\/[^;]+;base64,/, '');
        
        // Create SVG with encoded image data
        let svgString = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
          <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            xmlns:xlink="http://www.w3.org/1999/xlink"
            width="${canvas.width}" 
            height="${canvas.height}"
            viewBox="0 0 ${canvas.width} ${canvas.height}"
            version="1.1"
          >
            <defs>
              <style type="text/css">
                .qr-wrapper { width: 100%; height: 100%; }
                .qr-image { width: 100%; height: 100%; image-rendering: pixelated; }
              </style>
            </defs>
            <g class="qr-wrapper">
              <image 
                class="qr-image"
                width="${canvas.width}" 
                height="${canvas.height}" 
                xlink:href="data:image/png;base64,${canvasData}"
              />
            </g>`;

        // Add logo if it exists
        const logoImg = container.querySelector('.logo-wrapper img') as HTMLImageElement;
        if (logoImg) {
          const logoWrapper = logoImg.parentElement;
          if (logoWrapper) {
            const rect = logoWrapper.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            // Calculate relative position
            const x = ((rect.left - containerRect.left) / containerRect.width) * canvas.width;
            const y = ((rect.top - containerRect.top) / containerRect.height) * canvas.height;
            const width = (rect.width / containerRect.width) * canvas.width;
            const height = (rect.height / containerRect.height) * canvas.height;

            // Convert logo to base64
            const logoCanvas = document.createElement('canvas');
            logoCanvas.width = logoImg.naturalWidth;
            logoCanvas.height = logoImg.naturalHeight;
            const ctx = logoCanvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(logoImg, 0, 0);
              const logoData = logoCanvas.toDataURL('image/png').replace(/^data:image\/[^;]+;base64,/, '');
              
              svgString += `
                <g class="logo-wrapper">
                  <image
                    x="${x}"
                    y="${y}"
                    width="${width}"
                    height="${height}"
                    xlink:href="data:image/png;base64,${logoData}"
                  />
                </g>`;
            }
          }
        }

        svgString += '</svg>';

        // Create and trigger download
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fullFilename}.svg`;
        link.click();
        URL.revokeObjectURL(url);
        resolve(true);
      }
    } catch (error) {
      console.error('Download processing error:', error);
      reject(error);
    }
  });
};