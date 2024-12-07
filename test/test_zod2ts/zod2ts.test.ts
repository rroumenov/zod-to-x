import { z } from "zod";
import { extendZod, ASTNodes, Zod2Ast, Zod2Ts } from "../../dist";
extendZod(z);

import * as fs from 'fs';
import { diffLinesRaw } from "jest-diff";

import { BasicTypes } from "../data/basic_schemas";
import { header } from "../data/header";
import { UserModel } from "../data/user_schema";

let basicTypesQueue: ASTNodes;
let userModelQueue: ASTNodes;

describe('Zod2Ts', () => {

    beforeAll(() => {
        basicTypesQueue = new Zod2Ast().build(BasicTypes);
        userModelQueue = new Zod2Ast().build(UserModel);
    });
  
    test('Basic Types as interface', () => {
        const output = new Zod2Ts({header}).transpile(basicTypesQueue);
        const expectedOutput = fs.readFileSync("./test/test_zod2ts/basic_schemas.expect.ts").toString();
        
        try {
            expect(output.trim()).toBe(expectedOutput.trim());
        }
        catch(error) {
            diffLinesRaw(output.split('\n'), expectedOutput.split('\n'));
            fs.writeFileSync("./test/test_zod2ts/err-basic_schemas.ts", output);
            throw error;
        }
    });
  
    test('Basic Types as class', () => {
        const output = new Zod2Ts({outType: "class", header}).transpile(basicTypesQueue);
        const expectedOutput = fs.readFileSync("./test/test_zod2ts/basic_schemas.expect_class.ts").toString();
        
        try {
            expect(output.trim()).toBe(expectedOutput.trim());
        }
        catch(error) {
            diffLinesRaw(output.split('\n'), expectedOutput.split('\n'));
            fs.writeFileSync("./test/test_zod2ts/err-basic_schemas-class.ts", output);
            throw error;
        }
    });

    test('User Schema as interface', () => {
        const output = new Zod2Ts().transpile(userModelQueue);
        const expectedOutput = fs.readFileSync("./test/test_zod2ts/user_schema.expect.ts").toString();
        
        try {
            expect(output.trim()).toBe(expectedOutput.trim());
        }
        catch(error) {
            diffLinesRaw(expectedOutput.split('\n'), output.split('\n'));
            fs.writeFileSync("./test/test_zod2ts/err-user_schema.ts", output);
            throw error;
        }
    });

    test('User Schema as class', () => {
        const output = new Zod2Ts({outType: "class"}).transpile(userModelQueue);
        const expectedOutput = fs.readFileSync("./test/test_zod2ts/user_schema.expect_class.ts").toString();
        
        try {
            expect(output.trim()).toBe(expectedOutput.trim());
        }
        catch(error) {
            diffLinesRaw(expectedOutput.split('\n'), output.split('\n'));
            fs.writeFileSync("./test/test_zod2ts/err-user_schema-class.ts", output);
            throw error;
        }
    });
  });