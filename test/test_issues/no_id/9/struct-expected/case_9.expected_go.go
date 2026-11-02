package models

import CASE_9_DOMAIN "./case_9_domain"

type Wrapper struct {
    DomainUser CASE_9_DOMAIN.User `json:"domainUser"`
}

type User struct {
    Name string `json:"name"`
    IsAdmin bool `json:"isAdmin"`
}
