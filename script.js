// fetch(`https://world.openfoodfacts.net/api/v2/product/${#####}`)
//   .then((response) => response.json())
//   .then((json) => {
//     const productName = json.product.product_name;
//     console.log(productName);

//     const nutritionScore = json.product.nutriscore_score;
//     const nutriscoreGrade = json.product.nutriscore_grade;
//     console.log(
//       `Nutriscore ${json.product.nutriscore_score}, grade ${json.product.nutriscore_grade}`
//     );
//   });

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const scanner = document.getElementById('scanner');
let status = document.querySelector('.status--text').textContent;
let barcode;
let nutritionScore;
let nutriscoreGrade;

function handleScan(decodedData) {
  barcode = decodedData;
  const apiUrl = `https://world.openfoodfacts.net/api/v2/product/${barcode}`;

  // Fetch product data using the scanned barcode
  fetch(apiUrl)
    .then(response => response.json())
    .then(json => {
      const productName = json.product.product_name;
      console.log(`Product Name: ${productName}`);
      nutritionScore = json.product.nutriscore_score;
      nutriscoreGrade = json.product.nutriscore_grade;

  //Calling displayMessage to update
      displayMessage(barcode);
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

  staus = 'Starting Scanner';

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
          console.log('Barcode Detected');
          Quagga.stop();
        });
      });
      video.stop();
    })
    .catch(error => {
      console.error('Error accessing camera:', error);
    });
}

const displayMessage = function () {
  document.querySelector('.feedback').textContent = barcode;
  document.querySelector(
    '.score'
  ).textContent = `Nutrition score: ${nutritionScore}, Food grade: ${nutriscoreGrade}`;
};

document.getElementById('startBtn').addEventListener('click', startScanner);
