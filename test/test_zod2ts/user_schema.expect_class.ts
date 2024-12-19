export enum SubscriptionType {
    free = "free",
    premium = "premium",
    enterprise = "enterprise",
}

export class UserAddress {
    street: string;
    city: string;
    zipCode: string | null;

    constructor(data: UserAddress) {
        this.street = data.street;
        this.city = data.city;
        this.zipCode = data.zipCode;
    }
}

export type UserRole = "admin" | "editor" | "viewer";

// This is a UserStatus enumerate description.
export enum UserStatus {
    active = "active",
    inactive = "inactive",
    pending = "pending",
}

export class UserVisualPreferences {
    theme: string;
    notificationsEnabled: boolean;

    constructor(data: UserVisualPreferences) {
        this.theme = data.theme;
        this.notificationsEnabled = data.notificationsEnabled;
    }
}

export class UserRegionalPreferences {
    language: string;
    timeZone?: string;

    constructor(data: UserRegionalPreferences) {
        this.language = data.language;
        this.timeZone = data.timeZone;
    }
}

export class FreeSubscription {
    subscriptionType: "free";
    startDate: Date;
    endDate: Date | null;
    adsEnabled: boolean;

    constructor(data: FreeSubscription) {
        this.subscriptionType = data.subscriptionType;
        this.startDate = data.startDate;
        this.endDate = data.endDate;
        this.adsEnabled = data.adsEnabled;
    }
}

export class PremiumSubscription {
    subscriptionType: "premium";
    startDate: Date;
    endDate: Date | null;
    maxDevices: number;
    hdStreaming: boolean;

    constructor(data: PremiumSubscription) {
        this.subscriptionType = data.subscriptionType;
        this.startDate = data.startDate;
        this.endDate = data.endDate;
        this.maxDevices = data.maxDevices;
        this.hdStreaming = data.hdStreaming;
    }
}

export enum SupportPriority {
    standard = "standard",
    priority = "priority",
    dedicated = "dedicated",
}

export class EnterpriseSubscription {
    subscriptionType: "enterprise";
    startDate: Date;
    endDate: Date | null;
    companyName: string;
    userLimit: number;
    supportPriority: SupportPriority;

    constructor(data: EnterpriseSubscription) {
        this.subscriptionType = data.subscriptionType;
        this.startDate = data.startDate;
        this.endDate = data.endDate;
        this.companyName = data.companyName;
        this.userLimit = data.userLimit;
        this.supportPriority = data.supportPriority;
    }
}

export type Subscription = FreeSubscription | PremiumSubscription | EnterpriseSubscription;

// This is a UserModel interface description.
export class UserModel {
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

    // This is a Notes attribute description.
    notes?: string[];
    friends?: UserModel[] | null;
    subscription: Subscription;

    constructor(data: UserModel) {
        this.name = data.name;
        this.age = data.age;
        this.email = data.email;
        this.address = data.address;
        this.phoneNumbers = data.phoneNumbers;
        this.favoriteColors = data.favoriteColors;
        this.roles = data.roles;
        this.status = data.status;
        this.metadata = data.metadata;
        this.tags = data.tags;
        this.preferences = data.preferences;
        this.lastLogin = data.lastLogin;
        this.notes = data.notes;
        this.friends = data.friends;
        this.subscription = data.subscription;
    }
}