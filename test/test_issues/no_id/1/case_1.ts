import { z } from "zod/v4";
import { Application, Domain, extendZod, Zod2XModel } from "../../../../dist";
extendZod(z);

/**
 * - Use case:
 * There is an enumerate defined in Domain layer.
 * In application layer, there is a discriminated union type composed by 2 objects, using the
 * enumerate as discriminator.
 *
 * - Current state:
 * In application layer, discriminant keys correctly use the enum type, but the import and the
 * namespace reference are not transpiled, raising a ts(2503) error.
 *
 * @current
 * export interface UserConfigAdmin {
 *      role: UserRole.Admin;
 *      [...]
 * }
 *
 * @expected
 * export interface UserConfigAdmin {
 *      role: USER.UserRole.Admin;
 *      [...]
 * }
 */
@Domain({ namespace: "USER", file: "user.entity" })
class UserModels extends Zod2XModel {
    userRole = z.enum(["Admin", "User"]);
}

const userModels = new UserModels();

@Application({ namespace: "USER_DTOS", file: "user.dtos" })
class UserDtos extends Zod2XModel {
    userConfigAdmin = z.object({
        role: z.literal(userModels.userRole.enum.Admin).zod2x(userModels.userRole),
        permissions: z.array(z.string()),
    });

    userConfigUser = z.object({
        role: z.literal(userModels.userRole.enum.User).zod2x(userModels.userRole),
        banned: z.boolean(),
    });

    userConfig = z.discriminatedUnion("role", [this.userConfigAdmin, this.userConfigUser]);
}

export const userDtos = new UserDtos();
