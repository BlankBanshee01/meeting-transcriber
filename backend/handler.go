package main

import (
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

const maxUploadSize = 10 << 20 // 10 MB

// Helper for file type magic number checking (ID3 or typical MP3)
func isMP3(header *multipart.FileHeader, file multipart.File) (bool, error) {
	buf := make([]byte, 3)
	_, err := file.Read(buf)
	if err != nil {
		return false, err
	}
	file.Seek(0, 0)
	if string(buf) == "ID3" {
		return true, nil // ID3 tag at start (MP3)
	}
	// Also check for MPEG frame sync (starts with 0xFF 0xFB or 0xFF 0xF3)
	buf2 := make([]byte, 2)
	file.Seek(0, 0)
	_, err = file.Read(buf2)
	file.Seek(0, 0)
	if err == nil && buf2[0] == 0xFF && (buf2[1] == 0xFB || buf2[1] == 0xF3) {
		return true, nil
	}
	return false, errors.New("File does not appear to be a valid MP3 (no ID3 tag or frame sync)")
}

func HandleUpload(c *gin.Context) {
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxUploadSize+1024)
	err := c.Request.ParseMultipartForm(maxUploadSize + 1024)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File too large (max 10MB) or bad request."})
		return
	}

	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded."})
		return
	}
	defer file.Close()

	if header.Size > maxUploadSize {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File exceeds 10MB limit."})
		return
	}

	if !strings.HasSuffix(strings.ToLower(header.Filename), ".mp3") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only .mp3 files are allowed."})
		return
	}

	valid, magicErr := isMP3(header, file)
	if !valid {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Uploaded file is not a valid MP3: " + magicErr.Error()})
		return
	}

	filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), header.Filename)
	dest := filepath.Join("tmp", filename)
	out, err := os.Create(dest)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file."})
		return
	}
	defer out.Close()
	io.Copy(out, file)

	transcript := TranscribeAudio(dest)
	summary := SummarizeTranscript(transcript)

	os.Remove(dest)

	c.JSON(200, gin.H{
		"summary": summary,
	})
}
