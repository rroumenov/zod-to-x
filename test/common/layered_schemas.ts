import { z } from "zod";
import { Application, Domain, Zod2XModel } from "../../dist";

@Domain({ namespace: "USER", file: "user.entity" })
class UserModels extends Zod2XModel {
    userRole = z.enum(["Admin", "User"]);

    userEntity = z.object({
        id: z.string().uuid(),
        name: z.string().min(1),
        email: z.string().email(),
        age: z.number().int().nonnegative().optional(),
        role: this.userRole,
    });
}

export const userModels = new UserModels();

@Application({ namespace: "USER_DTOS", file: "user.dtos" })
class UserDtos extends Zod2XModel {
    createUserUseCaseDto = userModels.userEntity.omit({ id: true }).zod2x("CreateUserUseCaseDto");

    createUserUseCaseResultDto = userModels.userEntity
        .omit({ role: true })
        .extend({
            createdAt: z.date(),
            updatedAt: z.date(),
        })
        .zod2x("CreateUserUseCaseResultDto");
}

export const userDtos = new UserDtos();
