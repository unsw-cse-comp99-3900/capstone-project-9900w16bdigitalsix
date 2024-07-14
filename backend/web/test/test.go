package test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"web/initialize"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestEditGrade(t *testing.T) {
	// 初始化测试数据库
	initialize.InitDB()

	// 设置Gin测试模式
	gin.SetMode(gin.TestMode)

	// 初始化路由
	r := gin.Default()
	initialize.InitRouters()

	// 创建测试请求
	reqBody := map[string]interface{}{
		"teamId": 1,
		"sprints": []map[string]interface{}{
			{
				"sprintNum": 1,
				"grade":     "A",
				"comment":   "Good work",
			},
		},
		"notification": map[string]interface{}{
			"content": "Grades updated",
			"to": map[string]interface{}{
				"teamId": 1,
			},
		},
	}

	body, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "/v1/progress/edit/grade", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	// 记录响应
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	// 断言响应
	assert.Equal(t, http.StatusOK, w.Code)
	var resp map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	assert.Nil(t, err)
	assert.Equal(t, "Grade updated successfully", resp["message"])
}
