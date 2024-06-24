package util

import (
	"encoding/base64"
	"errors"
	"fmt"
	"os"
	"strings"
	"web/global"
)

func SaveBase64Image(base64Data, filename, outputDir string) (string, string, error) {
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

	// 生成访问URL，图片可以通过 http://localhost:8080/images/ 访问
    host := global.ServerConfig.Host
    port := global.ServerConfig.Port
    url := fmt.Sprintf("http://%s:%d/images/%s", host, port, filename)

	return filename, url, nil
}
