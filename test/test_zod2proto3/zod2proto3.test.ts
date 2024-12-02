import { z } from "zod";
import { extendZod, ASTNodes, Zod2Ast, Zod2ProtoV3 } from "../../dist";
extendZod(z);

import * as fs from 'fs';
import { diffLinesRaw } from "jest-diff";
import * as pb from "protobufjs";

import { BasicTypes } from "../data/basic_schemas";
import { ShopAccountModel } from "../data/shop_account_schema";

let shopAccountNodes: ASTNodes;

describe('Zod2Proto3', () => {

    beforeAll(() => {
        shopAccountNodes = new Zod2Ast().build(ShopAccountModel);
    });
  
    test('Basic Types', () => {
        // Validate that expected proto file is a valid one.
        pb.loadSync("./test/test_zod2proto3/basic_schemas.expect.proto");

        const basicTypesNodes = new Zod2Ast().build(BasicTypes);
        const output = new Zod2ProtoV3().transpile(basicTypesNodes);
        const expectedOutput = fs.readFileSync("./test/test_zod2proto3/basic_schemas.expect.proto").toString();
        
        try {
            expect(output.trim()).toBe(expectedOutput.trim());
        }
        catch(error) {
            diffLinesRaw(output.split('\n'), expectedOutput.split('\n'));
            throw error;
        }
    });

    test('Shop Account', () => {
        // Validate that expected proto file is a valid one.
        pb.loadSync("./test/test_zod2proto3/shop_account_schema.expect.proto");

        const output = new Zod2ProtoV3({packageName: "shopaccount"}).transpile(shopAccountNodes);
        const expectedOutput =
            fs.readFileSync("./test/test_zod2proto3/shop_account_schema.expect.proto").toString();
        
        try {
            expect(output.trim()).toBe(expectedOutput.trim());
        }
        catch(error) {
            diffLinesRaw(output.split('\n'), expectedOutput.split('\n'));
            throw error;
        }
    });

    test('Shop Account camelCase', () => {
        // Validate that expected proto file is a valid one.
        pb.loadSync("./test/test_zod2proto3/shop_account_schema.expect_camel.proto");

        const output = new Zod2ProtoV3({packageName: "shopaccount", useCamelCase: true})
                            .transpile(shopAccountNodes);
        const expectedOutput =
            fs.readFileSync("./test/test_zod2proto3/shop_account_schema.expect_camel.proto").toString();
        
        try {
            expect(output.trim()).toBe(expectedOutput.trim());
        }
        catch(error) {
            diffLinesRaw(output.split('\n'), expectedOutput.split('\n'));
            throw error;
        }
    });
  });