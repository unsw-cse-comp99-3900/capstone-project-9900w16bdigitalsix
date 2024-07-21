package response

type StatisticsResponse struct {
	TotalStudents     int64              `json:"totalStudents"`
	TotalClients      int64              `json:"totalClients"`
	TotalTutors       int64              `json:"totalTutors"`
	TotalCoordinators int64              `json:"totalCoordinators"`
	Fields            []FieldStatistic   `json:"fields"`
	Projects          []ProjectStatistic `json:"projects"`
}

type FieldStatistic struct {
	Field    string `json:"field"`
	Projects int    `json:"projects"`
	Teams    int    `json:"teams"`
}

type ProjectStatistic struct {
	ProjectID uint   `json:"projectId"`
	Title     string `json:"title"`
	Field     string `json:"field"`
	Teams     int    `json:"teams"`
}
