import { z } from "zod/v4";
import { Application, Zod2XMixin, Zod2XModel } from "../../dist";
import { userModels } from "./layered_schemas";

class CreateUserUseCaseDto {
    createUserUseCaseDto = userModels.userEntity.omit({ id: true });
}

class CreateUserUseCaseResultDto {
    createUserUseCaseResultDto = userModels.userEntity.omit({ role: true }).extend({
        createdAt: z.date(),
        updatedAt: z.date(),
    });
}

@Application({ namespace: "USER_DTOS", file: "user.dtos", skipLayerInterface: false })
class UserDtos extends Zod2XMixin([CreateUserUseCaseDto, CreateUserUseCaseResultDto], Zod2XModel) {
    updateUserUseCaseDto = this.createUserUseCaseDto;
    updateUserUseCaseResultDto = userModels.userEntity;
}

export const userDtos = new UserDtos();
