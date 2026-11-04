import { afterEach, expect, mock, test } from 'bun:test'
import { Transpiler } from 'bun'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

// The recovered tree has no manifest and its bundled SDK is incomplete. Install
// @anthropic-ai/sdk@0.74.0 under .validation with lifecycle scripts disabled,
// then run `bun test tests/minimax.test.ts`. Only app infrastructure is mocked;
// model selection, picker, capabilities, client factory, and SDK transport run.
const root = resolve(import.meta.dir, '..')
const realFiles = new Set([
  'src/utils/model/configs.ts',
  'src/utils/model/providers.ts',
  'src/utils/model/model.ts',
  'src/utils/model/modelStrings.ts',
  'src/utils/model/modelOptions.ts',
  'src/utils/model/aliases.ts',
  'src/utils/context.ts',
  'src/utils/effort.ts',
  'src/utils/thinking.ts',
  'src/services/api/client.ts',
  'src/services/api/minimax.ts',
].map(path => resolve(root, path)))
const resolveSource = (path: string, importer: string) =>
  resolve(path.startsWith('src/') ? root : dirname(importer), path).replace(/\.js$/, '.ts')
let saved: Record<string, any> = {}
let modelStrings: any = null
let additional: any[] = []
const mocks: Record<string, any> = {
  getMainLoopModelOverride: () => undefined,
  getInitialMainLoopModel: () => null,
  getModelStrings: () => modelStrings,
  setModelStrings: value => { modelStrings = value },
  getInitialSettings: () => saved,
  getSettings_DEPRECATED: () => saved,
  getSettingsWithErrors: () => ({ settings: saved }),
  getGlobalConfig: () => ({ additionalModelOptionsCache: additional }),
  getModelCapability: () => undefined,
  get3PModelCapabilityOverride: () => undefined,
  isModelAllowed: () => true,
  isEnvTruthy: value => ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase()),
  sequential: fn => fn,
  capitalize: value => value.charAt(0).toUpperCase() + value.slice(1),
  getFeatureValue_CACHED_MAY_BE_STALE: (_key, fallback) => fallback,
  feature: () => false,
  isClaudeAISubscriber: () => false,
  isMaxSubscriber: () => false,
  isProSubscriber: () => false,
  isTeamSubscriber: () => false,
  isTeamPremiumSubscriber: () => false,
  getProxyFetchOptions: () => ({}),
  getUserAgent: () => 'offline-test',
  getSessionId: () => 'offline-session',
  getIsNonInteractiveSession: () => true,
  getAnthropicApiKey: () => 'offline-placeholder',
  isDebugToStdErr: () => false,
}
const mockExports = new Map<string, Record<string, any>>()
const transpiler = new Transpiler({ loader: 'ts' })
for (const file of realFiles) {
  const js = transpiler.transformSync(readFileSync(file, 'utf8'))
  for (const match of js.matchAll(/import\s+\{([^}]+)\}\s+from\s+["']([^"']+)["']/g)) {
    const specifier = match[2]!
    if (!specifier.startsWith('.') && !specifier.startsWith('src/') && specifier !== 'bun:bundle') continue
    const path = specifier === 'bun:bundle' ? specifier : resolveSource(specifier, file)
    if (realFiles.has(path)) continue
    const exports = mockExports.get(path) ?? {}
    for (const part of match[1]!.split(',')) {
      const name = part.trim().split(/\s+as\s+/)[0]!
      if (name) exports[name] = mocks[name] ?? (() => undefined)
    }
    mockExports.set(path, exports)
  }
}
for (const [path, exports] of mockExports) {
  mock.module(path, () => exports)
  if (path.endsWith('.ts')) {
    mock.module(path.replace(/\.ts$/, '.js'), () => exports)
    mock.module(path.slice(root.length + 1).replace(/\.ts$/, '.js'), () => exports)
  }
}
const sdkPath = process.env.MINIMAX_TEST_SDK_PATH ?? resolve(root, '.validation/node_modules/@anthropic-ai/sdk/index.mjs')
const sdk = await import(sdkPath)
mock.module('@anthropic-ai/sdk', () => sdk)
// Resolve the source aliases without replacing their implementation.
for (const path of realFiles) {
  mock.module(path.slice(root.length + 1).replace(/\.ts$/, '.js'), () => require(path))
}
const models = await import('../src/utils/model/model.ts')
const { getModelOptions } = await import('../src/utils/model/modelOptions.ts')
const { getAnthropicClient } = await import('../src/services/api/client.ts')
const { getContextWindowForModel, getModelMaxOutputTokens } = await import('../src/utils/context.ts')
const { resolveAppliedEffort, modelSupportsEffort } = await import('../src/utils/effort.ts')
const { modelSupportsAdaptiveThinking } = await import('../src/utils/thinking.ts')
const originalEnv = { ...process.env }
afterEach(() => {
  for (const key of Object.keys(process.env)) if (!(key in originalEnv)) delete process.env[key]
  Object.assign(process.env, originalEnv)
  saved = {}; additional = []; modelStrings = null
})

const messages = [
  { role: 'user', content: [
    { type: 'text', text: 'Inspect media', cache_control: { type: 'ephemeral' } },
    { type: 'image', source: { type: 'url', url: 'https://example.invalid/image.png' } },
    { type: 'video', source: { type: 'url', url: 'https://example.invalid/video.mp4' } },
  ] },
  { role: 'assistant', content: [
    { type: 'thinking', thinking: 'Keep this history', signature: 'test-signature' },
    { type: 'tool_use', id: 'call_1', name: 'inspect', input: {} },
  ] },
  { role: 'user', content: [{ type: 'tool_result', tool_use_id: 'call_1', content: 'done' }] },
]
async function capture(extra: Record<string, any> = {}, stream = false) {
  let captured: any
  let url = ''
  const client = await getAnthropicClient({
    maxRetries: 0,
    fetchOverride: async (input, init) => {
      url = String(input)
      captured = JSON.parse(init!.body as string)
      if (stream) return new Response('event: message_stop\ndata: {"type":"message_stop"}\n\n', {
        headers: { 'content-type': 'text/event-stream' },
      })
      return Response.json({ id: 'offline', type: 'message', role: 'assistant', content: [],
        model: captured.model, stop_reason: 'end_turn', usage: { input_tokens: 1, output_tokens: 1 } })
    },
  })
  await client.beta.messages.create({
    model: models.getMainLoopModel(), max_tokens: 4096, messages,
    tools: [{ name: 'inspect', input_schema: { type: 'object' } }], stream, ...extra,
  } as any)
  return { body: captured, url }
}

for (const region of ['api.minimax.io', 'api.minimax.cn', 'api.minimaxi.com']) {
  for (const stream of [false, true]) {
    test(`${region}: default Flash serialized request (stream=${stream})`, async () => {
      process.env.ANTHROPIC_BASE_URL = `https://${region}/anthropic/`
      const { body, url } = await capture({ thinking: { type: 'disabled' }, service_tier: 'priority', output_config: { effort: 'none' } }, stream)
      expect(url).toContain(`${region}/anthropic/v1/messages`)
      expect(body.model).toBe('MiniMax-M3.1-Flash')
      expect(body.thinking).toEqual({ type: 'adaptive' })
      expect(body.service_tier).toBeUndefined()
      expect(body.output_config.effort).toBeUndefined()
      expect(body.messages).toEqual(messages)
      expect(body.tools[0].name).toBe('inspect')
      expect(body.stream).toBe(stream)
    })
  }
}
test('Flash effort, context, output ceiling, and adaptive capability', async () => {
  process.env.ANTHROPIC_BASE_URL = 'https://api.minimax.io/anthropic'
  expect(resolveAppliedEffort('MiniMax-M3.1-Flash', undefined)).toBe('max')
  expect(modelSupportsEffort('MiniMax-M3')).toBe(false)
  expect(modelSupportsAdaptiveThinking('MiniMax-M3.1-Flash')).toBe(true)
  expect(getContextWindowForModel('MiniMax-M3.1-Flash')).toBe(1_000_000)
  expect(getModelMaxOutputTokens('MiniMax-M3.1-Flash').upperLimit).toBe(524_288)
  for (const effort of ['low', 'medium', 'high', 'xhigh', 'max']) {
    const { body } = await capture({ output_config: { effort } })
    expect(body.output_config.effort).toBe(effort)
  }
})
test('ordinary catalog filters stale entries but preserves saved and custom selections', () => {
  process.env.ANTHROPIC_BASE_URL = 'https://api.minimax.io/anthropic'
  additional = [{ value: 'MiniMax-M2.5', label: 'Old', description: 'Old' }]
  expect(getModelOptions().map(option => option.value)).toEqual([null, 'MiniMax-M3.1-Flash', 'MiniMax-M3'])
  saved.model = 'MiniMax-M2.7'
  expect(models.getMainLoopModel()).toBe('MiniMax-M2.7')
  expect(getModelOptions().map(option => option.value)).toContain('MiniMax-M2.7')
  process.env.ANTHROPIC_CUSTOM_MODEL_OPTION = 'custom-model'
  expect(getModelOptions().map(option => option.value)).toContain('custom-model')
  process.env.ANTHROPIC_DEFAULT_SONNET_MODEL = 'custom-default'
  saved = {}
  expect(models.getMainLoopModel()).toBe('custom-default')
})
test('M3 thinking modes and explicit legacy/custom requests', async () => {
  process.env.ANTHROPIC_BASE_URL = 'https://api.minimax.io/anthropic'
  saved.model = 'MiniMax-M3'
  expect((await capture()).body.thinking).toBeUndefined()
  expect((await capture({ thinking: { type: 'disabled' } })).body.thinking.type).toBe('disabled')
  expect((await capture({ thinking: { type: 'enabled', budget_tokens: 1024 } })).body.thinking).toEqual({ type: 'adaptive' })
  for (const model of ['MiniMax-M2.7', 'custom-model']) {
    saved.model = model
    const { body } = await capture({ thinking: { type: 'enabled', budget_tokens: 1024 }, output_config: { effort: 'high' } })
    expect(body.model).toBe(model)
    expect(body.thinking).toEqual({ type: 'enabled', budget_tokens: 1024 })
    expect(body.output_config.effort).toBe('high')
  }
})
test('token estimation requests are not rewritten', async () => {
  process.env.ANTHROPIC_BASE_URL = 'https://api.minimax.io/anthropic'
  let body: any
  const client = await getAnthropicClient({ maxRetries: 0, fetchOverride: async (_input, init) => {
    body = JSON.parse(init!.body as string)
    return Response.json({ input_tokens: 1 })
  } })
  await client.beta.messages.countTokens({ model: 'MiniMax-M3.1-Flash', messages: [{ role: 'user', content: 'hello' }] })
  expect(body.thinking).toBeUndefined()
})
test('unknown gateways retain explicit payloads', async () => {
  process.env.ANTHROPIC_BASE_URL = 'https://gateway.example.invalid/anthropic'
  process.env.ANTHROPIC_MODEL = 'MiniMax-M3.1-Flash'
  const { body } = await capture({ thinking: { type: 'disabled' }, service_tier: 'priority' })
  expect(body.thinking).toEqual({ type: 'disabled' })
  expect(body.service_tier).toBe('priority')
})
