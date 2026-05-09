package models

import CASE_6_DOMAIN "./case_6_domain"

type GenericBoxAlias[T any] struct {
    CASE_6_DOMAIN.GenericBox
}

type ConcreteBoxAlias struct {
    CASE_6_DOMAIN.ConcreteBox
}
