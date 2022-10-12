function upload() {
  var imgcanvas = document.getElementById("canv1");
  var fileinput = document.getElementById("finput");
  var image = new SimpleImage(fileinput);
  image.drawTo(imgcanvas);
  var listArrowBtn = document.getElementsByClassName("arrow");
  for (let i = 0; i < listArrowBtn.length; i++) {
    listArrowBtn[i].style = "display:block";
  }
}

function reloadUI(id) {
  var canvas = document.getElementById("canv2");
  var fileinput = document.getElementById("finput");
  var image = new SimpleImage(fileinput);
  image.drawTo(canvas);

  var listArrowBtn = document.getElementsByClassName("arrow");
  for (let i = 0; i < listArrowBtn.length; i++) {
    listArrowBtn[i].style = "display:none"
  }
  document.getElementById(id).className = "arrow-active arrow";
  document.getElementById(id).style = "display:block";
}

function startLoading(id) {
  document.getElementById(id).innerHTML = "detecting..."
}
function endLoading(id) {
  var listArrowBtn = document.getElementsByClassName("arrow");
  for (let i = 0; i < listArrowBtn.length; i++) {
    listArrowBtn[i].style = "display:block"
    listArrowBtn[i].className = "arrow";
  }

  var text = "";
  switch (id) {
    case "js":
      text = "Detect with javascript"
      break;
    default:
    // code block
  }
  document.getElementById(id).innerHTML = text;
}

async function draw(x, y, w, h) {
 
  var canvas = document.getElementById("canv2");
  let ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.lineWidth = 10;
  ctx.strokeStyle = "white";
  ctx.stroke();
}

async function detectWithJs() {
  reloadUI("js");
  startLoading("js");
  await faceapi.loadSsdMobilenetv1Model('./models');
  const input = document.getElementById('canv1');
  const detections = await faceapi.detectAllFaces(input)
  // resize the detected boxes in case your displayed image has a different size then the original
  const detectionsForSize = faceapi.resizeResults(detections, { width: input.width, height: input.height })

  // draw them into a canvas
  let box = detectionsForSize[0]._box;
  draw(box._x, box._y, box._width, box._height);
  endLoading("js");

}

