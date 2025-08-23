package images

import (
	"bytes"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"

	"github.com/disintegration/imaging"
	"github.com/rwcarlsen/goexif/exif"
)

type ImageResizer interface {
	ResizeImage(fileBinary []byte) ([]byte, error)
}

type imageResizer struct {
	ThumbnailMaxWidth   int
	ThumbnailMaxHeight  int
	ThumbnailResizeMode ResizeMode
}

func NewImageResizer(thumbnailMaxWidth, thumbnailMaxHeight int, thumbnailResizeMode ResizeMode) ImageResizer {
	return &imageResizer{
		ThumbnailMaxWidth:   thumbnailMaxWidth,
		ThumbnailMaxHeight:  thumbnailMaxHeight,
		ThumbnailResizeMode: thumbnailResizeMode,
	}
}

func (ir *imageResizer) ResizeImage(fileBinary []byte) ([]byte, error) {
	// Decode the image
	img, format, err := image.Decode(bytes.NewReader(fileBinary))
	if err != nil {
		return nil, fmt.Errorf("failed to decode image: %w", err)
	}

	// Handle orientation for JPEG images
	if format == "jpeg" {
		img = ir.fixOrientation(img, fileBinary)
	}

	var resizedImg image.Image
	maxWidth := ir.ThumbnailMaxWidth
	maxHeight := ir.ThumbnailMaxHeight

	switch ir.ThumbnailResizeMode {
	case ResizeModeFit:
		// Resize image to fit within the specified dimensions while maintaining aspect ratio
		resizedImg = imaging.Fit(img, maxWidth, maxHeight, imaging.Lanczos)
	case ResizeModeFill:
		// Resize and crop image to fill the specified dimensions while maintaining aspect ratio
		resizedImg = imaging.Fill(img, maxWidth, maxHeight, imaging.Center, imaging.Lanczos)
	case ResizeModeStretch:
		// Resize image to exact dimensions without maintaining aspect ratio
		resizedImg = imaging.Resize(img, maxWidth, maxHeight, imaging.Lanczos)
	default:
		return nil, fmt.Errorf("unknown resize mode: %s", ir.ThumbnailResizeMode)
	}

	// Encode the resized image
	var buf bytes.Buffer
	switch format {
	case "jpeg", "jpg":
		err = jpeg.Encode(&buf, resizedImg, &jpeg.Options{Quality: 85})
	case "png":
		err = png.Encode(&buf, resizedImg)
	default:
		// Default to JPEG for unsupported formats
		err = jpeg.Encode(&buf, resizedImg, &jpeg.Options{Quality: 85})
	}

	if err != nil {
		return nil, fmt.Errorf("failed to encode resized image: %w", err)
	}

	return buf.Bytes(), nil
}

// fixOrientation applies the correct orientation to the image based on EXIF data
func (ir *imageResizer) fixOrientation(img image.Image, fileBinary []byte) image.Image {
	// Try to extract EXIF data
	x, err := exif.Decode(bytes.NewReader(fileBinary))
	if err != nil {
		// No EXIF data or error reading it, return image as-is
		return img
	}

	// Get the orientation tag
	tag, err := x.Get(exif.Orientation)
	if err != nil {
		// No orientation tag, return image as-is
		return img
	}

	orientation, err := tag.Int(0)
	if err != nil {
		// Error reading orientation value, return image as-is
		return img
	}

	// Apply the appropriate transformation based on orientation
	switch orientation {
	case 1:
		// Normal orientation, no transformation needed
		return img
	case 2:
		// Flip horizontal
		return imaging.FlipH(img)
	case 3:
		// Rotate 180 degrees
		return imaging.Rotate180(img)
	case 4:
		// Flip vertical
		return imaging.FlipV(img)
	case 5:
		// Rotate 90 degrees counter-clockwise and flip horizontal
		return imaging.FlipH(imaging.Rotate270(img))
	case 6:
		// Rotate 90 degrees clockwise
		return imaging.Rotate90(img)
	case 7:
		// Rotate 90 degrees clockwise and flip horizontal
		return imaging.FlipH(imaging.Rotate90(img))
	case 8:
		// Rotate 90 degrees counter-clockwise
		return imaging.Rotate270(img)
	default:
		// Unknown orientation, return image as-is
		return img
	}
}
