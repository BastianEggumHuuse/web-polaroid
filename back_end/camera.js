let viewfinder 	= document.getElementById("viewfinder_environment")
let snapshot 	= document.getElementById("snapshot_environment")
let stage 	= document.getElementById("stage_environment")
let front_face 	= false

let active_filter = "brightness(1.1) contrast(1.15) saturate(1.3) sepia(0.2) hue-rotate(-10deg) invert(0) blur(0px)";



const Zoom = document.getElementById("Zoom")



if (true){document.cookie = "Num_Fotos = 5; expires = Fri, 10 Jul 2026 12:00:00 ETC";
}

if (document.cookie == ""){
	document.getElementById("header").innerHTML = 'ehhaefeojfa'
	document.cookie = "Num_Fotos = 5; expires = Fri, 10 Jul 2026 12:00:00 ETC";
	}

let Num_Fotos = document.cookie.split(';')[0].substring(document.cookie.split(";")[0].length - 1);
document.getElementById("count").innerHTML = 'Gjenverende Bilder: '+Num_Fotos;

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
	camera_started = true;
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
		document.getElementById("header").innerHTML = 'Camera does not Work';
	}
	viewfinder.style.filter = active_filter
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
	await set_camera_face(!front_face);

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
let shutter_lock = false;
async function camera_shutter() {

	if(shutter_lock)
	{return;}
	shutter_lock = true;

	// Updating photo count
	if (Num_Fotos == 0) {shutter_lock = false; return;}
	Num_Fotos -= 1;
	document.getElementById("count").innerHTML = 'Gjenværende Bilder: '+Num_Fotos;
	// Updating cookie
	document.cookie = "Num_Fotos = "+Num_Fotos+"; expires = Fri, 10 Jul 2026 12:00:00 ETC"

	// Getting the current videotrack
	const track = viewfinder.srcObject.getVideoTracks()[0];
	const {width: width, height:height } = track.getSettings();
	snapshot.width = width;
	snapshot.height = height;
	// Draw the image currently in the viewfinder onto the canvas
	var context = snapshot.getContext("2d");
	
	trigger_flash()
	context.filter = active_filter
	context.drawImage(viewfinder,0,0,width,height);
	// Purposfully not awaiting this function so it doesn't lag
	save_image(snapshot);

	//set_camera_face(!front_face);

}

async function sendPhotoToPC(dataUrl) {
  const PC_UPLOAD_URL = 'https://tobias.tail3f5fea.ts.net/upload';

  const res = await fetch(PC_UPLOAD_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: dataUrl })
  });

  //const result = await res.json();
  //if (result.ok) alert(`Saved: ${result.filename}`);
}

async function save_image(snap) {
	const dataUrl = snap.toDataURL('image/jpeg', 0.9);
	await sendPhotoToPC(dataUrl);

	shutter_lock = false;
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
