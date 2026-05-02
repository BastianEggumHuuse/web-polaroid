let viewfinder_e = document.getElementById("viewfinder_environment")
let viewfinder_u = document.getElementById("viewfinder_user")
let snapshot_e 	 = document.getElementById("snapshot_environment")
let snapshot_u 	 = document.getElementById("snapshot_user")
let stage_e 	 = document.getElementById("stage_environment")
let stage_u 	 = document.getElementById("stage_user")

// Base camera functionality
async function camera_init() {
	// Declare video stream
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

	// Draw the image currently in the viewfinder onto the canvas
	var context = snapshot_e.getContext("2d");
	context.drawImage(stage_e,0,0,640,480);
	var context = snapshot_u.getContext("2d");
	context.drawImage(stage_u,0,0,640,480);

	save_image();
}

function save_image() {
	// Nothing for now
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
