
declare const pdfjsLib: any;

export const processPdf = async (file: File): Promise<{base64: string, mimeType: string}[]> => {
  if (typeof pdfjsLib === 'undefined') {
    throw new Error('PDF.js library is not loaded.');
  }

  const fileReader = new FileReader();

  return new Promise((resolve, reject) => {
    fileReader.onload = async (event) => {
      if (!event.target?.result) {
        return reject(new Error('Failed to read PDF file.'));
      }
      
      const typedarray = new Uint8Array(event.target.result as ArrayBuffer);
      const pdf = await pdfjsLib.getDocument(typedarray).promise;
      const numPages = pdf.numPages;
      const images: {base64: string, mimeType: string}[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            const dataUrl = canvas.toDataURL('image/jpeg');
            images.push({
                base64: dataUrl.split(',')[1],
                mimeType: 'image/jpeg'
            });
        }
      }
      resolve(images);
    };

    fileReader.onerror = (error) => {
      reject(error);
    };

    fileReader.readAsArrayBuffer(file);
  });
};
