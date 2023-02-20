export const URL_REGEX = new RegExp(
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{2,}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/
)

export function parseStringWithSeparator(text, separator) {
  return text.split(separator)
}
export function getReferenceFromContext(text) {
  const parsedValue = parseStringWithSeparator(text, /\|/)
  return parsedValue.length > 1 ? parsedValue[1] : null
}

export function getTitleFromContext(text) {
  const parsedValue = parseStringWithSeparator(text, /\|/)
  return parsedValue[0]
}
