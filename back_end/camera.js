let viewfinder 	= document.getElementById("viewfinder_environment")
let snapshot 	= document.getElementById("snapshot_environment")
let stage 	= document.getElementById("stage_environment")
let front_face 	= false

let active_filter = "contrast(1.4) saturate(2.5) sepia(0.60) brightness(1.1)";

const Zoom = document.getElementById("Zoom")
// Initializing the site
if (true){site_init();}
if (document.cookie == ""){site_init();}
function site_init(){
	document.cookie = "Num_Fotos = 5; expires = Fri, 10 Jul 2026 12:00:00 ETC";
	// Show intro block
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


//Creating filter (idk):
// --- Film grain tile (built once) ---
const grain_tile = document.createElement("canvas");
grain_tile.width = grain_tile.height = 128;
(function () {
  const g = grain_tile.getContext("2d");
  const img = g.createImageData(128, 128);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
})();

// --- Real film effects, drawn on top of the photo ---
function apply_film_look(ctx, w, h) {
  ctx.filter = "none"; // so these layers aren't re-filtered

  // lifted, warm shadows (film blacks are never pure black)
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = "#4a2f12";
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  // warm highlight cast
  ctx.save();
  ctx.globalCompositeOperation = "soft-light";
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = "#ffb066";
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  // vignette
  ctx.save();
  const r = Math.max(w, h) * 0.75;
  const grad = ctx.createRadialGradient(w/2, h/2, r*0.4, w/2, h/2, r);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  // grain
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = 0.45;
  const pattern = ctx.createPattern(grain_tile, "repeat");
  const m = new DOMMatrix();
  m.a = m.d = 2.5; // bigger = chunkier grain
  pattern.setTransform(m);
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

// --- Camera init ---
let camera_started = false;
async function camera_init() {
	install_preview_overlay()
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
	context.drawImage(viewfinder,0,0,width,height);
	apply_film_look(context, width, height);
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
