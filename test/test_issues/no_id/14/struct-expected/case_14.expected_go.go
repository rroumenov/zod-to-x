package models

type Item struct {
    Id string `json:"id"`
    Price float64 `json:"price"`
}

type Page[TCursor any, TContent any] struct {
    Cursor TCursor `json:"cursor"`
    Content TContent `json:"content"`
    Total int64 `json:"total"`
}

type PageDefault struct {
    Page[string, Item]
}

type PageOfNumbers struct {
    Page[string, []float64]
}

type PageCustom struct {
    Page[int64, []Item]
}

type Catalog struct {
    FirstPage Page[string, Item] `json:"firstPage"`
}
