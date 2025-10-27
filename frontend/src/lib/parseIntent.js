export const ANALYTICS_KINDS = {
  EDA: 'EDA',
  FORECAST: 'Forecast',
  CLASSIFICATION: 'Classification',
  TIMESERIES: 'Timeseries',
  CORRELATION: 'Correlation',
  SQL: 'SQL',
}

export function parseAnalyticsFromMessage(message) {
  const m = message.toLowerCase()
  const items = []

  const extractVars = () => {
    const quoted = [...message.matchAll(/\"([^\"]+)\"|'([^']+)'/g)].map((a) => a[1] || a[2])
    if (quoted.length) return quoted
    const ofMatch = message.match(/(?:of|for)\s+([a-zA-Z0-9_,\-\s]+)/i)
    if (ofMatch) {
      return ofMatch[1].split(/,|and|&/).map((s) => s.trim()).filter(Boolean)
    }
    return []
  }

  const variables = extractVars()
  const pushItem = (kind, title, payload = {}) => items.push({ id: crypto.randomUUID(), kind, title, status: 'ready', payload })

  if (m.includes('eda') || m.includes('explor')) {
    pushItem(ANALYTICS_KINDS.EDA, `EDA ${variables.length ? `for ${variables.join(', ')}` : '(auto)'}`, { variables })
  }
  if (m.includes('forecast') || m.includes('predict') || m.includes('arima') || m.includes('prophet')) {
    pushItem(ANALYTICS_KINDS.FORECAST, `Forecast ${variables[0] ? variables[0] : 'target'}`, { target: variables[0] || 'target', horizon: 24 })
  }
  if (m.includes('classif')) {
    pushItem(ANALYTICS_KINDS.CLASSIFICATION, `Classification ${variables.length ? `on ${variables.join(', ')}` : '(auto)'}`, { variables })
  }
  if (m.includes('timeseries') || m.includes('time series')) {
    pushItem(ANALYTICS_KINDS.TIMESERIES, `Timeseries diagnostics ${variables[0] ? `for ${variables[0]}` : ''}`, { variable: variables[0] })
  }
  if (m.includes('correlat')) {
    pushItem(ANALYTICS_KINDS.CORRELATION, `Correlation matrix ${variables.length ? `for ${variables.join(', ')}` : '(auto)'}`, { variables })
  }
  if (m.includes('sql') || m.startsWith('select ') || m.includes(' from ')) {
    pushItem(ANALYTICS_KINDS.SQL, 'Custom SQL', { query: message })
  }

  return items
}
