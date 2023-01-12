// let assert = require("chai").assert;
import {
  getMonthDateFromString,
  firstDayOfMonth,
  lastDayOfMonth,
  nextDay,
  calculateDaysActive,
  calculateUserCharge,
  monthlyCharge,
} from "./index.js";

const users = [
  {
    id: 1,
    name: "Employee #1",
    activatedOn: new Date(2020, 0, 1, 0, 0, 0, 0), // 2020-01-01
    deactivatedOn: null,
    customerId: 1,
  },
  {
    id: 2,
    name: "Employee #2",
    activatedOn: new Date(2020, 11, 14, 0, 0, 0, 0), // 2020-12-14
    deactivatedOn: null,
    customerId: 1,
  },
  {
    id: 3,
    name: "Employee #3",
    activatedOn: new Date(2020, 0, 1, 0, 0, 0, 0), // 2020-01-01
    deactivatedOn: new Date(2020, 11, 20, 0, 0, 0, 0), // 2020-12-20,
    customerId: 1,
  },
  {
    id: 3,
    name: "Employee #4",
    activatedOn: new Date(2020, 11, 3, 0, 0, 0, 0), // 2020-12-03
    deactivatedOn: new Date(2020, 11, 25, 0, 0, 0, 0), // 2020-12-25,
    customerId: 1,
  },
];

const plan = {
  id: 1,
  customerId: 1,
  monthlyPriceInCents: 5000,
};

test("Creates date from month string", function () {
  const monthDate = getMonthDateFromString("2020-12");
  // should return a Date
  expect(
    typeof monthDate === "object" && typeof monthDate.getMonth === "function"
  ).toBe(true);

  expect(monthDate.getMonth()).toBe(11); // zero based
});

test("Gets first day of month", function () {
  const monthDate = getMonthDateFromString("2020-12");
  const firstOf = firstDayOfMonth(monthDate);

  expect(firstOf.getMonth()).toBe(11);
  expect(firstOf.getDate()).toBe(1);
});

test("Gets last day of month", function () {
  const monthDate = getMonthDateFromString("2020-12");
  const lastOf = lastDayOfMonth(monthDate);

  expect(lastOf.getFullYear()).toBe(2020);
  expect(lastOf.getMonth()).toBe(11);
  expect(lastOf.getDate()).toBe(31);
});

test("Gets last day of month (leap year)", function () {
  const monthDate = getMonthDateFromString("2020-2");
  const lastOf = lastDayOfMonth(monthDate);

  expect(lastOf.getFullYear()).toBe(2020);
  expect(lastOf.getMonth()).toBe(1);
  expect(lastOf.getDate()).toBe(29);
});

test("Gets last day of month (non-leap year)", function () {
  const monthDate = getMonthDateFromString("2021-2");
  const lastOf = lastDayOfMonth(monthDate);

  expect(lastOf.getFullYear()).toBe(2021);
  expect(lastOf.getMonth()).toBe(1);
  expect(lastOf.getDate()).toBe(28);
});

test("Gets next day", function () {
  const date = new Date(2020, 11, 1, 0, 0, 0, 0); // 2020-12-01
  const nextDayDate = nextDay(date);

  expect(nextDayDate.getFullYear()).toBe(2020);
  expect(nextDayDate.getMonth()).toBe(11);
  expect(nextDayDate.getDate()).toBe(2);
});

test("Gets active days count for single user for full month", function () {
  const monthDate = getMonthDateFromString("2020-12");
  const firstOf = firstDayOfMonth(monthDate);
  const lastOf = lastDayOfMonth(monthDate);
  const activeDays = calculateDaysActive(users[0], firstOf, lastOf);

  expect(activeDays).toBe(31);
});

test("Gets active days count for single user for partial month due to late start", function () {
  const monthDate = getMonthDateFromString("2020-12");
  const firstOf = firstDayOfMonth(monthDate);
  const lastOf = lastDayOfMonth(monthDate);
  const activeDays = calculateDaysActive(users[1], firstOf, lastOf);

  expect(activeDays).toBe(18);
});

test("Gets active days count for single user for partial month due to deactivation", function () {
  const monthDate = getMonthDateFromString("2020-12");
  const firstOf = firstDayOfMonth(monthDate);
  const lastOf = lastDayOfMonth(monthDate);
  const activeDays = calculateDaysActive(users[2], firstOf, lastOf);

  expect(activeDays).toBe(20);
});

test("Gets active days count for single user for partial month due late start and deactivation", function () {
  const monthDate = getMonthDateFromString("2020-12");
  const firstOf = firstDayOfMonth(monthDate);
  const lastOf = lastDayOfMonth(monthDate);
  const activeDays = calculateDaysActive(users[3], firstOf, lastOf);

  expect(activeDays).toBe(23);
});

test("Gets charge for single user for partial month with 31 days", function () {
  const charge = calculateUserCharge(3, 31, plan);
  expect(charge).toBe(484);
});

test("Gets charge for single user for partial month with 30 days", function () {
  const charge = calculateUserCharge(3, 30, plan);
  expect(charge).toBe(500);
});

test("Gets charge for single user for full month", function () {
  const charge = calculateUserCharge(30, 30, plan);
  expect(charge).toBe(5000);
});

test("Gets full charge for whole team", function () {
  const charge = monthlyCharge("2020-12", plan, users);
  // 5000
  // 2904
  // 3226
  // 3710
  // 5000 + 2904 + 3226 + 3710 = 14840
  // 14840 /100 = 148.40
  expect(charge).toBe("$148.40");
});
