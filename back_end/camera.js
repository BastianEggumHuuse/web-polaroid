let viewfinder_e = document.getElementById("viewfinder_environment")
let viewfinder_u = document.getElementById("viewfinder_user")
let snapshot_e 	 = document.getElementById("snapshot_environment")
let snapshot_u 	 = document.getElementById("snapshot_user")
let stage_e 	 = document.getElementById("stage_environment")
let stage_u 	 = document.getElementById("stage_user")
let Frontcam = true
let environment_stream = null
let user_stream = null

// Base camera functionality
async function camera_init() {
	// Declare video stream

	let environment_constraints = {
		audio: false,
		video: {
			facingMode: "environment"
		}
	}

	let user_constraints = {
		audio: false,
		video: {
			facingMode: "user" // for front facing mode
		}
	}

	try {
		// Get video stream from the navigator
		environment_stream = await navigator.mediaDevices.getUserMedia(environment_constraints);
		user_stream = await navigator.mediaDevices.getUserMedia(user_constraints);

		// Link video stream to the viewfinder, and play stream
		viewfinder_e.srcObject = environment_stream;
		viewfinder_e.play();
		viewfinder_u.srcObject = user_stream;
		viewfinder_u.play();
	} catch(error) {
		document.getElementById("header").innerHTML = "Error starting camera.." + error;
	}
}
window.onload = camera_init();

//Shuter flash
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
	

	const track_e = environment_stream.getVideoTracks()[0];
	const track_u = user_stream.getVideoTracks()[0];



	const {width: width_u, height:height_u } = track_u.getSettings();
	snapshot_u.width = width_u;
	snapshot_u.height = height_u;
	
	const { width:width_e, height:height_e } = track_e.getSettings();
	snapshot_e.width = width_e;
	snapshot_e.height = height_e;


	// Draw the image currently in the viewfinder onto the canvas
	var context = snapshot_e.getContext("2d");

	if (Frontcam == true) {
		var context = snapshot_e.getContext("2d");
		context.filter = "contrast(1.5) brightness(0.8) saturate(2.5) blur(0.5px) sepia(0.15) ";
		context.drawImage(viewfinder_e,0,0,width_e,height_e);
		save_image(snapshot_e);
	} else {
		var context = snapshot_u.getContext("2d");
		context.filter = "contrast(1.5) brightness(0.8) saturate(2.5) blur(0.5px) sepia(0.15)";
		context.drawImage(viewfinder_u,0,0,width_u,height_u);
		save_image(snapshot_u);
	}
	trigger_sound()
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

//swaping camera


function swap_cam() {
	const user = document.getElementById("viewfinder_user");
  	const env = document.getElementById("viewfinder_environment");

	if (user.style.zIndex ==2){
		user.style.zIndex = 1;
    	env.style.zIndex = 2;
		Frontcam = true 
	} else {
		user.style.zIndex = 2;
    	env.style.zIndex = 1;
		Frontcam = false 
	}
	

}

// Zooming functionality
let zoom = 1.0;
let zoom_min = 1.0;
let zoom_max = 2.0;
let zoom_step = 0.1;

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
	viewfinder_e.style[prop] = "scale("+zoom+")";
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
