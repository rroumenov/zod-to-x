package models

// Enumeration of possible error codes:
// - USER_NOT_FOUND: Used when the specified user does not exist.
// - INVALID_EMAIL: Used when the email format is invalid.
// - PASSWORD_TOO_SHORT: Used when password does not meet the minimum length requirement.
type ErrorCodes string

const (
    ErrorCodesUserNotFound ErrorCodes = "USER_NOT_FOUND"
    ErrorCodesInvalidEmail ErrorCodes = "INVALID_EMAIL"
    ErrorCodesPasswordTooShort ErrorCodes = "PASSWORD_TOO_SHORT"
)
