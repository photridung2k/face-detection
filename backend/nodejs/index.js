const express = require("express")
const faceapi = require("face-api.js")
const path = require("path")
const cors = require('cors')
const multer = require('multer')
const canvas = require('canvas')
const fs = require('fs');
const app = express()

app.use(cors())
const port = 5000

const modelFolder = "../models"
const imageFolder = "../images"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, imageFolder)
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage })
app.get("/", (req, res) => {
    res.status(200).send({
        success: true,
        data: [],
        message: "Face detection service written by nodejs!!!"
    })
})

app.post("/detect", upload.single('image'), async (req, res) => {
    const { Canvas, Image, ImageData } = canvas;
    const pathImg = req.file.originalname;
    faceapi.env.monkeyPatch({ Canvas, Image, ImageData })
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelFolder)
    const image = await canvas.loadImage(path.join(imageFolder, pathImg));
    const boxes = await faceapi.detectAllFaces(image)

    let data = boxes.reduce((result, item) => {
        result.push({
            x: item._box._x,
            y: item._box._y,
            w: item._box._width,
            h: item._box._height
        });
        return result;
    }, []);

    fs.unlinkSync(`${imageFolder}/${pathImg}`);

    res.status(200).json({
        success: true,
        data,
        message: "Detect image successfully",
    })
})

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port} ...`)
})
