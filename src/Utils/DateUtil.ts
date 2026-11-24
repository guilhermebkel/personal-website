const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/u;
const YEAR_GROUP = 1;
const MONTH_GROUP = 2;
const DAY_GROUP = 3;
const MONTH_OFFSET = 1;
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export class DateUtil {
  static formatDayMonthYear(isoDate: string): string {
    // Why: the month names are fixed here, so the date line reads the same in every browser language (18 Nov 2026).
    const match = ISO_DATE.exec(isoDate);
    if (match === null) {
      return isoDate;
    }
    const monthName = MONTH_NAMES[Number(match[MONTH_GROUP]) - MONTH_OFFSET];
    if (monthName === undefined) {
      return isoDate;
    }
    return `${Number(match[DAY_GROUP])} ${monthName} ${match[YEAR_GROUP]}`;
  }
}
