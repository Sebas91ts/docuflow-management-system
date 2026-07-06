export function getApiErrorMessage(error, fallbackMessage) {
  const detail = error?.response?.data?.detail

  if (typeof detail === 'string') {
    return detail
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === 'string') {
          return item
        }

        if (item && typeof item === 'object') {
          return item.msg ?? item.message ?? item.detail ?? JSON.stringify(item)
        }

        return String(item)
      })
      .join(', ')
  }

  if (detail && typeof detail === 'object') {
    return detail.msg ?? detail.message ?? detail.detail ?? fallbackMessage
  }

  return fallbackMessage
}
