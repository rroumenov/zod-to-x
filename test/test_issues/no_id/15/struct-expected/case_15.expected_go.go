package models

import CASE_15_DOMAIN "./case_15_domain"

type Price struct {
    CASE_15_DOMAIN.Money
}

type Invoice struct {
    Id string `json:"id"`
    Total CASE_15_DOMAIN.Money `json:"total"`
}
