/**
 * Computes the monthly charge for a given subscription.
 *
 * @returns {number} The total monthly bill for the customer in cents, rounded
 * to the nearest cent. For example, a bill of $20.00 should return 2000.
 * If there are no active users or the subscription is null, returns 0.
 *
 * @param {string} month - Always present
 *   Has the following structure:
 *   "2022-04"  // April 2022 in YYYY-MM format
 *
 * @param {object} subscription - May be null
 *   If present, has the following structure:
 *   {
 *     'id': 763,
 *     'customerId': 328,
 *     'monthlyPriceInCents': 359  // price per active user per month
 *   }
 *
 * @param {array} users - May be empty, but not null
 *   Has the following structure:
 *   [
 *     {
 *       'id': 1,
 *       'name': "Employee #1",
 *       'customerId': 1,
 *
 *       // when this user started
 *       'activatedOn': new Date("2021-11-04"),
 *
 *       // last day to bill for user
 *       // should bill up to and including this date
 *       // since user had some access on this date
 *       'deactivatedOn': new Date("2022-04-10")
 *     },
 *     {
 *       'id': 2,
 *       'name': "Employee #2",
 *       'customerId': 1,
 *
 *       // when this user started
 *       'activatedOn': new Date("2021-12-04"),
 *
 *       // hasn't been deactivated yet
 *       'deactivatedOn': null
 *     },
 *   ]
 */
function monthlyCharge(month, subscription, users) {
  const monthDate = getMonthDateFromString(month);
  // if no subscription, return 0
  if (!subscription) {
    return "$0.00";
  }
  // if no users, return 0
  if (!users.length) {
    return "$0.00";
  }

  // for all users, calculate total days within month where subscription was active
  // loop through each user
  const firstOfMonth = firstDayOfMonth(monthDate);
  const lastOfMonth = lastDayOfMonth(monthDate);
  const daysInMonth = lastOfMonth.getDate();
  let totalCost = 0;

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    //   exit if:
    //   Is their activation NOT before the last day of the active month?
    if (!user.activatedOn.getTime() >= lastOfMonth.getTime()) {
      continue;
    }
    //   Is their deactivation before the first of the month
    if (user.deactivatedOn) {
      if (user.deactivatedOn.getTime() < firstOfMonth.getTime()) {
        continue;
      }
    }

    // User was active
    // Calculate start and end of usage
    const daysActive = calculateDaysActive(user, firstOfMonth, lastOfMonth);
    const userCharge = calculateUserCharge(
      daysActive,
      daysInMonth,
      subscription
    );
    totalCost += userCharge;
  }

  return "$" + (totalCost / 100).toFixed(2);
}
export { monthlyCharge };

/*******************
 * Helper functions *
 ********************/

const calculateUserCharge = (daysActive, daysInMonth, subscription) => {
  let charge =
    daysActive < daysInMonth
      ? (subscription.monthlyPriceInCents / daysInMonth) * daysActive
      : subscription.monthlyPriceInCents;
  return Math.ceil(charge); // round up to nearest cent
};
export { calculateUserCharge };

const calculateDaysActive = (user, firstOfMonth, lastOfMonth) => {
  const start =
    user.activatedOn.getTime() < firstOfMonth.getTime()
      ? firstOfMonth
      : user.activatedOn;

  let end = lastOfMonth;
  if (user.deactivatedOn) {
    end =
      user.deactivatedOn.getTime() < lastOfMonth.getTime()
        ? user.deactivatedOn
        : lastOfMonth;
  }
  // Add a day to the end to include last day of subscription in total
  // End time is the greater value, subtract start time
  return end.getDate() - start.getDate() + 1;
};
export { calculateDaysActive };

const getMonthDateFromString = (monthString) => {
  let parts = monthString.split("-");
  return new Date(parts[0], parts[1] - 1, 1, 0, 0, 0, 0);
};
export { getMonthDateFromString };

/**
 * Takes a Date instance and returns a Date which is the first day
 * of that month. For example:
 *
 * firstDayOfMonth(new Date(2022, 3, 17)) // => new Date(2022, 3, 1)
 *
 * Input type: Date
 * Output type: Date
 **/
function firstDayOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}
export { firstDayOfMonth };

/**
 * Takes a Date object and returns a Date which is the last day of that month.
 *
 * lastDayOfMonth(new Date(2022, 3, 17)) // => new Date(2022, 3, 31)
 *
 * Input type: Date
 * Output type: Date
 **/
function lastDayOfMonth(date) {
  const followingMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    1,
    0,
    0,
    0,
    0
  );
  return new Date(followingMonth.getTime() - 1);
}
export { lastDayOfMonth };

/**
 * Takes a Date object and returns a Date which is the next day.
 * For example:
 *
 * nextDay(new Date(2022, 3, 17))  // => new Date(2022, 3, 18)
 * nextDay(new Date(2022, 3, 31))  // => new Date(2022, 4, 1)
 *
 * Input type: Date
 * Output type: Date
 **/
function nextDay(date) {
  return new Date(date.getTime() + 24 * 60 * 60 * 1000);
}
export { nextDay };
