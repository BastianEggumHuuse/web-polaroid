let viewfinder_e = document.getElementById("viewfinder_environment")
let viewfinder_u = document.getElementById("viewfinder_user")
let snapshot_e 	 = document.getElementById("snapshot_environment")
let snapshot_u 	 = document.getElementById("snapshot_user")
let stage_e 	 = document.getElementById("stage_environment")
let stage_u 	 = document.getElementById("stage_user")
let slider	 = document.getElementById("zoom_slider")

let viewfinder_e_track = null

// Base camera functionality
async function camera_init() {
	let environment_stream = null
	let user_stream = null

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
		viewfinder_e_track = environment_stream.getTracks[0];

		viewfinder_e.srcObject = environment_stream;
		viewfinder_e.play();
		viewfinder_u.srcObject = user_stream;
		viewfinder_u.play();
	} catch(error) {
		document.getElementById("header").innerHTML = "Error starting camera..";
	}
}

// Shutter and saving functionality
async function camera_shutter() {

	try{
		const videoTrack = viewfinder_e.srcObject.getVideoTracks()[0];
		const constraints = videoTrack.getConstraints();
		constraints.height = 2000;
		videoTrack.applyConstraints(constraints);
	}
	catch(error){
		document.getElementById("header").innerHTML = "Error applying constraints";
	}

	let shutter_stream = null;
	try{
		let shutter_constraints = {
			audio: false,
			video: {
				facingMode: "environment",
			}
		}
		shutter_stream = await navigator.mediaDevices.getUserMedia(shutter_constraints);

		// Draw the image currently in the viewfinder onto the canvas
	}
	catch(error){
		document.getElementById("header").innerHTML = "Error taking snapshot";
	}

	draw_image(snapshot_e,viewfinder_e);
	draw_image(snapshot_u,viewfinder_u);

	save_image();
}

let size_x = 648;
let size_y = 486;
function draw_image(snapshot, viewfinder){
	var context = snapshot.getContext("2d");

	let diff_x = ((size_x * zoom)-size_x)/2
	let diff_y = ((size_y * zoom)-size_y)/2

	// Drawing the zoomed image
	context.drawImage(viewfinder,-diff_x,-diff_y,size_x * zoom,size_y * zoom);
	// Clearing the outside of the image (unsure if this is necessary)
	context.clearRect(-diff_x,-diff_y,2*diff_x + size_x,diff_y-1); 	// Top
	context.clearRect(-diff_x,size_y,2*diff_x + size_x,diff_y-1); 	// Bottom
	context.clearRect(-diff_x,0,diff_x - 1,size_y);			// Left
	context.clearRect(size_x + 1,0,diff_x,size_y);			// Right
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
	const dataUrl = snapshot_e.toDataURL('image/jpeg', 0.9);
	sendPhotoToPC(dataUrl);
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

slider.oninput = async function()
{
	zoom = zoom_min + this.value/100;
	document.getElementById("header").innerHTML = this.value;
	
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
	viewfinder_u.style[prop] = "scale("+zoom+")";

	//const constraints = {advanced: [{zoom: zoom}]};
  	//await viewfinder_e.srcObject.getVideoTracks()[0].applyConstraints(constraints);
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
