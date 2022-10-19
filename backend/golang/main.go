package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gorilla/mux"
	"go.uber.org/zap"
)

type response struct {
	Code    int
	Message string
	Error   error
	Data    string
}

const imageFolder string = "../images"
const originalImage = "go_original.jpeg"
const detectedImage = "go_detected.jpeg"

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/detect", GetImage).Methods(http.MethodPost)
	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		res := response{
			Code:    200,
			Message: "Welcome to Golang Face Detection web server\nPlease access http://localhost:8000/detect to detect faces in the picture",
		}
		_ = json.NewEncoder(w).Encode(res)
	}).Methods(http.MethodGet)

	port := "8000"
	fmt.Println("Start server at localhost:" + port)

	if err := http.ListenAndServe(":"+port, r); err != nil {
		_ = fmt.Errorf("server listening error: %v", err)
	}
}

func GetImage(w http.ResponseWriter, r *http.Request) {
	file, fileHeader, err := r.FormFile("image")
	defer file.Close()
	if err != nil {
		res := response{
			Code:    http.StatusBadRequest,
			Message: "Can not parse form",
			Error:   err,
		}
		_ = json.NewEncoder(w).Encode(res)
		return
	}
	fmt.Printf("File name = %v\n", fileHeader.Filename)
	fmt.Printf("File header = %v\n", fileHeader.Header)
	f, err := os.Create(filepath.Join(imageFolder, originalImage))
	if err != nil {
		res := response{
			Code:    http.StatusBadRequest,
			Message: "Can not create a image file",
			Error:   err,
		}
		_ = json.NewEncoder(w).Encode(res)
		return
	}
	buffer := bytes.NewBuffer(nil)
	_, err = io.Copy(buffer, file)
	if err != nil {
		res := response{
			Code:    http.StatusBadRequest,
			Message: "Can not copy file to buffer",
			Error:   err,
		}
		_ = json.NewEncoder(w).Encode(res)
		return
	}
	if _, err = f.Write(buffer.Bytes()); err != nil {
		res := response{
			Code:    http.StatusBadRequest,
			Message: "Can not write bytes to file",
			Error:   err,
		}
		_ = json.NewEncoder(w).Encode(res)
		return
	}

	logger := zap.New(nil)
	err = DetectImage(filepath.Join(imageFolder, originalImage))
	if err != nil {
		logger.Info("Detect image error: " + err.Error())
		res := response{
			Code:    http.StatusBadRequest,
			Message: "Can not detect image",
			Error:   err,
		}
		_ = json.NewEncoder(w).Encode(res)
		return
	}
	result, err := ioutil.ReadFile(filepath.Join(imageFolder, detectedImage))
	if err != nil {
		logger.Info("Can not read file: " + err.Error())
		res := response{
			Code:    http.StatusBadRequest,
			Message: "Can not read detected image file",
			Error:   err,
		}
		_ = json.NewEncoder(w).Encode(res)
		return
	}
	w.Header().Set("Content-Type", "application/octet-stream")
	res := response{
		Code:    http.StatusOK,
		Message: "Detect face successfully",
		Error:   nil,
		Data:    string(result),
	}
	_ = json.NewEncoder(w).Encode(res)
}
