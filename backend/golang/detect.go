package main

import (
	"errors"
	"fmt"
	"image/color"
	"image/jpeg"
	"os"
	"path/filepath"

	"gocv.io/x/gocv"
)

const modelFolder string = "../models"

func DetectImage(file string) error {
	xmlFile := filepath.Join(modelFolder, "haarcascade_frontalface_default.xml")

	img := gocv.IMRead(filepath.Join(imageFolder, originalImage), gocv.IMReadColor)
	defer img.Close()

	blue := color.RGBA{B: 255}

	// load classifier to recognize faces
	classifier := gocv.NewCascadeClassifier()
	defer classifier.Close()

	if !classifier.Load(xmlFile) {
		return errors.New("Error reading cascade file: " + xmlFile)
	}

	rects := classifier.DetectMultiScale(img)
	fmt.Printf("found %d faces\n", len(rects))

	for _, r := range rects {
		gocv.Rectangle(&img, r, blue, 3)
	}

	f, err := os.Create(filepath.Join(imageFolder, detectedImage))
	if err != nil {
		return err
	}
	defer f.Close()
	image, err := img.ToImage()
	if err != nil {
		return err
	}
	if err = jpeg.Encode(f, image, nil); err != nil {
		return err
	}
	return nil
}
