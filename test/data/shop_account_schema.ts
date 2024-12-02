import { z } from "zod";

const StatusEnum = z.enum(["ACTIVE", "INACTIVE", "PENDING"]).zod2x("Status");

const AddressSchema = z.object({
  street: z.string().max(255),
  city: z.string().max(100),
  state: z.string().max(100),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/), // ZIP Code format
}).zod2x("Address");

const PreferencesSchema = z.object({
  theme: z.string().min(1),
  notificationsEnabled: z.boolean(),
}).zod2x("Preferences");

const OrderSchema = z.object({
  orderId: z.string().uuid(),
  productIds: z.array(z.string().uuid()),
  total: z.number().min(0),
  currency: z.string().length(3), // 3-letter currency code (ISO 4217)
  purchasedAt: z.string().datetime(),
}).zod2x("Order");

const EmailContactSchema = z.object({
  contactType: z.literal("email"),
  email: z.string().email(),
}).zod2x("EmailContact");

const PhoneContactSchema = z.object({
  contactType: z.literal("phone"),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/), // Phone contact in E.164 format
}).zod2x("PhoneContact");

const SocialContactSchema = z.object({
  contactType: z.literal("social"),
  platform: z.string().min(1),
  username: z.string().min(1),
}).zod2x("SocialContact");

const ContactInfoSchema = z.union([
  EmailContactSchema,
  PhoneContactSchema,
  SocialContactSchema,
]).zod2x("ContactInfo");

const CreditCardSchema = z.object({
  methodType: z.literal("creditCard"),
  cardNumber: z.string().regex(/^\d{16}$/), // 16-digit credit card number
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/), // MM/YY format
}).zod2x("CreditCard");

const PayPalSchema = z.object({
  methodType: z.literal("paypal"),
  email: z.string().email(),
}).zod2x("PayPal");

const BankTransferSchema = z.object({
  methodType: z.literal("bankTransfer"),
  accountNumber: z.string().min(1),
  bankName: z.string().min(1),
}).zod2x("BankTransfer");

const PaymentMethodSchema = z.union([
  CreditCardSchema,
  PayPalSchema,
  BankTransferSchema,
]).zod2x("PaymentMethod");

// Main Schema
export const ShopAccountModel = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  age: z.number().int().min(0),
  isAdmin: z.boolean(),
  createdAt: z.string().datetime(),
  scores: z.array(z.number()),
  preferences: PreferencesSchema,
  tags: z.array(z.string().min(1)),
  metadata: z.record(z.string(), z.string()),
  status: StatusEnum,
  address: AddressSchema,
  orders: z.array(OrderSchema),
  contactInfo: ContactInfoSchema,
  paymentMethod: PaymentMethodSchema,
}).zod2x("ShopAccount");