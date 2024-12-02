export enum SubscriptionType {
    free = "free",
    premium = "premium",
    enterprise = "enterprise",
}

export interface UserAddress {
    street: string;
    city: string;
    zipCode: string | null;
}

export type UserRole = "admin" | "editor" | "viewer";

/** This is a UserStatus enumerate description. */
export enum UserStatus {
    active = "active",
    inactive = "inactive",
    pending = "pending",
}

export interface UserVisualPreferences {
    theme: string;
    notificationsEnabled: boolean;
}

export interface UserRegionalPreferences {
    language: string;
    timeZone?: string;
}

export interface FreeSubscription {
    subscriptionType: "free";
    startDate: Date;
    endDate: Date | null;
    adsEnabled: boolean;
}

export interface PremiumSubscription {
    subscriptionType: "premium";
    startDate: Date;
    endDate: Date | null;
    maxDevices: number;
    hdStreaming: boolean;
}

export enum SupportPriority {
    standard = "standard",
    priority = "priority",
    dedicated = "dedicated",
}

export interface EnterpriseSubscription {
    subscriptionType: "enterprise";
    startDate: Date;
    endDate: Date | null;
    companyName: string;
    userLimit: number;
    supportPriority: SupportPriority;
}

export type Subscription = FreeSubscription | PremiumSubscription | EnterpriseSubscription;

/** This is a UserModel interface description. */
export interface UserModel {
    name: string;
    age?: number;
    email?: string | null;
    address: UserAddress;
    phoneNumbers: string[];
    favoriteColors: Set<string>;
    roles: UserRole[];
    status: UserStatus;
    metadata: Record<string, any>;
    tags: (string | number | boolean)[];
    preferences: UserVisualPreferences & UserRegionalPreferences;
    lastLogin: Date | null;

    /** This is a Notes attribute description. */
    notes?: string[];
    friends?: UserModel[] | null;
    subscription: Subscription;
}