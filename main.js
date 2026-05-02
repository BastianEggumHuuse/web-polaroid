let viewfinder = document.getElementById("viewfinder")
let button_start_camera = document.getElementById("start_camera")

// starting camera
button_start_camera.addEventListener("click", async function() {
	document.getElementById("header").innerHTML = "Starting camera..";

	let stream = null;
	try {
		stream = await navigator.mediaDevices.getUserMedia(
			{video : true, audio: false}
		);
	} catch(error) {
		document.getElementById("header").innerHTML = "Error starting camera..";
	}

	viewfinder.srcObject = stream;
	viewfinder.style.display = "block";
});
