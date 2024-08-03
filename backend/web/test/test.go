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
	initialize.InitDB()

	gin.SetMode(gin.TestMode)

	r := gin.Default()
	initialize.InitRouters()

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

	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var resp map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	assert.Nil(t, err)
	assert.Equal(t, "Grade updated successfully", resp["message"])
}
