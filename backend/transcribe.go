package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "mime/multipart"
    "net/http"
    "os"
)

// TranscribeAudio sends the audio file to OpenAI Whisper API and returns the transcript.
func TranscribeAudio(filePath string) string {
    apiKey := os.Getenv("OPENAI_API_KEY")
    if apiKey == "" {
        return "[Error] OPENAI_API_KEY not set"
    }
    url := "https://api.openai.com/v1/audio/transcriptions"
    file, err := os.Open(filePath)
    if err != nil {
        return "[Error] Cannot open file for transcription"
    }
    defer file.Close()

    var b bytes.Buffer
    writer := multipart.NewWriter(&b)

    fw, err := writer.CreateFormFile("file", filePath)
    if err != nil {
        return "[Error] Cannot create form file"
    }
    io.Copy(fw, file)
    writer.WriteField("model", "whisper-1")
    writer.Close()

    req, err := http.NewRequest("POST", url, &b)
    if err != nil {
        return "[Error] Failed to create request to OpenAI"
    }
    req.Header.Set("Authorization", "Bearer "+apiKey)
    req.Header.Set("Content-Type", writer.FormDataContentType())

    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        return "[Error] Failed to reach OpenAI Whisper API"
    }
    defer resp.Body.Close()
    if resp.StatusCode != 200 {
        return fmt.Sprintf("[Error] Whisper API error: %d", resp.StatusCode)
    }

    var result struct {
        Text string `json:"text"`
    }
    if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
        return "[Error] Could not decode Whisper response"
    }
    return result.Text
}
