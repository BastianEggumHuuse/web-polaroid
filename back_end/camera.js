let viewfinder 	= document.getElementById("viewfinder_environment")
let snapshot 	= document.getElementById("snapshot_environment")
let stage 	= document.getElementById("stage_environment")
let front_face 	= false

let active_filter = "contrast(1.5) saturate(2.5) sepia(0.5) brightness(0.9)";

const Zoom = document.getElementById("Zoom")
// Initializing the site
if (true){site_init();}
if (document.cookie == ""){site_init();}
function site_init(){
	document.cookie = "Num_Fotos = 5; expires = Fri, 10 Jul 2026 12:00:00 ETC";
	// Show intro block
}
// Initializing num photos
let Num_Fotos = document.cookie.split(';')[0].substring(document.cookie.split(";")[0].length - 1);
document.getElementById("count").innerHTML = 'Gjenverende Bilder: '+Num_Fotos;

// Defining constraints
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

// Loading icon functions
function disk_icon_up()
{

}
function disk_icon_down()
{

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
		const tracks = viewfinder.srcObject.getTracks();
		tracks.forEach((track) => {
			track.stop();
		});
	}

	try {
		// Get video stream from the navigator
		let stream = null;
		if(isEnvironment){
			stream = await navigator.mediaDevices.getUserMedia(environment_constraints);
			viewfinder.style.transform = "scaleX(1)";
		} else {
			stream = await navigator.mediaDevices.getUserMedia(user_constraints);
			viewfinder.style.transform = "scaleX(-1)";
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
	document.getElementById("count").innerHTML = 'Gjenverende Bilder: '+Num_Fotos;
	// Updating cookie
	document.cookie = "Num_Fotos = "+Num_Fotos+"; expires = Fri, 10 Jul 2026 12:00:00 ETC"

	// Getting the current videotrack
	const track = viewfinder.srcObject.getVideoTracks()[0];
	const {width: width, height:height } = track.getSettings();
	snapshot.width = width;
	snapshot.height = height;
	// Get canvas context
	var context = snapshot.getContext("2d");
	if(front_face) {context.scale(-1,1);}
	else {context.scale(1,1);}
	// Trigger flash, draw image
	trigger_flash()
	context.filter = active_filter
	context.drawImage(viewfinder,(flip ? img.width * -1 : 0),0,width,height);
	// Purposfully not awaiting this function so it doesn't lag
	save_image(snapshot);

	// #### TEMP ####
	
	context.drawImage(viewfinder,(flip ? img.width * -1 : 0),0,width - (flip ? img.width * -1 : 0),height);
	context.drawImage(viewfinder,(flip ? img.width * -1 : 0),0,width + (flip ? img.width * -1 : 0),height);
	context.drawImage(viewfinder,(flip ? img.width * -1 : 0),0,0,height);
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
