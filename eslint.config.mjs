import coreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

/* eslint-config-next 16 ships native flat configs, so no FlatCompat shim. */
const config = [
  ...coreWebVitals,
  ...nextTypescript,
  { ignores: ['.next/**', 'out/**', 'node_modules/**'] },
]

export default config
