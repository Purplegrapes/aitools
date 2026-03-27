export function isFlashNewsHot(score?: number | null) {
  return Number(score) >= 60
}

export function getFlashNewsScoreTone(score?: number | null) {
  return isFlashNewsHot(score) ? 'text-danger bg-danger/8' : 'text-secondary bg-surfaceSubtle'
}

export function formatFlashNewsTime(value?: string | null) {
  if (!value)
    return '--:--'

  const normalizedValue = value.includes('T') ? value : value.replace(' ', 'T')
  const timestamp = Date.parse(normalizedValue)
  if (Number.isNaN(timestamp))
    return value

  const date = new Date(timestamp)
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')
  return `${hours}:${minutes}`
}

export function formatFlashNewsFullTime(value?: string | null) {
  if (!value)
    return ''

  const normalizedValue = value.includes('T') ? value : value.replace(' ', 'T')
  const timestamp = Date.parse(normalizedValue)
  if (Number.isNaN(timestamp))
    return value

  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')
  const seconds = `${date.getSeconds()}`.padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
