import { z } from "zod";
import { Zod2XTypes, extendZod, Zod2Ast, Zod2XTranspilers } from "../../dist";
extendZod(z);

import { describe, beforeAll, test } from "vitest";
import * as fs from "fs";

import { header } from "../common/header";
import { testOutput } from "../common/utils";
import { getSchemas, modelBuilder } from "../common/zod_schemas";
import { userModels, userDtos, userApi } from "../common/layered_schemas";
import { genericsApplication, genericsInfrastructure } from "../common/layered_generics";
import { zPySupportedSchemas } from "./py_supported_schemas";
import {
    pySupportedSchemasModel,
    pySupportedSchemasApplicationModel,
} from "./py_supported_schemas.layered";

const schemas = getSchemas();

let pySupportedSchemas: Zod2XTypes.ASTNodes;

describe("Zod2Py", () => {
    beforeAll(() => {
        pySupportedSchemas = new Zod2Ast({ strict: false }).build(zPySupportedSchemas);
    });

    test("Python supported schemas", () => {
        const output = new Zod2XTranspilers.Zod2Py({ header }).transpile(pySupportedSchemas);
        const expectedOutput = fs
            .readFileSync("./test/test_zod2py/class-expected/py_supported_schemas_pydantic.py")
            .toString();

        testOutput(
            output,
            expectedOutput,
            "./test/test_zod2py/class-expected/err-py_supported_schemas_pydantic.py"
        );
    });

    test("String Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zString));
        const output = new Zod2XTranspilers.Zod2Py({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "from pydantic import BaseModel, ConfigDict\n" +
            "from pydantic.alias_generators import to_camel\n\n" +
            "class BaseSchema(BaseModel):\n" +
            "    model_config = ConfigDict(\n" +
            "        alias_generator=to_camel,\n" +
            "        serialize_by_alias=True,\n" +
            "        populate_by_name=True,\n" +
            "        use_enum_values=True\n" +
            "    )\n\n" +
            "class ModelItem(BaseSchema):\n" +
            "    item: str\n";

        testOutput(output, expectedOutput);
    });

    test("Literal String Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zLiteralString));
        const output = new Zod2XTranspilers.Zod2Py({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "from pydantic import BaseModel, ConfigDict\n" +
            "from pydantic.alias_generators import to_camel\n" +
            "from typing import Literal\n\n" +
            "class BaseSchema(BaseModel):\n" +
            "    model_config = ConfigDict(\n" +
            "        alias_generator=to_camel,\n" +
            "        serialize_by_alias=True,\n" +
            "        populate_by_name=True,\n" +
            "        use_enum_values=True\n" +
            "    )\n\n" +
            "class ModelItem(BaseSchema):\n" +
            '    item: Literal["literal"]\n';

        testOutput(output, expectedOutput);
    });

    test("Literal Number Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zLiteralNumber));
        const output = new Zod2XTranspilers.Zod2Py({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "from pydantic import BaseModel, ConfigDict\n" +
            "from pydantic.alias_generators import to_camel\n" +
            "from typing import Literal\n\n" +
            "class BaseSchema(BaseModel):\n" +
            "    model_config = ConfigDict(\n" +
            "        alias_generator=to_camel,\n" +
            "        serialize_by_alias=True,\n" +
            "        populate_by_name=True,\n" +
            "        use_enum_values=True\n" +
            "    )\n\n" +
            "class ModelItem(BaseSchema):\n" +
            "    item: Literal[1]\n";

        testOutput(output, expectedOutput);
    });

    test("Enum Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zEnum));
        const output = new Zod2XTranspilers.Zod2Py({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "from enum import Enum\n" +
            "from pydantic import BaseModel, ConfigDict\n" +
            "from pydantic.alias_generators import to_camel\n\n" +
            "class EnumItem(str, Enum):\n" +
            '    ENUM1 = "Enum1"\n' +
            '    ENUM2 = "Enum2"\n' +
            '    ENUM3 = "Enum3"\n\n' +
            "class BaseSchema(BaseModel):\n" +
            "    model_config = ConfigDict(\n" +
            "        alias_generator=to_camel,\n" +
            "        serialize_by_alias=True,\n" +
            "        populate_by_name=True,\n" +
            "        use_enum_values=True\n" +
            "    )\n\n" +
            "class ModelItem(BaseSchema):\n" +
            "    item: EnumItem\n";

        testOutput(output, expectedOutput);
    });

    test("Native Enum Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zNativeEnum));
        const output = new Zod2XTranspilers.Zod2Py({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "from enum import Enum\n" +
            "from pydantic import BaseModel, ConfigDict\n" +
            "from pydantic.alias_generators import to_camel\n\n" +
            "class NativeEnumItem(Enum):\n" +
            "    NATIVE_ENUM1 = 1\n" +
            "    NATIVE_ENUM2 = 2\n" +
            '    NATIVE_ENUM3 = "NativeEnum3"\n\n' +
            "class BaseSchema(BaseModel):\n" +
            "    model_config = ConfigDict(\n" +
            "        alias_generator=to_camel,\n" +
            "        serialize_by_alias=True,\n" +
            "        populate_by_name=True,\n" +
            "        use_enum_values=True\n" +
            "    )\n\n" +
            "class ModelItem(BaseSchema):\n" +
            "    item: NativeEnumItem\n";

        testOutput(output, expectedOutput);
    });

    test("Number Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zDouble));
        const output = new Zod2XTranspilers.Zod2Py({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "from pydantic import BaseModel, ConfigDict\n" +
            "from pydantic.alias_generators import to_camel\n\n" +
            "class BaseSchema(BaseModel):\n" +
            "    model_config = ConfigDict(\n" +
            "        alias_generator=to_camel,\n" +
            "        serialize_by_alias=True,\n" +
            "        populate_by_name=True,\n" +
            "        use_enum_values=True\n" +
            "    )\n\n" +
            "class ModelItem(BaseSchema):\n" +
            "    item: float\n";

        testOutput(output, expectedOutput);
    });

    test("Boolean Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zBoolean));
        const output = new Zod2XTranspilers.Zod2Py({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "from pydantic import BaseModel, ConfigDict\n" +
            "from pydantic.alias_generators import to_camel\n\n" +
            "class BaseSchema(BaseModel):\n" +
            "    model_config = ConfigDict(\n" +
            "        alias_generator=to_camel,\n" +
            "        serialize_by_alias=True,\n" +
            "        populate_by_name=True,\n" +
            "        use_enum_values=True\n" +
            "    )\n\n" +
            "class ModelItem(BaseSchema):\n" +
            "    item: bool\n";

        testOutput(output, expectedOutput);
    });

    test("Date Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zDate));
        const output = new Zod2XTranspilers.Zod2Py({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "from datetime import datetime\n" +
            "from pydantic import BaseModel, ConfigDict\n" +
            "from pydantic.alias_generators import to_camel\n\n" +
            "class BaseSchema(BaseModel):\n" +
            "    model_config = ConfigDict(\n" +
            "        alias_generator=to_camel,\n" +
            "        serialize_by_alias=True,\n" +
            "        populate_by_name=True,\n" +
            "        use_enum_values=True\n" +
            "    )\n\n" +
            "class ModelItem(BaseSchema):\n" +
            "    item: datetime\n";

        testOutput(output, expectedOutput);
    });

    test("Array Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zArray2D));
        const output = new Zod2XTranspilers.Zod2Py({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "from pydantic import BaseModel, ConfigDict\n" +
            "from pydantic.alias_generators import to_camel\n" +
            "from typing import List\n\n" +
            "class BaseSchema(BaseModel):\n" +
            "    model_config = ConfigDict(\n" +
            "        alias_generator=to_camel,\n" +
            "        serialize_by_alias=True,\n" +
            "        populate_by_name=True,\n" +
            "        use_enum_values=True\n" +
            "    )\n\n" +
            "class ModelItem(BaseSchema):\n" +
            "    item: List[List[float]]\n";

        testOutput(output, expectedOutput);
    });

    test("Record Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zRecord));
        const output = new Zod2XTranspilers.Zod2Py({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "from pydantic import BaseModel, ConfigDict\n" +
            "from pydantic.alias_generators import to_camel\n" +
            "from typing import Dict\n\n" +
            "class BaseSchema(BaseModel):\n" +
            "    model_config = ConfigDict(\n" +
            "        alias_generator=to_camel,\n" +
            "        serialize_by_alias=True,\n" +
            "        populate_by_name=True,\n" +
            "        use_enum_values=True\n" +
            "    )\n\n" +
            "class ModelItem(BaseSchema):\n" +
            "    item: Dict[str, float]\n";

        testOutput(output, expectedOutput);
    });

    test("Map Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zMap));
        const output = new Zod2XTranspilers.Zod2Py({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "from pydantic import BaseModel, ConfigDict\n" +
            "from pydantic.alias_generators import to_camel\n" +
            "from typing import Dict\n\n" +
            "class BaseSchema(BaseModel):\n" +
            "    model_config = ConfigDict(\n" +
            "        alias_generator=to_camel,\n" +
            "        serialize_by_alias=True,\n" +
            "        populate_by_name=True,\n" +
            "        use_enum_values=True\n" +
            "    )\n\n" +
            "class ModelItem(BaseSchema):\n" +
            "    item: Dict[str, float]\n";

        testOutput(output, expectedOutput);
    });

    test("Set Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zSet));
        const output = new Zod2XTranspilers.Zod2Py({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "from pydantic import BaseModel, ConfigDict\n" +
            "from pydantic.alias_generators import to_camel\n" +
            "from typing import Set\n\n" +
            "class BaseSchema(BaseModel):\n" +
            "    model_config = ConfigDict(\n" +
            "        alias_generator=to_camel,\n" +
            "        serialize_by_alias=True,\n" +
            "        populate_by_name=True,\n" +
            "        use_enum_values=True\n" +
            "    )\n\n" +
            "class ModelItem(BaseSchema):\n" +
            "    item: Set[str]\n";

        testOutput(output, expectedOutput);
    });

    test("Tuple Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zTuple));
        const output = new Zod2XTranspilers.Zod2Py({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "from pydantic import BaseModel, ConfigDict\n" +
            "from pydantic.alias_generators import to_camel\n" +
            "from typing import Tuple\n\n" +
            "class BaseSchema(BaseModel):\n" +
            "    model_config = ConfigDict(\n" +
            "        alias_generator=to_camel,\n" +
            "        serialize_by_alias=True,\n" +
            "        populate_by_name=True,\n" +
            "        use_enum_values=True\n" +
            "    )\n\n" +
            "class ModelItem(BaseSchema):\n" +
            "    item: Tuple[float, float]\n";

        testOutput(output, expectedOutput);
    });

    test("Any Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zAny));
        const output = new Zod2XTranspilers.Zod2Py({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "from pydantic import BaseModel, ConfigDict\n" +
            "from pydantic.alias_generators import to_camel\n" +
            "from typing import Any\n\n" +
            "class BaseSchema(BaseModel):\n" +
            "    model_config = ConfigDict(\n" +
            "        alias_generator=to_camel,\n" +
            "        serialize_by_alias=True,\n" +
            "        populate_by_name=True,\n" +
            "        use_enum_values=True\n" +
            "    )\n\n" +
            "class ModelItem(BaseSchema):\n" +
            "    item: Any\n";

        testOutput(output, expectedOutput);
    });

    test("Optional Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zOptional));
        const output = new Zod2XTranspilers.Zod2Py({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "from pydantic import BaseModel, ConfigDict\n" +
            "from pydantic.alias_generators import to_camel\n" +
            "from typing import Optional\n\n" +
            "class BaseSchema(BaseModel):\n" +
            "    model_config = ConfigDict(\n" +
            "        alias_generator=to_camel,\n" +
            "        serialize_by_alias=True,\n" +
            "        populate_by_name=True,\n" +
            "        use_enum_values=True\n" +
            "    )\n\n" +
            "class ModelItem(BaseSchema):\n" +
            "    item: Optional[str] = None\n";

        testOutput(output, expectedOutput);
    });

    test("Nullable Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zNullable));
        const output = new Zod2XTranspilers.Zod2Py({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "from pydantic import BaseModel, ConfigDict\n" +
            "from pydantic.alias_generators import to_camel\n" +
            "from typing import Optional\n\n" +
            "class BaseSchema(BaseModel):\n" +
            "    model_config = ConfigDict(\n" +
            "        alias_generator=to_camel,\n" +
            "        serialize_by_alias=True,\n" +
            "        populate_by_name=True,\n" +
            "        use_enum_values=True\n" +
            "    )\n\n" +
            "class ModelItem(BaseSchema):\n" +
            "    item: Optional[str] = None\n";

        testOutput(output, expectedOutput);
    });

    test("Python layered modeling supported schemas - entity", () => {
        const output = pySupportedSchemasModel.transpile(
            Zod2XTranspilers.Zod2Py,
            { header },
            { strict: false }
        );
        const expectedOutput = fs
            .readFileSync("./test/test_zod2py/class-expected/py_supported_schemas_entity.py")
            .toString();

        testOutput(
            output,
            expectedOutput,
            "./test/test_zod2py/class-expected/err-py_supported_schemas_entity.py"
        );
    });

    test("Python layered modeling supported schemas - application", () => {
        const output = pySupportedSchemasApplicationModel.transpile(
            Zod2XTranspilers.Zod2Py,
            { header },
            { strict: false }
        );
        const expectedOutput = fs
            .readFileSync("./test/test_zod2py/class-expected/py_supported_schemas_app.py")
            .toString();

        testOutput(
            output,
            expectedOutput,
            "./test/test_zod2py/class-expected/err-py_supported_schemas_app.py"
        );
    });

    test("Python layered modeling - domain", () => {
        const output = userModels.transpile(Zod2XTranspilers.Zod2Py, { header }, { strict: false });
        const expectedOutput = fs
            .readFileSync("./test/test_zod2py/class-expected/user_entity.py")
            .toString();

        testOutput(output, expectedOutput, "./test/test_zod2py/class-expected/err-user_entity.py");
    });

    test("Python layered modeling - application", () => {
        const output = userDtos.transpile(Zod2XTranspilers.Zod2Py, { header }, { strict: false });
        const expectedOutput = fs
            .readFileSync("./test/test_zod2py/class-expected/user_dtos.py")
            .toString();

        testOutput(output, expectedOutput, "./test/test_zod2py/class-expected/err-user_dtos.py");
    });

    test("Python layered modeling - infrastructure", () => {
        const output = userApi.transpile(Zod2XTranspilers.Zod2Py, { header }, { strict: false });
        const expectedOutput = fs
            .readFileSync("./test/test_zod2py/class-expected/user_api.py")
            .toString();

        testOutput(output, expectedOutput, "./test/test_zod2py/class-expected/err-user_api.py");
    });

    test("Python layered modeling generics - application", () => {
        const output = genericsApplication.transpile(
            Zod2XTranspilers.Zod2Py,
            { header },
            { strict: false }
        );
        const expectedOutput = fs
            .readFileSync("./test/test_zod2py/class-expected/layered_generics_app.py")
            .toString();

        testOutput(
            output,
            expectedOutput,
            "./test/test_zod2py/class-expected/err-layered_generics_app.py"
        );
    });

    test("Python layered modeling generics - infrastructure", () => {
        const output = genericsInfrastructure.transpile(
            Zod2XTranspilers.Zod2Py,
            { header },
            { strict: false }
        );
        const expectedOutput = fs
            .readFileSync("./test/test_zod2py/class-expected/layered_generics_infra.py")
            .toString();

        testOutput(
            output,
            expectedOutput,
            "./test/test_zod2py/class-expected/err-layered_generics_infra.py"
        );
    });
});
