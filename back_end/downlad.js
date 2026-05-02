async function sendPhotoToPC(dataUrl) {
  const PC_UPLOAD_URL = 'https://tobias.tail3f5fea.ts.net/';

  const res = await fetch(PC_UPLOAD_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: dataUrl })
  });

  const result = await res.json();
  if (result.ok) alert(`Saved: ${result.filename}`);
}

// Grab from your canvas and send:
const dataUrl = document.getElementById('your-canvas').toDataURL('image/jpeg', 0.9);
