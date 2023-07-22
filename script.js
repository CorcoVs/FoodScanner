const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const scanner = document.getElementById('scanner');
let scanStatus = document.querySelector('.status--text').textContent;
let barcode;
let nutritionScore;
let nutriscoreGrade;
let productName = '';

const displayMessage = function () {
  document.querySelector(
    '.score'
  ).textContent = `${productName}: Nutrition score: ${nutritionScore}, Food grade: ${nutriscoreGrade}`;
};

function handleScan(decodedData) {
  barcode = decodedData;

  const apiUrl = `https://world.openfoodfacts.net/api/v2/product/${barcode}`;

  // Fetch product data using the scanned barcode
  fetch(apiUrl)
    .then(response => response.json())
    .then(json => {
      if (
        json.product.product_name &&
        json.product.product_name.trim().length > 0
      ) {
        productName = json.product.product_name;
      } else {
        // Check other product_name_** fields and find the first populated one
        const productKeys = Object.keys(json.product);
        const productNameKey = productKeys.find(key =>
          key.startsWith('product_name_')
        );
        if (productNameKey && json.product[productNameKey].trim().length > 0) {
          productName = json.product[productNameKey];
        } else {
          console.log('No product name found in the database');
          scanStatus =
            'No product name found in the database, check the barcode and try again';
          document.querySelector('.status--text').textContent = scanStatus; // Update the status in the UI
        }
      }

      nutritionScore = json.product.nutriscore_score;
      nutriscoreGrade = json.product.nutriscore_grade;

      document.querySelector('.feedback').textContent = barcode;

      //Calling displayMessage to update
      if (productName) {
        displayMessage();
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
}

//Start Scanner
function startScanner() {
  const constraints = {
    video: {
      facingMode: 'environment', // back camera
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
  };

  scanStatus = 'Starting Scanner';
  document.querySelector('.status--text').textContent = scanStatus; // Update the status in the UI

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(stream => {
      video.srcObject = stream;
      video.play();

      const config = {
        inputStream: {
          name: 'Live',
          type: 'LiveStream',
          target: video,
        },
        decoder: {
          readers: ['ean_reader'],
        },
      };

      Quagga.init(config, function (err) {
        if (err) {
          console.error('Error initializing Quagga:', err);
          return;
        }
        Quagga.start();
        Quagga.onDetected(function (result) {
          handleScan(result.codeResult.code);
          scanStatus = 'Scan Complete, Scan Off';
          document.querySelector('.status--text').textContent = scanStatus; // Update the status in the UI
          Quagga.stop();
        }, true);
      });
    })
    .catch(error => {
      console.error('Error accessing camera:', error);
    });
}

document.getElementById('startBtn').addEventListener('click', startScanner);
