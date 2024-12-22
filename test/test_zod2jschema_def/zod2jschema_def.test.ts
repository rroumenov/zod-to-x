import { z } from "zod";
import { extendZod, zod2JsonSchemaDefinitions } from "../../dist";
extendZod(z);

import { diffLinesRaw } from "jest-diff";

import { UserModel } from "../data/user_schema";

describe("zod2JsonSchemaDefinitions", () => {
    test("User model definitions", () => {
        const userDefinitions = zod2JsonSchemaDefinitions(UserModel);

        const expectedDefinitions = [
            "UserAddress",
            "UserRole",
            "UserStatus",
            "UserVisualPreferences",
            "UserRegionalPreferences",
            "FreeSubscription",
            "PremiumSubscription",
            "SupportPriority",
            "EnterpriseSubscription",
            "Subscription",
            "UserModel",
        ];

        const currentDefinitions = Object.keys(userDefinitions);

        try {
            expect(currentDefinitions.length).toBe(expectedDefinitions.length);

            expectedDefinitions.forEach((i) => {
                expect(currentDefinitions.includes(i)).toBe(true);
            });
        } catch (error) {
            diffLinesRaw(currentDefinitions, expectedDefinitions);
            throw error;
        }
    });
});
