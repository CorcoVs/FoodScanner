const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const scanner = document.getElementById("scanner");

// Function to handle the barcode scanning
function handleScan(decodedData) {
  // Replace #### in the fetch URL with the scanned barcode
  const barcode = decodedData;
  const apiUrl = `https://world.openfoodfacts.net/api/v2/product/${barcode}`;

  // Fetch product data using the scanned barcode
  fetch(apiUrl)
    .then((response) => response.json())
    .then((json) => {
      const productName = json.product.product_name;
      console.log("Product Name:", productName);

      const nutritionScore = json.product.nutriscore_score;
      const nutriscoreGrade = json.product.nutriscore_grade;
      console.log(`Nutriscore ${nutritionScore}, grade ${nutriscoreGrade}`);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

// Function to start the barcode scanner
function startScanner() {
  // QuaggaJS configuration
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

  // Start the barcode scanner
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
}

// Add event listener to start scanning when the button is clicked
document.getElementById("startBtn").addEventListener("click", startScanner);
