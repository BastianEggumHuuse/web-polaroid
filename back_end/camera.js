let viewfinder_e = document.getElementById("viewfinder_environment")
let viewfinder_u = document.getElementById("viewfinder_user")
let snapshot_e 	 = document.getElementById("snapshot_environment")
let snapshot_u 	 = document.getElementById("snapshot_user")

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

async function camera_shutter() {

	// Draw the image currently in the viewfinder onto the canvas
	var context = snapshot_e.getContext("2d");
	context.drawImage(viewfinder_e,0,0,640,480);
	var context = snapshot_u.getContext("2d");
	context.drawImage(viewfinder_u,0,0,640,480);

	save_image();
}

function save_image() {
	// Nothing for now
}
