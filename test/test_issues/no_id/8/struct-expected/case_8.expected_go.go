package models

type Settings struct {
    Name string `json:"name"`
    Retries int64 `json:"retries"`
    Enabled bool `json:"enabled"`
    Tags []string `json:"tags"`
    Nickname string `json:"nickname"`
    Port int64 `json:"port"`
    Title string `json:"title"`
    Extra any `json:"extra"`
}
