/**
 * Script to generate Dart expected output files from the Dart transpiler.
 * Run after `npm run build`:  npx ts-node -r tsconfig-paths/register test_dev/generate_dart_expected.ts
 * Or simply: node -e "require('./dist/index')" -- see below.
 *
 * Usage: npx vite-node test_dev/generate_dart_expected.ts
 */
import { z } from "zod";
import { extendZod, Zod2Ast, Zod2XTranspilers } from "../dist";
import { userModels, userDtos, userApi } from "../test/common/layered_schemas";
import { genericsApplication, genericsInfrastructure } from "../test/common/layered_generics";
import * as fs from "fs";
import * as path from "path";

extendZod(z);

// Reimport schemas inline since test files require dist to be built
import { getDartSupportedSchemas } from "../test/test_zod2dart/dart_supported_schemas";
import {
    dartSupportedSchemasModel,
    dartSupportedSchemasApplicationModel,
} from "../test/test_zod2dart/dart_supported_schemas.layered";
import { header } from "../test/common/header";

const OUT = "./test/test_zod2dart/class-expected";
fs.mkdirSync(OUT, { recursive: true });

function write(filename: string, content: string) {
    const p = path.join(OUT, filename);
    fs.writeFileSync(p, content);
    console.log(`  wrote ${p}`);
}

// Flat supported schemas
const ast = new Zod2Ast({ strict: false }).build(
    (() => {
        const s = getDartSupportedSchemas();
        return z.object(s).zod2x("DartSupportedSchemas");
    })()
);
write(
    "dart_supported_schemas.dart",
    new Zod2XTranspilers.Zod2Dart({ header, partFile: "dart_supported_schemas" }).transpile(ast)
);

// Layered schemas
write(
    "user.entity.dart",
    userModels.transpile(Zod2XTranspilers.Zod2Dart, { header }, { strict: false })
);
write(
    "user.dtos.dart",
    userDtos.transpile(Zod2XTranspilers.Zod2Dart, { header }, { strict: false })
);
write("user.api.dart", userApi.transpile(Zod2XTranspilers.Zod2Dart, { header }, { strict: false }));
write(
    "dart_supported_schemas_entity.dart",
    dartSupportedSchemasModel.transpile(Zod2XTranspilers.Zod2Dart, {}, { strict: false })
);
write(
    "dart_supported_schemas_app.dart",
    dartSupportedSchemasApplicationModel.transpile(Zod2XTranspilers.Zod2Dart, {}, { strict: false })
);
write(
    "layered_generics.app.dart",
    genericsApplication.transpile(Zod2XTranspilers.Zod2Dart, { header }, { strict: false })
);
write(
    "layered_generics.infra.dart",
    genericsInfrastructure.transpile(Zod2XTranspilers.Zod2Dart, { header }, { strict: false })
);

// Issue test expected files
import { userDtos as case1UserDtos } from "../test/test_issues/no_id/1/case_1";
import { userDtos as case2UserDtos } from "../test/test_issues/no_id/2/case_2";
import { weatherServiceApi as case3Api } from "../test/test_issues/no_id/3/case_3";
import { errorCodesModels } from "../test/test_issues/no_id/4/case_4";
import { case6App } from "../test/test_issues/no_id/6/case_6";

function writeIssue(caseN: number, filename: string, content: string) {
    const dir = `./test/test_issues/no_id/${caseN}/class-expected`;
    fs.mkdirSync(dir, { recursive: true });
    const p = path.join(dir, filename);
    fs.writeFileSync(p, content);
    console.log(`  wrote ${p}`);
}

writeIssue(1, "case_1.expected_dart.dart", case1UserDtos.transpile(Zod2XTranspilers.Zod2Dart));
writeIssue(2, "case_2.expected_dart.dart", case2UserDtos.transpile(Zod2XTranspilers.Zod2Dart));
writeIssue(3, "case_3.expected_dart.dart", case3Api.transpile(Zod2XTranspilers.Zod2Dart));
writeIssue(4, "case_4.expected_dart.dart", errorCodesModels.transpile(Zod2XTranspilers.Zod2Dart));
writeIssue(6, "case_6.expected_dart.dart", case6App.transpile(Zod2XTranspilers.Zod2Dart));

console.log("Done.");
