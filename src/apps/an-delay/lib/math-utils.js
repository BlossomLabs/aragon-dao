export function round(num, places = 2) {
  const rounded = Number(Math.round(num + 'e+' + places) + 'e-' + places)
  return Number.isNaN(rounded) ? Number(num.toFixed(places)) : rounded
}
