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
	};

let user_constraints = {
		audio: false,
		video: {
			facingMode: "user", // for front facing mode
			width: {ideal:4096},
			height: {ideal: 2160},
		}
	};


// --- Camera init ---
let camera_init = false;
async function camera_init() {
	document.getElementById("header").innerHTML = 'init';
	return;

	set_camera_face(true);
	camera_init = true;
}

function camera_init_2()
{
	document.getElementById("header").innerHTML = 'init';
}
window.onload = camera_init_2();

// --- Loading camera face ---
async function set_camera_face(isEnvironment)
{
	// Removing previous stream
	if (camera_init){
		// This is a bad way of doing this I think
		viewfinder.srcObject.getVideoTracks[0].stop();
	}
	
	document.getElementById("header").innerHTML = 'starting';

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
<<<<<<< HEAD
		document.getElementById("header").innerHTML = 'Camera does not Work';;
=======
		document.getElementById("header").innerHTML = 'Failed to load video stream';
>>>>>>> c129bc9 (a)
	}
}

// --- Switch camera face ---
function swap_cam()
{
	front_face = !front_face;
	set_camera_face(front_face);
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

async function zoom2() {
    const [track] = environment_stream.getVideoTracks();
    const capabilities = track.getCapabilities();
	const ZoomVal = Zoom.value;

    if (capabilities.zoom) {
		const maxZoom = capabilities.zoom.max;
        await track.applyConstraints({ advanced: [{ zoom: maxZoom/100*ZoomVal }] });
    } else {
        console.log("Zoom not supported on this device/browser");
    }
}

function zoom_in(){
	zoom = clamp(zoom_min,zoom_max,zoom + zoom_step);
	update_zoom();
}

function zoom_out(){
	zoom = clamp(zoom_min,zoom_max,zoom - zoom_step);
	update_zoom();
}
function update_zoom()
{
	
	// Which transform is used depends on browser 
	var properties = ['transform', 'WebkitTransform', 'MozTransform','msTransform', 'OTransform'];
	let prop = properties[0]

	// I just kinda stole this code from mozilla bro
	/* Ok so this is probably necessary but it doesn't work!!
	// Find out which CSS transform the browser supports
	for(i=0,j=properties.length;i<j;i++){
		if(typeof stage.style[properties[i]] !== 'undefined'){
			prop = properties[i];
			break;
		}
	}*/

	// Actually applying zoom
	viewfinder.style[prop] = "scale("+zoom+")";
}

// Other functions
function clamp(a,b,t){
	if (t < a){
		return a;
	}
	if (t > b){
		return b;
	}
	return t;
}
