const BASE_URL = 'http://127.0.0.1:5000/'

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
    case "py":
      text = "Detect with python"
      break;
    default:
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

async function detect(type) {
  reloadUI(type);
  startLoading(type);
  const formData = new FormData();
  const fileinput = document.getElementById("finput");
  formData.append('image', fileinput.files[0])

  const url = `${BASE_URL}detect`
  const rawResponse = await fetch(url, {
    method: 'POST',
    body: formData
  });

  const response = await rawResponse.json();
  console.log(response);
  for (let i = 0; i < response.data.length; i++) {
    let box = response.data[i];
    setInterval(() => {
      draw(box.x, box.y, box.w, box.h);
    }, 3000)
  }
  endLoading(type);

}

