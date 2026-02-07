import { z } from "zod";
import { Domain, Zod2XModel, extendZod } from "../../../../dist";
extendZod(z);

/**
 * - Use case:
 * Define a type with multi line description.
 *
 * - Current state:
 * Only the first line of the description is transpiled with comment syntax.
 *
 * @current
 * // Enumeration of possible error codes:
 * - USER_NOT_FOUND: Used when the specified user does not exist.
 * - INVALID_EMAIL: Used when the email format is invalid.
 * - PASSWORD_TOO_SHORT: Used when password does not meet the minimum length requirement.
 * export enum ErrorCodes {
 *   UserNotFound = "USER_NOT_FOUND",
 *   InvalidEmail = "INVALID_EMAIL",
 *   PasswordTooShort = "PASSWORD_TOO_SHORT",
 * }
 *
 * @expected
 * // Enumeration of possible error codes:
 * // - USER_NOT_FOUND: Used when the specified user does not exist.
 * // - INVALID_EMAIL: Used when the email format is invalid.
 * // - PASSWORD_TOO_SHORT: Used when password does not meet the minimum length requirement.
 * export enum ErrorCodes {
 *   UserNotFound = "USER_NOT_FOUND",
 *   InvalidEmail = "INVALID_EMAIL",
 *   PasswordTooShort = "PASSWORD_TOO_SHORT",
 * }
 */

const ERROR_CODES = {
    USER_NOT_FOUND: "Used when the specified user does not exist.",
    INVALID_EMAIL: "Used when the email format is invalid.",
    PASSWORD_TOO_SHORT: "Used when password does not meet the minimum length requirement.",
};

const ERROR_CODES_DESCRIPTION =
    `Enumeration of possible error codes:\n` +
    Object.entries(ERROR_CODES)
        .map(([key, description]) => `- ${key}: ${description}`)
        .join("\n");

@Domain({ namespace: "ERROR_CODES", file: "error-codes" })
class ErrorCodesModels extends Zod2XModel {
    readonly ErrorCodes = z.enum(Object.keys(ERROR_CODES) as any).describe(ERROR_CODES_DESCRIPTION);
}

export const errorCodesModels = new ErrorCodesModels();
