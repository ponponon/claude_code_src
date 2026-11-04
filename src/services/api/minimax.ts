import { MINIMAX_MODEL_CONFIGS } from '../../utils/model/configs.js'

const FLASH_EFFORTS = new Set(['low', 'medium', 'high', 'xhigh', 'max'])

/** Apply the direct MiniMax contract after SDK serialization, including side queries. */
export function normalizeMiniMaxRequest(init: RequestInit | undefined): RequestInit | undefined {
  if (typeof init?.body !== 'string') return init
  const body = JSON.parse(init.body)
  const model = typeof body.model === 'string' ? body.model.toLowerCase() : ''
  const isFlash = model === MINIMAX_MODEL_CONFIGS.flash.toLowerCase()
  if (!isFlash && model !== MINIMAX_MODEL_CONFIGS.m3.toLowerCase()) return init

  if (isFlash) {
    // Flash always thinks, including when a session's thinking toggle is off.
    body.thinking = { type: 'adaptive' }
    delete body.service_tier
    if (body.output_config?.effort !== undefined && !FLASH_EFFORTS.has(body.output_config.effort)) {
      delete body.output_config.effort
    }
  } else {
    // M3 accepts adaptive/disabled, not the legacy budget_tokens format.
    if (body.thinking?.type === 'enabled') body.thinking = { type: 'adaptive' }
    if (body.output_config) delete body.output_config.effort
  }
  // Leave messages, tools, cache controls, and full reasoning history untouched.
  return { ...init, body: JSON.stringify(body) }
}
