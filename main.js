let viewfinder = document.getElementById("viewfinder")

async function init_camera() {
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
