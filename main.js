let viewfinder = document.getElementById("viewfinder")
let snapshot = document.getElementById("snapshot")

async function camera_init() {
	let stream = null
	try {
		stream = await navigator.mediaDevices.getUserMedia({video:true, audio:false});
		viewfinder.srcObject = stream;
		viewfinder.play();
	} catch(error) {
		document.getElementById("header").innerHTML = "Error starting camera..";
	}

	document.getElementById("header").innerHTML = "Camera started";
}


async function camera_shutter() {
	var context = snapshot.getContext("2d");
	context.drawImage(viewfinder,0,0,640,480);

	save_image();
}

function save_image() {
	// Nothing for now
}
