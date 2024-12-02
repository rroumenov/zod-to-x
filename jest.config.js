/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.test.tsx?$": ["ts-jest", {}],
  },
};