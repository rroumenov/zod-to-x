import { z } from "zod/v4";
import { Application, Domain, Infrastructure, Zod2XModel } from "../../dist";

@Domain({ namespace: "USER", file: "user.entity", skipLayerInterface: false })
class UserModels extends Zod2XModel {
    userRole = z.enum(["Admin", "User"]);

    userEntity = z.object({
        id: z.uuid(),
        name: z.string().min(1),
        email: z.email(),
        age: z.number().int().nonnegative().optional(),
        role: this.userRole,
    });
}

export const userModels = new UserModels();

@Application({ namespace: "USER_DTOS", file: "user.dtos", skipLayerInterface: false })
class UserDtos extends Zod2XModel {
    createUserUseCaseDto = userModels.userEntity.omit({ id: true });

    createUserUseCaseResultDto = userModels.userEntity.omit({ role: true }).extend({
        createdAt: z.date(),
        updatedAt: z.date(),
    });

    updateUserUseCaseDto = this.createUserUseCaseDto;
    updateUserUseCaseResultDto = userModels.userEntity;
}

export const userDtos = new UserDtos();

@Infrastructure({ namespace: "USER_API", file: "user.api", skipLayerInterface: false })
class UserApi extends Zod2XModel {
    reqUpdateUser = userDtos.updateUserUseCaseDto;
    resUpdateUser = userDtos.updateUserUseCaseResultDto;

    resUpdateUserMulti = z.object({
        amount: z.number().int().nonnegative(),
        data: z.array(userDtos.updateUserUseCaseResultDto),
    });
}

export const userApi = new UserApi();
