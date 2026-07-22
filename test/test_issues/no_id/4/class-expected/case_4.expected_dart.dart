import 'package:json_annotation/json_annotation.dart';

part 'error-codes.g.dart';

// Enumeration of possible error codes:
// - USER_NOT_FOUND: Used when the specified user does not exist.
// - INVALID_EMAIL: Used when the email format is invalid.
// - PASSWORD_TOO_SHORT: Used when password does not meet the minimum length requirement.
@JsonEnum(valueField: 'value')
enum ErrorCodes {
  userNotFound('USER_NOT_FOUND'),
  invalidEmail('INVALID_EMAIL'),
  passwordTooShort('PASSWORD_TOO_SHORT');

  const ErrorCodes(this.value);
  final String value;
}
