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

let barcode;
let nutritionScore, grade, additivesNumber;
let productName;
let ingredients;
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
  setTimeout(() => {
    nutrigradeModal.src = `https://raw.githubusercontent.com/CorcoVs/FoodScanner/main/assets/nutri-${grade}.png`;
    nutrigradeModal.classList.remove("hidden");
    nutrigradeModal.style.maxHeight = "100px";
  }, 500);
  setTimeout(() => {
    additivesModal.textContent = `Number of additives: ${additivesNumber} i`;
    additivesModal.classList.remove("hidden");
  }, 500);
  setTimeout(() => {
    ingredientsModal.textContent = ingredients;
    ingredientsModal.classList.remove("hidden");
  }, 500);
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
          resultModal.classList.remove("hidden");
        } else {
          console.log("No product name found in database");
          statusModal.textContent =
            "No product name found, check barcode and retry"; // Update the status in the UI
          statusModal.classList.remove("hidden");
        }
      }
      //Set NutriScore
      nutritionScore = json.product.nutriscore_score;
      //Set Nutrigrade
      grade = json.product.nutriscore_grade;

      additivesNumber = [json.product.additives_n];
      console.log(additivesNumber);

      ingredients = json.product.ingredients;
      console.log(ingredients.count);

      //  Example API call needed to get the image

      //https:images.openfoodfacts.org/images/products/343/566/076/8163/1.jpg

      // Update the status in the UI

      // Set the product image
      // productImage = "https://picsum.photos/200";
      // Check if images information is available in the JSON
      if (json.product && json.product.images) {
        // Get the selected image for product photo (front) in 200 size
        const productPhotoImage =
          json.product.images[`front_${json.product.lang}`];
        if (
          productPhotoImage &&
          productPhotoImage.sizes &&
          productPhotoImage.sizes["200"]
        ) {
          // Construct the URL for the 200 size image
          const imageUrl = `https://images.openfoodfacts.org/images/products/${json.code}/${productPhotoImage.imgid}.200.jpg`;

          // Call  URL for the image
          fetch(imageUrl)
            .then((imageResponse) => imageResponse.blob())
            .then((imageBlob) => {
              // Display the product image
              productImage = URL.createObjectURL(imageBlob);

              // Update the status in the UI
              document.querySelector(".feedback").textContent = barcode;

              // Calling displayMessage to update
              if (productName) {
                displayMessage();
              }
            })

            .catch((error) => {
              console.error("Error fetching image:", error);
            });
        } else {
          console.error("Product photo image not available in 200 size.");
        }
      } else {
        console.error("Product data or images not found in the response.");
      }
    })

    .catch((error) => {
      console.log("Error fetching data:", error);
    });
}

//  Fake scanner
function fakeScanner() {
  let decodedData = "3175680011480";
  statusModal.classList.remove("hidden");
  statusModal.textContent = "Scan Complete";
  handleScan(decodedData);
}

//Start Scanner
function startScanner() {
  const constraints = {
    video: {
      facingMode: "environment",
      width: { ideal: 1280 },
      height: { ideal: 720 },
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
          resultModal.classList.remove("hidden");
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

// Fake Scanner function for testing
// document.getElementById("startBtn").addEventListener("click", fakeScanner);
