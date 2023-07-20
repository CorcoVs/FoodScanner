const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const scanner = document.getElementById("scanner");

function handleScan(decodedData) {
  // The rest of your handleScan() function remains the same
}

function startScanner() {
  const constraints = { video: true };

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      video.srcObject = stream;
      video.play();

      const config = {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: video,
        },
        decoder: {
          readers: ["ean_reader"],
        },
      };

      Quagga.init(config, function (err) {
        if (err) {
          console.error("Error initializing Quagga:", err);
          return;
        }
        Quagga.start();
        Quagga.onDetected(function (result) {
          handleScan(result.codeResult.code);
          Quagga.stop();
        });
      });
    })
    .catch((error) => {
      console.error("Error accessing camera:", error);
    });
}

document.getElementById("startBtn").addEventListener("click", startScanner);
