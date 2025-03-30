//gemini ai generated document
# posixtz.js Documentation

## Overview

This script provides a set of functions for handling POSIX timezone (TZ) strings within a JavaScript environment where `moment.js` and `moment-timezone.js` are globally available (e.g., Google Apps Script). It allows for:

1.  **Generating** POSIX TZ strings from standard IANA timezone identifiers (like `America/New_York`).
2.  **Parsing** POSIX TZ strings into structured data representing standard time, daylight saving time (DST) rules, and offsets.
3.  **Calculating** the correct UTC offset and timezone abbreviation for a specific *local* date and time based on the rules defined in a POSIX TZ string.
4.  **Formatting** dates using the calculated POSIX TZ offset and abbreviation.

This script appears to be based on or adapted from [jdiamond/posixtz](https://github.com/jdiamond/posixtz), modified to work without `require` and potentially including custom additions.

## Prerequisites

* **moment.js:** Must be loaded and globally accessible.
* **moment-timezone.js:** Must be loaded (with timezone data) and globally accessible.

## Global Object: `posixtz`

The script defines a global object `posixtz` which exposes the core functions:

* `posixtz.formatPosixTZ`
* `posixtz.parsePosixTZ`
* `posixtz.getOffsetForLocalDateWithPosixTZ`
* `posixtz.formatLocalDateWithOffset`

## Functions within `posixtz`

### `posixtz.formatPosixTZ(tz, year)`

Generates a POSIX TZ string representation for a given IANA timezone identifier and year.

* **Parameters:**
    * `tz` (`String`): An IANA timezone identifier (e.g., `'America/New_York'`, `'Europe/London'`).
    * `year` (`Number`): The specific year for which to determine the DST transition rules, as these can change.
* **Returns:** (`String`) The generated POSIX TZ string (e.g., `'EST5EDT,M3.2.0/2,M11.1.0/2'`). Returns a simpler format if there's no DST or if DST rules cannot be determined for that year.

### `posixtz.parsePosixTZ(tz)`

Parses a POSIX TZ string into a structured object containing timezone rule details.

* **Parameters:**
    * `tz` (`String`): The POSIX TZ string to parse (e.g., `'EST5EDT,M3.2.0/2,M11.1.0/2'`).
* **Returns:** (`Object | null`) An object detailing the parsed rules, or `null` if parsing fails. The object structure is:
    ```javascript
    {
      stdAbbr: String,  // Standard time abbreviation (e.g., 'EST')
      stdOffset: Number, // Standard time offset from UTC in minutes (negative for zones east of UTC, e.g., -300 for EST)
      dst: Boolean,     // Whether DST rules are present
      dstAbbr: String | null, // DST abbreviation (e.g., 'EDT') or null
      dstOffset: Number | null, // DST offset from UTC in minutes (e.g., -240 for EDT) or null
      dstStart: Object | null, // Object describing DST start rule, or null
      dstEnd: Object | null    // Object describing DST end rule, or null
    }
    ```
    The `dstStart` and `dstEnd` objects (if present) have the structure (for 'M' format):
    ```javascript
    {
      month: Number, // Month (1-12)
      week: Number,  // Week of the month (1-5, where 5 means the last occurrence)
      day: Number,   // Day of the week (0=Sunday, 6=Saturday)
      hour: Number,  // Hour (0-23)
      minute: Number,// Minute (0-59)
      second: Number // Second (0-59)
    }
    ```
    *Note: 'J' format parsing might not be fully supported.*

### `posixtz.getOffsetForLocalDateWithPosixTZ(localDate, posixTZ)`

Calculates the applicable UTC offset and timezone abbreviation for a given *local* date/time according to the rules specified in a POSIX TZ string. This function determines whether standard time or DST is active at that specific local time.

* **Parameters:**
    * `localDate` (`Date | String | Moment`): The *local* date and time for which to calculate the offset. Can be a JavaScript `Date` object, a date string parsable by `moment`, or a `moment` object. *Important: This should represent the time as it would appear on a clock in the target timezone, NOT a UTC time.*
    * `posixTZ` (`String`): The POSIX TZ string defining the timezone rules.
* **Returns:** (`Object`) An object containing the calculated offset and abbreviation:
    ```javascript
    {
      offset: Number, // The applicable UTC offset in minutes (e.g., -300 for EST, -240 for EDT)
      abbr: String    // The applicable timezone abbreviation (e.g., 'EST' or 'EDT')
    }
    ```

### `posixtz.formatLocalDateWithOffset(localDate, posixTZ)`

Formats a given local date/time into an ISO 8601 string, applying the correct UTC offset derived from the POSIX TZ rules.

* **Parameters:**
    * `localDate` (`Date | String | Moment`): The *local* date and time to format.
    * `posixTZ` (`String`): The POSIX TZ string defining the timezone rules.
* **Returns:** (`String`) The formatted date string in ISO 8601 format with the calculated offset (e.g., `'2025-07-04T10:00:00-04:00'`).

## Additional Global Functions

These functions are defined globally (not within the `posixtz` object) and provide convenient wrappers or variations.

### `getOffset_PosixTZ(localDate, posixTZ, mode)`

Retrieves the UTC offset for a local date based on POSIX TZ rules, returning it in specified units.

* **Parameters:**
    * `localDate` (`Date | String | Moment`): The local date and time.
    * `posixTZ` (`String`): The POSIX TZ string.
    * `mode` (`String`): The desired unit for the offset (e.g., `'hour'`, `'minute'`, `'second'`, `'millisecond'`, `'day'`). Defaults to `'minute'` if unrecognized.
* **Returns:** (`Number`) The calculated offset in the specified units.

### `getAbbr_PosixTZ(localDate, posixTZ)`

Retrieves only the applicable timezone abbreviation (standard or DST) for a local date based on POSIX TZ rules.

* **Parameters:**
    * `localDate` (`Date | String | Moment`): The local date and time.
    * `posixTZ` (`String`): The POSIX TZ string.
* **Returns:** (`String`) The applicable timezone abbreviation (e.g., `'EST'`, `'EDT'`).

### `dateFormat_PosixTZ(localDate, posixTZ, tz_format)`

Formats a local date according to a `moment.js` format string, applying the correct offset and abbreviation derived from the POSIX TZ string. It specifically replaces the `z` format specifier in `tz_format` with the calculated abbreviation.

* **Parameters:**
    * `localDate` (`Date | String | Moment`): The local date and time to format.
    * `posixTZ` (`String`): The POSIX TZ string.
    * `tz_format` (`String`): The `moment.js` format string (e.g., `'YYYY-MM-DD HH:mm:ss z'`). The `z` specifier will be replaced by the calculated POSIX abbreviation.
* **Returns:** (`String`) The formatted date string.

## Understanding POSIX TZ Strings

POSIX TZ strings provide a concise way to define timezone rules. The general format is:

`std offset[dst[offset][,start[/time],end[/time]]]`

* `std`: Abbreviation for standard time (e.g., `EST`).
* `offset`: Offset from UTC for standard time. Positive values are *west* of UTC, negative are *east*. Hours, or hh:mm:ss. (e.g., `5` for EST, which is UTC-5).
* `dst`: Abbreviation for daylight saving time (e.g., `EDT`). Optional.
* `offset`: Offset for DST. If omitted, defaults to one hour less than the standard offset (e.g., `4` for EDT). Optional.
* `,start[/time],end[/time]`: Rules for when DST starts and ends. Optional.
    * `Jn`: Julian day (1-365). Leap days ignored.
    * `n`: Zero-based Julian day (0-365). Leap days counted.
    * `Mm.w.d`: Month (`M1`-`M12`), week (`1`-`5`, 5=last), day (`0`=Sun, `6`=Sat).
    * `time`: Time of transition (hh:mm:ss). Defaults to `02:00:00`.

Example: `EST5EDT,M3.2.0/2,M11.1.0/2`
* Standard: EST, 5 hours west of UTC (UTC-5)
* DST: EDT, offset defaults to 4 hours west of UTC (UTC-4)
* Start: March (M3), 2nd week (2), Sunday (0), at 2 AM (/2)
* End: November (M11), 1st week (1), Sunday (0), at 2 AM (/2)

## Usage Examples

```javascript
// Assume moment.js and moment-timezone.js are loaded

// --- Using functions within posixtz ---

// 1. Generate POSIX string for America/New_York for 2025
const nyPosix = posixtz.formatPosixTZ('America/New_York', 2025);
console.log('New York POSIX (2025):', nyPosix);
// Example Output: New York POSIX (2025): EST5EDT,M3.2.0/2,M11.1.0/2

// 2. Parse the generated POSIX string
const parsedNY = posixtz.parsePosixTZ(nyPosix);
console.log('Parsed NY:', JSON.stringify(parsedNY, null, 2));
/* Example Output:
Parsed NY: {
  "stdAbbr": "EST",
  "stdOffset": -300,
  "dst": true,
  "dstAbbr": "EDT",
  "dstOffset": -240,
  "dstStart": { "month": 3, "week": 2, "day": 0, "hour": 2, "minute": 0, "second": 0 },
  "dstEnd": { "month": 11, "week": 1, "day": 0, "hour": 2, "minute": 0, "second": 0 }
}
*/

// 3. Get offset/abbr for a local summer date in NY
const summerDateNY = '2025-07-04T10:00:00'; // Local time in NY
const summerOffsetInfo = posixtz.getOffsetForLocalDateWithPosixTZ(summerDateNY, nyPosix);
console.log(`Offset/Abbr for ${summerDateNY} in NY:`, summerOffsetInfo);
// Example Output: Offset/Abbr for 2025-07-04T10:00:00 in NY: { offset: -240, abbr: 'EDT' }

// 4. Get offset/abbr for a local winter date in NY
const winterDateNY = '2025-01-15T10:00:00'; // Local time in NY
const winterOffsetInfo = posixtz.getOffsetForLocalDateWithPosixTZ(winterDateNY, nyPosix);
console.log(`Offset/Abbr for ${winterDateNY} in NY:`, winterOffsetInfo);
// Example Output: Offset/Abbr for 2025-01-15T10:00:00 in NY: { offset: -300, abbr: 'EST' }

// 5. Format a local date with the correct POSIX offset
const formattedSummerNY = posixtz.formatLocalDateWithOffset(summerDateNY, nyPosix);
console.log(`Formatted summer date in NY:`, formattedSummerNY);
// Example Output: Formatted summer date in NY: 2025-07-04T10:00:00-04:00

const formattedWinterNY = posixtz.formatLocalDateWithOffset(winterDateNY, nyPosix);
console.log(`Formatted winter date in NY:`, formattedWinterNY);
// Example Output: Formatted winter date in NY: 2025-01-15T10:00:00-05:00

// --- Using additional global functions ---

// 6. Get offset in hours
const summerOffsetHours = getOffset_PosixTZ(summerDateNY, nyPosix, 'hour');
console.log(`Summer offset in hours:`, summerOffsetHours);
// Example Output: Summer offset in hours: -4

// 7. Get abbreviation
const winterAbbr = getAbbr_PosixTZ(winterDateNY, nyPosix);
console.log(`Winter abbreviation:`, winterAbbr);
// Example Output: Winter abbreviation: EST

// 8. Custom date formatting including POSIX abbreviation
const customFormat = 'MMM Do YYYY, h:mm:ss a z';
const customFormattedSummer = dateFormat_PosixTZ(summerDateNY, nyPosix, customFormat);
console.log(`Custom formatted summer:`, customFormattedSummer);
// Example Output: Custom formatted summer: Jul 4th 2025, 10:00:00 am EDT

const customFormattedWinter = dateFormat_PosixTZ(winterDateNY, nyPosix, customFormat);
console.log(`Custom formatted winter:`, customFormattedWinter);
// Example Output: Custom formatted winter: Jan 15th 2025, 10:00:00 am EST