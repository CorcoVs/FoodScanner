const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const scanner = document.getElementById("scanner");

function handleScan(decodedData) {
  const barcode = decodedData;
  const apiUrl = `https://world.openfoodfacts.net/api/v2/product/${barcode}`;

      // Fetch product data using the scanned barcode
    fetch(apiUrl)
        .then((response) => response.json())
        .then((json) => {
            const productName = json.product.product_name;
            console.log(`Product Name: ${productName}`);

            const nutritionScore = json.product.nutriscore_score;
            const nutriscoreGrade = json.product.nutriscore_grade;
            console.log(
                `Nutriscore ${nutritionScore}, grade ${nutriscoreGrade}`
            );
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
        });
}

function startScanner() {
  const constraints = {
    video: {
      facingMode: "environment", // back camera
      width: { ideal: 1280 }, 
      height: { ideal: 720 }, 
    },
  };

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
