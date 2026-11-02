package models

type File struct {
    Name string `json:"name"`
    Size int64 `json:"size"`
}

type Folder struct {
    Name string `json:"name"`
    MainFile *File `json:"mainFile,omitempty"`
    Readme *File `json:"readme,omitempty"`
    Files []File `json:"files"`
    Owner *string `json:"owner,omitempty"`
}
