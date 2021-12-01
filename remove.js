c'use-strict'
let fileInput = document.getElementById('fileInput'),
  theCANVAS = document.getElementById('theCanvas'),
  theCANVASctx = theCANVAS.getContext('2d'),
  imgTMP = document.getElementById('imgTMP'),
  rComponent = document.getElementById('r'),
  gComponent = document.getElementById('g'),
  bComponent = document.getElementById('b'),
  aComponent = document.getElementById('a'),
  transColor = "rgba(255, 255, 255, 1)",
  transCode = 0xffffffff;

let makeColorTransparent =
  function(canvasContext, transparentID, width, height) {
    // where all the magic happens
    let theImageData = canvasContext.getImageData(0, 0, width, height),
      theImageDataBufferTMP = new ArrayBuffer(theImageData.data.length),
      theImageDataClamped8TMP = new Uint8ClampedArray(theImageDataBufferTMP),
      theImageDataUint32TMP = new Uint32Array(theImageDataBufferTMP),
      n = theImageDataUint32TMP.length;
    theImageDataClamped8TMP.set(theImageData.data);

    imgDataLoop: while (n--) {
      // effciency at its finest:
      if (theImageDataUint32TMP[n] !== transparentID)
        continue imgDataLoop;
      theImageDataUint32TMP[n] = 0x00000000; // make it transparent
    }
    theImageData.data.set(theImageDataClamped8TMP);
    theCANVASctx.putImageData(theImageData, 0, 0);
  },
  downloadCanvas = function(downloadfilename) {
    theCanvas.toBlob(function(theIMGblob) {
      var thedataURL = URL.createObjectURL(theIMGblob),
        theAtagLink = document.createElement('a');

      theAtagLink.download = '(proccessed)' + downloadfilename;
      document.body.appendChild(theAtagLink);
      theAtagLink.href = thedataURL;
      theAtagLink.click();
    });
  };

fileInput.onchange = function(fileevent) {
  let efiles = fileevent.target.files,
    localTransColor = transColor,
    localTransCode = transCode;

  let cur = efiles.length,
    nextfile = function() {
      if (!cur--) {
        imgTMP.src = '';
        return;
      }
      let fr = new FileReader();
      console.log(efiles[cur]);
      fr.onload = function(dataevt) {
        fr.onload = null;
        let theArrayBuffer = dataevt.target.result,
          theblob = new Blob([theArrayBuffer]);
        imgTMP.src = URL.createObjectURL(theblob);
        imgTMP.onload = function() {
          imgTMP.onload = null;
          let theImagesWidth = imgTMP.naturalWidth,
            theImagesHeight = imgTMP.naturalHeight;

          theCANVAS.width = theImagesWidth;
          theCANVAS.height = theImagesHeight;

          theCANVASctx.fillStyle = localTransColor;
          theCANVASctx.clearRect(
            0,
            0,
            theImagesWidth,
            theImagesHeight
          );
          theCANVASctx.drawImage(imgTMP, 0, 0);
          makeColorTransparent(
            theCANVASctx,
            localTransCode,
            theImagesWidth,
            theImagesHeight
          );

          //now, download the file:
          downloadCanvas(efiles[cur].name);

          //Finally, procced to proccess the next file
          nextfile();
        };
      };
      fr.readAsArrayBuffer(efiles[cur]);
    };
  nextfile();
}

rComponent.oninput = gComponent.oninput =
  bComponent.oninput = aComponent.oninput =
  function() {
    rComponent.value = Math.max(0, Math.min(rComponent.value, 255));
    gComponent.value = Math.max(0, Math.min(gComponent.value, 255));
    bComponent.value = Math.max(0, Math.min(bComponent.value, 255));
    aComponent.value = Math.max(0, Math.min(aComponent.value, 255));
  };

rComponent.onchange = gComponent.onchange =
  bComponent.onchange = aComponent.onchange =
  function() {
    transColor = 'rgba(' +
      rComponent.value + ',' +
      gComponent.value + ',' +
      bComponent.value + ',' +
      aComponent.value / 255 + ',' +
      ')';
    // numberical equivelent of the rgba
    transCode =
      rComponent.value * 0x00000001 +
      gComponent.value * 0x00000100 +
      bComponent.value * 0x00010000 +
      aComponent.value * 0x01000000;
  };
