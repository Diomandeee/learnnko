import html2canvas from 'html2canvas';
import { generateUUID } from '@/lib/generate-uuid';

export const downloadQRCode = async (
  qrRef: HTMLDivElement | null,
  format: 'svg' | 'png',
  filename: string = 'qr-code'
) => {
  return new Promise(async (resolve, reject) => {
    if (!qrRef) {
      reject(new Error('QR code reference not found'));
      return;
    }

    try {
      const uuid = generateUUID();
      const fullFilename = `${filename}-${uuid}`;
      
      // Get the container with all styles
      const container = qrRef;
      
      if (format === 'png') {
        // For PNG, capture the entire styled container
        const canvas = await html2canvas(container as HTMLElement, {
          scale: 3,
          backgroundColor: null,
          logging: false,
          useCORS: true,
          allowTaint: true,
          onclone: () => {
            // Any additional processing of cloned document if needed
            console.log('Cloned document ready for capture');
          }
        });

        const link = document.createElement('a');
        link.download = `${fullFilename}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        resolve(true);
      } else {
        // For SVG, create a new SVG containing both QR code and styling
        const canvas = container.querySelector('canvas');
        if (!canvas) {
          throw new Error('Canvas element not found');
        }

        // Get the canvas data
        const canvasData = canvas.toDataURL('image/png');
        
        // Create a new SVG
        let svgString = `
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="${canvas.width}" 
            height="${canvas.height}"
            viewBox="0 0 ${canvas.width} ${canvas.height}"
          >
            <style>
              .qr-wrapper {
                width: 100%;
                height: 100%;
              }
              .qr-image {
                width: 100%;
                height: 100%;
                image-rendering: pixelated;
              }
            </style>
            <g class="qr-wrapper">
              <image 
                class="qr-image"
                width="100%" 
                height="100%" 
                href="${canvasData}"
                preserveAspectRatio="none"
              />
            </g>
        `;

        // Add logo if available
        const logoImg = container.querySelector('.logo-wrapper img') as HTMLImageElement;
        if (logoImg) {
          const logoStyles = window.getComputedStyle(logoImg);
          const logoWrapper = logoImg.parentElement;
          const wrapperStyles = logoWrapper ? window.getComputedStyle(logoWrapper) : null;

          svgString += `
            <g class="logo-wrapper" transform="${wrapperStyles?.transform || ''}">
              <image
                x="${wrapperStyles?.left || '0'}"
                y="${wrapperStyles?.top || '0'}"
                width="${logoStyles.width}"
                height="${logoStyles.height}"
                style="
                  opacity: ${logoStyles.opacity};
                  mix-blend-mode: ${logoStyles.mixBlendMode};
                  filter: ${logoStyles.filter};
                  border-radius: ${logoStyles.borderRadius};
                  ${logoStyles.backgroundColor !== 'transparent' ? `background-color: ${logoStyles.backgroundColor};` : ''}
                "
                href="${logoImg.src}"
              />
            </g>
          `;
        }

        svgString += '</svg>';

        // Create and download the SVG file
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const link = document.createElement('a');
        link.href = svgUrl;
        link.download = `${fullFilename}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(svgUrl);
        resolve(true);
      }
    } catch (error) {
      console.error('Download processing error:', error);
      reject(error);
    }
  });
};
