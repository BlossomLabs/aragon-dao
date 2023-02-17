export function capitalizeFirstLetter(text) {
  if (!text?.length) {
    return ''
  }

  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}
