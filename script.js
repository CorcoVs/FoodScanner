const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const scanner = document.getElementById("scanner");
let statusModal = document.querySelector(".status--text");
const nutriscoreModal = document.querySelector(".nutriscore");
const nutrigradeModal = document.querySelector(".nutrigrade");
const additivesModal = document.querySelector(".additives");
const ingredientsModal = document.querySelector("ingredients");
const imageModal = document.querySelector(".product--image");

let barcode;
let nutritionScore, grade, additivesNumber;
let productName;
let ingredients = [];
let productImage, imageSource;

const displayMessage = function () {
  document.querySelector(".product--name").textContent = productName;

  //  Display product image
  imageModal.src = productImage;
  imageModal.classList.remove("hidden");

  document.querySelector(
    ".nutriscore"
  ).textContent = `Nutrition score: ${nutritionScore}`;
  nutriscoreModal.classList.remove("hidden");
  nutriscoreModal.style.maxHeight = "100px";

  // Wait animation
  // setTimeout(() => {
  nutrigradeModal.src = `../assets/nutri-${grade}.png`;
  nutrigradeModal.classList.remove("hidden");
  nutrigradeModal.style.maxHeight = "100px";
  // }, 500);

  additivesModal.textContent = `Number of additives: ${additivesNumber}`;
  additivesModal.classList.remove("hidden");

  ingredients;
  ingredientsModal.textContent = ingredients;
  ingredientsModal.classList.remove("hidden");
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
          document.querySelector(".status--text").textContent =
            "No product name found, check barcode and retry"; // Update the status in the UI
          statusModal.classList.remove(".hidden");
        }
      }

      nutritionScore = json.product.nutriscore_score;
      grade = json.product.nutriscore_grade;

      additivesNumber = json.product.additives_n;
      console.log(additivesNumber);

      // ingredients = json.product.ingredients;
      // console.log(ingredients.count);

      //  Example API call needed to get the image
      // https://images.openfoodfacts.org/images/products/343/566/076/8163/1.jpg
      // Update the status in the UI
      // productImage =
      //   "https://images.openfoodfacts.org/images/products/343/566/076/8163/1.400.jpg";

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

//  Fake scanner
function fakeScanner() {
  let decodedData = "5449000242402";
  document.querySelector(".status--text").textContent =
    "Scan Complete, Scan Off";
  statusModal.classList.remove(".hidden");
  handleScan(decodedData);
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

  document.querySelector(".status--text").textContent = "Scanning"; // Update the status in the UI
  statusModal.classList.remove(".hidden");

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

      console.log();

      Quagga.init(config, function (err) {
        if (err) {
          console.error("Error initializing Quagga:", err);
          return;
        }
        Quagga.start();
        Quagga.onDetected(function (result) {
          handleScan(result.codeResult.code);
          Quagga.stop();

          // Need to Fix
          // document.querySelector(".status--text").textContent =
          //   "Scan Complete, Scan Off";
          // document.querySelector(".status--text").classList.remove(".hidden");
        }, true);
      });
    })
    .catch((error) => {
      console.error("Error accessing camera:");
    });
}

document.getElementById("startBtn").addEventListener("click", startScanner);

// Fake Scanner function for testing
// document.getElementById("startBtn").addEventListener("click", fakeScanner);
