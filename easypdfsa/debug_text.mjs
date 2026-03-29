// Debug script: extract text positions and canvas bounds
const pdfjsLib = await import('pdfjs-dist');
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const response = await fetch('/test.pdf');
const data = await response.arrayBuffer();
const pdf = await pdfjsLib.getDocument({ data }).promise;
const page = await pdf.getPage(1);

const baseViewport = page.getViewport({ scale: 1 });
console.log('Base viewport:', baseViewport.width, 'x', baseViewport.height);

const scale = 0.38; // approximate scale from screenshot
const viewport = page.getViewport({ scale });
console.log('Scaled viewport:', viewport.width, 'x', viewport.height);

const textContent = await page.getTextContent();
for (const item of textContent.items.slice(0, 5)) {
  if (!('str' in item)) continue;
  const tx = item.transform;
  console.log(`Text: "${item.str}" | transform: [${tx.join(',')}] | width: ${item.width} | height: ${item.height}`);
  
  // Using our formula
  const pdfX = tx[4];
  const pdfY = tx[5];
  const pixelX = pdfX * scale;
  const pixelY = viewport.height - (pdfY * scale);
  console.log(`  -> pixel: (${pixelX.toFixed(1)}, ${pixelY.toFixed(1)})`);
}
