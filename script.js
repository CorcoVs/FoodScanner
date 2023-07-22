const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const scanner = document.getElementById("scanner");
let scanStatus = document.querySelector(".status--text").textContent;
const nutriscoreModal = document.querySelector(".nutriscore");
const nutrigradeModal = document.querySelector(".nutrigrade");

let barcode;
let nutritionScore;
let nutriscoreGrade;
let productName = "";
let productImage = "";

const displayMessage = function () {
  document.querySelector(".product--name").textContent = productName;
  document.querySelector(
    ".nutriscore"
  ).textContent = `Nutrition score: ${nutritionScore}`;
  nutriscoreModal.classList.remove("hidden");
  document.document.querySelector(
    ".nutrigrade"
  ).textContent = `Food grade: ${nutriscoreGrade}`;
  nutrigradeModal.classList.remove("hidden");
};

function handleScan(decodedData) {
  barcode = decodedData;

  const apiUrl = `https://world.openfoodfacts.net/api/v2/product/${barcode}`;

  // Fetch product data using the scanned barcode
  fetch(apiUrl)
    .then((response) => response.json())
    .then((json) => {
      // Check if product_name field exists and is populated
      if (
        json.product.product_name &&
        json.product.product_name.trim().length > 0
      ) {
        productName = json.product.product_name;
      } else {
        // Check other product_name_** fields and find the first populated one
        const productKeys = Object.keys(json.product);
        const productNameKey = productKeys.find(
          (key) =>
            key.startsWith("product_name_") &&
            json.product[key].trim().length > 0
        );
        if (productNameKey) {
          productName = json.product[productNameKey];
        } else {
          console.log("No product name found in database");
          scanStatus = "No product name found, check barcode and retry";
          document.querySelector(".status--text").textContent = scanStatus; // Update the status in the UI
        }
      }

      nutritionScore = json.product.nutriscore_score;
      nutriscoreGrade = json.product.nutriscore_grade;

      //  Example API call needed to get the image
      // https://images.openfoodfacts.org/images/products/343/566/076/8163/1.jpg
      // productImage = ${https://images.openfoodfacts.org/images/products/343/566/076/8163/1.jpg};

      document.querySelector(".feedback").textContent = barcode;

      //Calling displayMessage to update
      if (productName) {
        displayMessage();
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

//Start Scanner
function startScanner() {
  const constraints = {
    video: {
      facingMode: "environment", // back camera
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
  };

  scanStatus = "Starting Scanner";
  document.querySelector(".status--text").textContent = scanStatus; // Update the status in the UI

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
          scanStatus = "Scan Complete, Scan Off";
          document.querySelector(".status--text").textContent = scanStatus; // Update the status in the UI
          Quagga.stop();
        }, true);
      });
    })
    .catch((error) => {
      console.error("Error accessing camera:", error);
    });
}

document.getElementById("startBtn").addEventListener("click", startScanner);
