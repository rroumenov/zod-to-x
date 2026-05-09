import { z } from "zod";
import { extendZod, Zod2XTranspilers } from "../dist";
import { userModels, userDtos, userApi } from "../test/common/layered_schemas";
import { genericsApplication, genericsInfrastructure } from "../test/common/layered_generics";
import { header } from "../test/common/header";
import * as fs from "fs";

extendZod(z);

const opts = { strict: false };

const files: [string, string][] = [
    [
        "./test/test_zod2go/struct-expected/user.entity.go",
        userModels.transpile(Zod2XTranspilers.Zod2Go, { header }, opts),
    ],
    [
        "./test/test_zod2go/struct-expected/user.dtos.go",
        userDtos.transpile(Zod2XTranspilers.Zod2Go, { header }, opts),
    ],
    [
        "./test/test_zod2go/struct-expected/user.api.go",
        userApi.transpile(Zod2XTranspilers.Zod2Go, { header }, opts),
    ],
    [
        "./test/test_zod2go/struct-expected/layered_generics.app.go",
        genericsApplication.transpile(Zod2XTranspilers.Zod2Go, { header }, opts),
    ],
    [
        "./test/test_zod2go/struct-expected/layered_generics.infra.go",
        genericsInfrastructure.transpile(Zod2XTranspilers.Zod2Go, { header }, opts),
    ],
];

for (const [path, content] of files) {
    fs.writeFileSync(path, content);
    console.log(`=== ${path} ===`);
    console.log(content);
    console.log();
}
