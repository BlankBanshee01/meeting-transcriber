package main

import (
    "bytes"
    "encoding/json"
    "os"
    "net/http"
    "fmt"
)

// SummarizeTranscript uses OpenAI GPT to summarize the transcript.
func SummarizeTranscript(transcript string) string {
    apiKey := os.Getenv("OPENAI_API_KEY")
    if apiKey == "" {
        return "[Error] OPENAI_API_KEY not set"
    }
    url := "https://api.openai.com/v1/chat/completions"
    body := map[string]interface{}{
        "model": "gpt-3.5-turbo",
        "messages": []map[string]string{
            {"role": "system", "content": "You are an assistant that summarizes meetings in clear, structured form."},
            {"role": "user", "content": fmt.Sprintf("Please summarize the following meeting transcript:\n%s", transcript)},
        },
        "temperature": 0.2,
        "max_tokens": 500,
    }
    jsonBody, _ := json.Marshal(body)
    req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
    if err != nil {
        return "[Error] Failed to create GPT request"
    }
    req.Header.Add("Authorization", "Bearer "+apiKey)
    req.Header.Add("Content-Type", "application/json")
    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        return "[Error] Failed to reach OpenAI GPT API"
    }
    defer resp.Body.Close()
    if resp.StatusCode != 200 {
        return fmt.Sprintf("[Error] GPT API error: %d", resp.StatusCode)
    }
    var result struct {
        Choices []struct {
            Message struct {
                Content string `json:"content"`
            } `json:"message"`
        } `json:"choices"`
    }
    if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
        return "[Error] Could not decode GPT response"
    }
    if len(result.Choices) == 0 {
        return "[Error] No completion returned"
    }
    return result.Choices[0].Message.Content
}
