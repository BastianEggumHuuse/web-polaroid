let viewfinder 	= document.getElementById("viewfinder_environment")
let snapshot 	= document.getElementById("snapshot_environment")
let stage 	= document.getElementById("stage_environment")
let front_face 	= false
const Zoom = document.getElementById("Zoom")

let environment_constraints = {
		audio: false,
		video: {
			facingMode: "environment",
			width: {ideal:4096},
			height: {ideal: 2160},
		}
	}

let user_constraints = {
		audio: false,
		video: {
			facingMode: "user", // for front facing mode
			width: {ideal:4096},
			height: {ideal: 2160},
		}
	}


// --- Camera init ---
let camera_started = false;
async function camera_init() {

	set_camera_face(true);
	camera_init = true;
}
window.onload = camera_init();

// --- Loading camera face ---
async function set_camera_face(isEnvironment)
{
	// Removing previous stream
	if (camera_started){
		// This is a bad way of doing this I think
		viewfinder.srcObject.getVideoTracks[0].stop();
	}

	try {
		// Get video stream from the navigator
		let stream = null;
		if(isEnvironment){
			stream = await navigator.mediaDevices.getUserMedia(environment_constraints);
		} else {
			stream = await navigator.mediaDevices.getUserMedia(user_constraints);
		}

		// Link video stream to the viewfinder, and play stream
		viewfinder.srcObject = stream;
		viewfinder.play();
	} catch(error) {
		document.getElementById("header").innerHTML = 'Camera does not Work';;
	}
}

// --- Switch camera face ---
let swap_lock = false;
async function swap_cam()
{
	// I'm going to assume that no-one spams this button
	if (swap_lock)
	{
		return;
	}
	swap_lock = true;

	front_face = !front_face;
	await set_camera_face(front_face);

	swap_lock = false;
	// End of critical section
}

// --- Trigger shutter flash ---
function trigger_flash() {
  const flash = document.getElementById("flash");
  flash.style.opacity = "1";
  setTimeout(() => flash.style.opacity = "0", 100);
}
function trigger_sound() {
	const audio = new Audio("back_end\Shutter.m4a");
  	audio.play();

}


// Shutter and saving functionality
async function camera_shutter() {
	
	const track = viewfinder.srcObject.getVideoTracks()[0];

	const {width: width, height:height } = track.getSettings();
	snapshot.width = width;
	snapshot.height = height;

	// Draw the image currently in the viewfinder onto the canvas
	var context = snapshot.getContext("2d");

	var context = snapshot.getContext("2d");
	
	context.drawImage(viewfinder,0,0,width,height);
	save_image(snapshot);

	//trigger_sound()
	trigger_flash()
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

function save_image(snap) {
	const dataUrl = snap.toDataURL('image/jpeg', 0.9);
	sendPhotoToPC(dataUrl);
}

// Zooming functionality

let zoomPending = false;
let zoomDirty = false;

async function zoom2() {
    if (zoomPending) { zoomDirty = true; return; }
    zoomPending = true;
    zoomDirty = false;

    const [track] = viewfinder.srcObject.getVideoTracks();
    const capabilities = track.getCapabilities();

    if (capabilities.zoom) {
        const maxZoom = capabilities.zoom.max;
        await track.applyConstraints({ advanced: [{ zoom: 1 + (maxZoom - 1) / 100 * Zoom.value }] });
    }

    zoomPending = false;
    if (zoomDirty) zoom2(); // catch the last skipped value
}