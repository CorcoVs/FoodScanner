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

    //  Write info from json file
    .then(json => {
      productName = json.product.product_name;
      nutritionScore = json.product.nutriscore_score;
      nutriscoreGrade = json.product.nutriscore_grade;
      //
      //
      //
      //
      //
      //
      //

      document.querySelector('.feedback').textContent = barcode;

      //Calling displayMessage to update
      if (productName) {
        displayMessage();
      } else {
        console.log('Wrong barcode or product does not exist in database');
        scanStatus =
          'Wrong barcode or product does not exist in database, check the barcode and try again if wrong';
        document.querySelector('.status--text').textContent = scanStatus; // Update the status in the UI
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
        scanStatus = 'Scan Complete';
        document.querySelector('.status--text').textContent = scanStatus; // Update the status in the UI
        Quagga.onDetected(function (result) {
          handleScan(result.codeResult.code);
          Quagga.stop();
        });
      });
    })
    .catch(error => {
      console.error('Error accessing camera:', error);
    });
}

document.getElementById('startBtn').addEventListener('click', startScanner);
