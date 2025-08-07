import { z } from "zod/v4";
import { Application, extendZod, Zod2XModel } from "../../../../dist";
extendZod(z);

/**
 * - Use case:
 * There is an object defined in a layer, and it is used inside the same layer.
 *
 * - Current state:
 * The second type definition is not extending the first one.
 *
 * @current
 * export interface CreateUserDto {
 *      name: string;
 *      permissions: string[];
 * }
 *
 * @expected
 * export interface CreateUserDto {
 *      name: string;
 *      permissions: string[];
 * }
 *
 * export interface UpdateUserDto extends CreateUserDto {}
 */
@Application({ namespace: "USER_DTOS", file: "user.dtos" })
class UserDtos extends Zod2XModel {
    createUserDto = z.object({
        name: z.string().min(1),
        permissions: z.array(z.string()),
    });

    updateUserDto = this.createUserDto;
}

export const userDtos = new UserDtos();
