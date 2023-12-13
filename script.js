const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const scanner = document.getElementById("scanner");
const statusModal = document.querySelector(".status");
const resultModal = document.querySelector(".result");
const nutriscoreModal = document.querySelector(".nutriscore");
const nutrigradeModal = document.querySelector(".nutrigrade");
const additivesModal = document.querySelector(".additives");
const ingredientsModal = document.querySelector(".ingredients");
const imageModal = document.querySelector(".product--image");
const nova = document.querySelector(".nova");

let barcode;
let novaScore, grade, additivesNumber;
let productName;
let ingredients;
let productImage, imageSource;

/*
 * Displays information about a scanned food product.
 *
 * @param {string} productName - The name of the scanned food product.
 * @param {string} productImage - The URL of the scanned food product's image.
 * @param {number} novaScore - The nutrition score of the scanned food product.
 * @param {string} grade - The nutrigrade of the scanned food product.
 * @param {number} additivesNumber - The number of additives in the scanned food product.
 * @param {string} ingredients - The ingredients of the scanned food product.
 */

const displayMessage = function () {
  document.querySelector(".product--name").textContent = productName;

  resultModal.classList.remove("hidden");

  //  Display product image
  imageModal.src = productImage;
  imageModal.classList.remove("hidden");

  if (novaScore === undefined) {
    nova.alt = `undefined`;
  } else {
    nova.src = `https://raw.githubusercontent.com/CorcoVs/FoodScanner/main/assets/${novaScore}.svg`;
    nutriscoreModal.classList.remove("hidden");
    nutriscoreModal.style.maxHeight = "100px";
  }

  // Wait animation
  setTimeout(() => {
    nutrigradeModal.src = `https://raw.githubusercontent.com/CorcoVs/FoodScanner/main/assets/nutri-${grade}.png`;
    nutrigradeModal.classList.remove("hidden");
    nutrigradeModal.style.maxHeight = "100px";
  }, 500);
  setTimeout(() => {
    additivesModal.textContent = `${additivesNumber} additives`;
    additivesModal.classList.remove("hidden");
  }, 500);
  setTimeout(() => {
    ingredientsModal.textContent = ingredients;
    ingredientsModal.classList.remove("hidden");
  }, 500);
  // setTimeout(() => {
  //   statusModal.classList.add("hidden");
  //   statusModal.textContent = "Scan Complete";
  // }, 500);
};

function handleScan(decodedData) {
  barcode = decodedData;

  // Update scanned barcode in the UI
  document.querySelector(".feedback").textContent = barcode;

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
          resultModal.classList.remove("hidden");
        } else {
          console.log("No product name found in database");
          statusModal.textContent =
            "No product name found, check barcode and retry"; // Update the status in the UI
          statusModal.classList.remove("hidden");
        }
      }
      //Set NovaScore
      novaScore = json.product.nutriscore_score;
      //Set Nutrigrade
      grade = json.product.nutriscore_grade;

      additivesNumber = json.product.additives_n;
      console.log(additivesNumber);

      // Need to find the ingredients
      // ingredients = json.product.ingredients;
      // console.log(ingredients.count);
      const lang = json.product.lang;

      // Set the product image
      if (json.product.selected_images.front) {
        productImage = json.product.selected_images.front.small[lang];
        console.log(productImage);
      } else {
        productImage = "No image found";
      }

      // Calling displayMessage to update the UI
      if (productName) {
        displayMessage();
      }
    })

    .catch((error) => {
      console.log("Error fetching data:", error);
    });
}

//  Fake scanner
function fakeScanner() {
  let decodedData = "54493438";
  statusModal.classList.remove("hidden");
  statusModal.textContent = "Scan Complete";
  handleScan(decodedData);
}

//Start Scanner
function startScanner() {
  //Reset the scanner variables
  barcode = null;
  productName = null;
  novaScore = null;
  grade = null;
  additivesNumber = null;
  ingredients = null;
  productImage = null;

  // Hide the result modal and UI elements
  resultModal.classList.add("hidden");
  imageModal.classList.add("hidden");
  nutriscoreModal.classList.add("hidden");
  nutrigradeModal.classList.add("hidden");
  additivesModal.classList.add("hidden");
  ingredientsModal.classList.add("hidden");

  scanner.style.display = "block";
  const constraints = {
    video: {
      facingMode: "environment",
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    },
  };

  statusModal.textContent = "Scanning";
  statusModal.classList.remove("hidden");

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
          scanner.classList.add("flashing-border");

          handleScan(result.codeResult.code);
          Quagga.stop();

          video.pause();
          video.srcObject = null;

          statusModal.textContent = "Scan Complete";
          statusModal.classList.remove("hidden");
          scanner.style.display = "none";
          setTimeout(() => {
            scanner.classList.remove("flashing-border");
          }, 1500);
        }, true);
      });
    })
    .catch((error) => {
      console.log("Error accessing camera:", error);
      statusModal.textContent = "Error accessing camera";
    });
}

document.getElementById("startBtn").addEventListener("click", startScanner);

// // Fake Scanner function for testing
// document.getElementById("startBtn").addEventListener("click", fakeScanner);
