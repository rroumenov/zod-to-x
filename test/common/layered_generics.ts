import z from "zod";
import {
    Application,
    createGenericType,
    Infrastructure,
    useGenericType,
    Zod2XModel,
} from "../../dist";

@Application({
    namespace: "GENERICS_APP",
    file: "layered_generics.app",
})
class GenericsApplication extends Zod2XModel {
    readonly GenericUserEntity = z
        .object({
            id: z.string(),
            name: z.string(),
            email: z.string().email(),
            age: z.number().int().nonnegative().optional(),
            metadata: createGenericType("T"),
        })
        .describe("GenericUserEntity");

    readonly NormalUserMetadata = z
        .object({
            favoriteColor: z.string(),
            hobbies: z.array(z.string()),
        })
        .describe("NormalUserMetadata");

    readonly NormalUserEntity = useGenericType(this.GenericUserEntity, {
        metadata: this.NormalUserMetadata,
    });

    readonly AdminUserMetadata = z
        .object({
            adminLevel: z.number().int().nonnegative(),
            permissions: z.array(z.string()),
        })
        .describe("AdminUserMetadata");

    readonly AdminUserEntity = useGenericType(this.GenericUserEntity, {
        metadata: this.AdminUserMetadata,
    });

    readonly RecordStringAny = z.record(z.any());

    readonly UserEntities = z
        .union([
            z.lazy(() => this.NormalUserEntity),
            z.lazy(() => this.AdminUserEntity),
            useGenericType(this.GenericUserEntity, {
                metadata: this.RecordStringAny,
            }),
        ])
        .describe("UserEntities");
}

export const genericsApplication = new GenericsApplication();

@Infrastructure({
    namespace: "GENERICS_INFRA",
    file: "layered_generics.infra",
})
class GenericsInfrastructure extends Zod2XModel {
    readonly HttpSuccessfulResponse = z.object({
        success: z.literal(true),
        data: createGenericType("T"),
    });

    readonly HttpUnsuccessfulResponse = z.object({
        success: z.literal(false),
        message: z.string(),
        details: z.record(z.any()).optional(),
    });

    readonly HttpErrorResponse = z.object({
        message: z.string(),
    });

    readonly SomeDtoResult = z.object({
        id: z.string(),
        name: z.string(),
        age: z.number().int().nonnegative(),
    });

    readonly InternalObjectWithGeneric = useGenericType(this.HttpSuccessfulResponse, {
        data: this.SomeDtoResult,
    });

    readonly ObjectWithGeneric = z.object({
        internal: z.lazy(() => this.InternalObjectWithGeneric),
        item: useGenericType(this.HttpSuccessfulResponse, { data: this.SomeDtoResult }),
        userItem: useGenericType(genericsApplication.GenericUserEntity, {
            metadata: this.SomeDtoResult,
        }),
        otherUserItem: z.lazy(() => genericsApplication.AdminUserEntity),
    });

    readonly OtherDtoResult = z.object({
        code: z.string(),
        description: z.string(),
    });

    readonly DataRetrieve = useGenericType(this.HttpSuccessfulResponse, {
        data: this.SomeDtoResult,
    });

    readonly DiscriminantDataRetrieve = z.lazy(() =>
        z.discriminatedUnion("success", [
            useGenericType(this.HttpSuccessfulResponse, { data: this.SomeDtoResult }, true),
            this.HttpUnsuccessfulResponse,
        ])
    );

    readonly IntersectedDataRetrieve = z.lazy(() =>
        z.intersection(
            useGenericType(this.HttpSuccessfulResponse, { data: this.SomeDtoResult }, true),
            useGenericType(
                genericsApplication.GenericUserEntity,
                { metadata: this.OtherDtoResult },
                true
            )
        )
    );

    readonly UserRetrieve = useGenericType(this.HttpSuccessfulResponse, {
        data: genericsApplication.NormalUserEntity,
    });
}

export const genericsInfrastructure = new GenericsInfrastructure();
