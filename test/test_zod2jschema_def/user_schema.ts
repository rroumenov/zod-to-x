import { z, ZodType } from "zod";
import { extendZod } from "../../dist";
extendZod(z);

const Name = z.string();
const Age = z.number().int();
const Email = z.string().email().nullable();
const PhoneNumber = z.string();

const Address = z
    .object({
        street: z.string(),
        city: z.string(),
        zipCode: z.string().nullable(),
    })
    .zod2x("UserAddress");

const UserRole = z
    .union([z.literal("admin"), z.literal("editor"), z.literal("viewer")])
    .zod2x("UserRole");

const StatusEnum = z
    .enum(["active", "inactive", "pending"])
    .describe("This is a UserStatus enumerate description.")
    .zod2x("UserStatus");

const VisualPreferences = z
    .object({
        theme: z.string(),
        notificationsEnabled: z.boolean(),
    })
    .zod2x("UserVisualPreferences");

const RegionalPreferences = z
    .object({
        language: z.string(),
        timeZone: z.string().optional(),
    })
    .zod2x("UserRegionalPreferences");

const Preferences = z.intersection(VisualPreferences, RegionalPreferences);

const Tag = z.union([z.string(), z.number(), z.boolean()]);

const Metadata = z.record(z.string(), z.any());

const SubscriptionType = z.enum(["free", "premium", "enterprise"]).zod2x("SubscriptionType");

const CommonSubscription = z
    .object({
        subscriptionType: SubscriptionType,
        startDate: z.date(),
        endDate: z.date().nullable(),
    })
    .zod2x("CommonSubscription");

const FreeSubscription = CommonSubscription.extend({
    subscriptionType: z.literal("free").zod2x(SubscriptionType),
    adsEnabled: z.boolean(),
}).zod2x("FreeSubscription");

const PremiumSubscription = CommonSubscription.extend({
    subscriptionType: z.literal("premium").zod2x(SubscriptionType),
    maxDevices: z.number().int().positive(),
    hdStreaming: z.boolean(),
}).zod2x("PremiumSubscription");

const SupportPriority = z.enum(["standard", "priority", "dedicated"]).zod2x("SupportPriority");

const EnterpriseSubscription = CommonSubscription.extend({
    subscriptionType: z.literal("enterprise").zod2x(SubscriptionType),
    companyName: z.string(),
    userLimit: z.number().int().positive(),
    supportPriority: SupportPriority,
}).zod2x("EnterpriseSubscription");

const Subscription = z
    .discriminatedUnion("subscriptionType", [
        FreeSubscription,
        PremiumSubscription,
        EnterpriseSubscription,
    ])
    .zod2x({ typeName: "Subscription" });

export const UserModel = z
    .object({
        name: Name,
        age: Age.optional(),
        email: Email.optional(),
        address: Address,
        phoneNumbers: z.array(PhoneNumber),
        favoriteColors: z.set(z.string()),
        roles: z.array(UserRole),
        status: StatusEnum,
        metadata: Metadata,
        tags: z.array(Tag),
        preferences: Preferences,
        lastLogin: z.date().nullable(),
        notes: z.array(z.string()).optional().describe("This is a Notes attribute description."),
        friends: z.lazy((): ZodType => UserModel.array().optional().nullable()),
        subscription: Subscription,
    })
    .zod2x("UserModel");
