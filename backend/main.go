package main

import (
    "log"
    "os"

    "github.com/gin-gonic/gin"
)

func main() {
    // Create temp upload directory if needed
    if _, err := os.Stat("./tmp"); os.IsNotExist(err) {
        os.Mkdir("./tmp", 0755)
    }
    router := gin.Default()
    router.POST("/api/upload", HandleUpload)
    router.Static("/", "../frontend/build")
    log.Println("Server running on :8080")
    router.Run(":8080")
}
