/**
 * Calculates a number between two numbers at a specific increment. The
 * progress parameter is the amount to interpolate between the two values where
 * 0.0 equal to the first point, 0.1 is very near the first point, 0.5 is
 * half-way in between, etc. The lerp function is convenient for creating
 * motion along a straight path and for drawing dotted lines.
 *
 * From Processing.js
 *
 * @param {Number} progress Between 0.0 and 1.0
 * @param {Number} value1 First value
 * @param {Number} value2 Second value
 * @returns {Number} Increment value
 */
export function lerp(progress, value1, value2) {
  return (value2 - value1) * progress + value1
}
