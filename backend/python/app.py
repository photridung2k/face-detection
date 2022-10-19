from flask import Flask, request, Response
from flask_cors import CORS, cross_origin
import os
import cv2 as cv
import json
from werkzeug.utils import secure_filename

#Constant
imageFolder = "../images"

# Init server
app = Flask(__name__)


CORS(app)
app.config["CORS_HEADERS"] = "Content-Type"


@app.route("/",methods=["GET"])
@cross_origin(origin="*")
def Welcome():
    return {
        "Code": 200,
        "Message": "Welcome to Python Face Detection web server\nPlease access http://localhost:8000/detect to detect faces in the picture"
    }
    
@app.route("/detect", methods=["POST"])
@cross_origin(origin="*")
def GetImage():

    file = request.files.get("image")
    if file:

        filename = secure_filename(file.filename)
        file.save(os.path.join(imageFolder, filename))
        
        faceCascade = cv.CascadeClassifier(os.path.join("../models", "haarcascade_frontalface_default.xml"))
        image = cv.imread(os.path.join(imageFolder, filename))
        grayImage = cv.cvtColor(image, cv.COLOR_BGR2GRAY)
        
        faces = faceCascade.detectMultiScale(grayImage)
        faces_arrays = []
        for (x, y, w, h) in faces:
            element = {'x': float(x),'y': float(y), 'w': float(w), 'h':float(h)}
            faces_arrays.append(element)
        os.remove(imageFolder + "/" + filename)
        return Response(json.dumps(
            {
                "success":"true",
                "data":faces_arrays,
                "message":"Detect image successfully"
            }),  mimetype='application/json')
      
    return {
        "Code": 400,
        "Message": "Can not get image"
    }
    
if __name__ == "__main__":
    app.run(host="localhost", port=5000, debug=True)
