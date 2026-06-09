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
	const audio = new Audio("back_end/Shutter.m4a");
  	audio.play();
}

// --- Analog film look (applies to the saved canvas) ---
function apply_film_look(canvas) {
	const ctx = canvas.getContext("2d");
	const { width, height } = canvas;
	const img = ctx.getImageData(0, 0, width, height);
	const d = img.data;

	const cx = width / 2, cy = height / 2;
	const maxDist = Math.hypot(cx, cy);
	const grainAmount = 18;   // higher = grainier
	const vignette    = 1; // 0 = none, 1 = strong dark corners

	for (let i = 0; i < d.length; i += 4) {
		let r = d[i], g = d[i + 1], b = d[i + 2];

		// Warm grade + lifted ("milky") shadows
		r = r * 0.92 + 26;
		g = g * 0.92 + 18;
		b = b * 0.86 + 12;

		// Film grain
		const noise = (Math.random() - 0.5) * grainAmount;
		r += noise; g += noise; b += noise;

		// Vignette based on distance from centre
		const px = (i / 4) % width;
		const py = (i / 4 / width) | 0;
		const dist = Math.hypot(px - cx, py - cy) / maxDist;
		const v = 1 - vignette * dist * dist;
		r *= v; g *= v; b *= v;

		d[i]     = r < 0 ? 0 : r > 255 ? 255 : r;
		d[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
		d[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
	}

	ctx.putImageData(img, 0, 0);
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
	// Trigger flash, draw image
	trigger_flash()
	context.filter = active_filter
	context.drawImage(viewfinder,0,0,width,height);
	// Purposfully not awaiting this function so it doesn't lag
	apply_film_look(snapshot);
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
