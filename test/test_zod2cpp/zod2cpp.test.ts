import { z } from "zod";
import { extendZod, ASTNodes, Zod2Ast, Zod2Cpp } from "../../dist";
extendZod(z);

import * as fs from 'fs';
import { diffLinesRaw } from "jest-diff";

import { header } from "../data/header";
import { ShopAccountModel } from "../data/shop_account_schema";

let shopAccountNodes: ASTNodes;

describe('Zod2Cpp', () => {

    beforeAll(() => {
        shopAccountNodes = new Zod2Ast().build(ShopAccountModel);
    });

    test('Shop Account as class', () => {
        const output = new Zod2Cpp({outType: "class", header}).transpile(shopAccountNodes);
        const expectedOutput =
            fs.readFileSync("./test/test_zod2cpp/shop_account_schema.expect.class.hpp").toString();
        
        try {
            expect(output.trim()).toBe(expectedOutput.trim());
        }
        catch(error) {
            diffLinesRaw(output.split('\n'), expectedOutput.split('\n'));
            fs.writeFileSync("./test/test_zod2cpp/err-shop_account_schema.expect.class.hpp", output);
            throw error;
        }
    });

    test('Shop Account as struct', () => {
        const output = new Zod2Cpp({outType: "struct", header}).transpile(shopAccountNodes);
        const expectedOutput =
            fs.readFileSync("./test/test_zod2cpp/shop_account_schema.expect.struct.hpp").toString();
        
        try {
            expect(output.trim()).toBe(expectedOutput.trim());
        }
        catch(error) {
            diffLinesRaw(output.split('\n'), expectedOutput.split('\n'));
            fs.writeFileSync("./test/test_zod2cpp/err-shop_account_schema.expect.struct.hpp", output);
            throw error;
        }
    });
});