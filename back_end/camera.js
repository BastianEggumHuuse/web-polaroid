let viewfinder = document.getElementById("viewfinder")
let snapshot = document.getElementById("snapshot")

async function camera_init() {
	// Declare video stream
	let stream = null

	try {
		// Get video stream from the navigator
		stream = await navigator.mediaDevices.getUserMedia({video:true, audio:false});

		// Link video stream to the viewfinder, and play stream
		viewfinder.srcObject = stream;
		viewfinder.play();
	} catch(error) {
		document.getElementById("header").innerHTML = "Error starting camera..";
	}
}

async function camera_shutter() {

	// Draw the image currently in the viewfinder onto the canvas
	var context = snapshot.getContext("2d");
	context.drawImage(viewfinder,0,0,640,480);

	save_image();
}

async function sendPhotoToPC(dataUrl) {
  const PC_UPLOAD_URL = 'https://tobias.tail3f5fea.ts.net/upload';

  const res = await fetch(PC_UPLOAD_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: dataUrl })
  });

  const result = await res.json();
  if (result.ok) alert(`Saved: ${result.filename}`);
}


function save_image() {
	const dataUrl = snapshot.toDataURL('image/jpeg', 0.9);
	sendPhotoToPC(dataUrl);
}
