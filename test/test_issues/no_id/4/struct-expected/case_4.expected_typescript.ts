// Enumeration of possible error codes:
// - USER_NOT_FOUND: Used when the specified user does not exist.
// - INVALID_EMAIL: Used when the email format is invalid.
// - PASSWORD_TOO_SHORT: Used when password does not meet the minimum length requirement.
export enum ErrorCodes {
    UserNotFound = "USER_NOT_FOUND",
    InvalidEmail = "INVALID_EMAIL",
    PasswordTooShort = "PASSWORD_TOO_SHORT",
}