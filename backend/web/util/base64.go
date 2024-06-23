package util

import (
	"encoding/base64"
	"errors"
	"os"
	"strings"
	"time"
)

func SaveBase64Image(base64Data string, outputDir string) (string, string, error) {
    // 分离Base64头部信息
    idx := strings.Index(base64Data, ",")
    if idx < 0 {
        return "", "", errors.New("invalid base64 data")
    }
    data := base64Data[idx+1:]

    // 解码Base64数据
    imgData, err := base64.StdEncoding.DecodeString(data)
    if err != nil {
        return "", "", err
    }

    // 生成文件名
    filename := time.Now().Format("20060102150405") + ".png"
    savePath := outputDir + "/" + filename

    // 确保输出目录存在
    if _, err := os.Stat(outputDir); os.IsNotExist(err) {
        if err := os.Mkdir(outputDir, os.ModePerm); err != nil {
            return "", "", err
        }
    }

    // 将二进制数据写入文件
    if err := os.WriteFile(savePath, imgData, 0644); err != nil {
        return "", "", err
    }

    // 生成访问URL，假设图片可以通过 http://localhost:8080/images/ 访问
    url := "http://localhost:8080/images/" + filename

    return filename, url, nil
}
