import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  createTenant,
  createUserClient,
  deleteUser,
  getServiceClient,
  RLS_TESTS_ENABLED,
  uniqueEmail,
  uniqueSlug,
} from './setup'

const describeIfRls = RLS_TESTS_ENABLED ? describe : describe.skip

describeIfRls('RLS — sessions / guests / events (read-only para authenticated)', () => {
  let ownerA: Awaited<ReturnType<typeof createUserClient>>
  let ownerB: Awaited<ReturnType<typeof createUserClient>>
  let tenantA: { id: string; slug: string }
  let tenantB: { id: string; slug: string }
  let sessionA: { id: string }
  let physicalTableA: { id: string }

  beforeAll(async () => {
    ownerA = await createUserClient({ email: uniqueEmail('seA') })
    ownerB = await createUserClient({ email: uniqueEmail('seB') })
    tenantA = await createTenant({
      name: 'SE A',
      slug: uniqueSlug('se-a'),
      ownerId: ownerA.userId,
    })
    tenantB = await createTenant({
      name: 'SE B',
      slug: uniqueSlug('se-b'),
      ownerId: ownerB.userId,
    })

    const service = getServiceClient()
    const { data: pt } = await service
      .from('physical_tables')
      .insert({ tenant_id: tenantA.id, label: 'SE-T1' })
      .select('id')
      .single()
    if (!pt) throw new Error('failed to seed physical_table')
    physicalTableA = pt

    const { data: sess } = await service
      .from('table_sessions')
      .insert({ tenant_id: tenantA.id, physical_table_id: pt.id })
      .select('id')
      .single()
    if (!sess) throw new Error('failed to seed session')
    sessionA = sess

    await service.from('session_guests').insert({
      session_id: sess.id,
      browser_token: 'guestSession12345',
      display_name: 'Guest #1',
    })

    await service.from('table_session_events').insert({
      session_id: sess.id,
      type: 'session_opened',
      payload: { initial: true },
    })
  })

  afterAll(async () => {
    await deleteUser(ownerA.userId)
    await deleteUser(ownerB.userId)
  })

  it('owner of A reads sessions, guests and events of A', async () => {
    const { data: sessions } = await ownerA.client.from('table_sessions').select('id, status')
    expect(sessions?.find((s) => s.id === sessionA.id)).toBeDefined()

    const { data: guests } = await ownerA.client
      .from('session_guests')
      .select('id, browser_token')
      .eq('session_id', sessionA.id)
    expect(guests?.length).toBe(1)

    const { data: events } = await ownerA.client
      .from('table_session_events')
      .select('id, type')
      .eq('session_id', sessionA.id)
    expect(events?.[0]?.type).toBe('session_opened')
  })

  it('owner of B cannot read sessions or guests of A', async () => {
    const { data: sessions } = await ownerB.client
      .from('table_sessions')
      .select('id')
      .eq('id', sessionA.id)
    expect(sessions?.length ?? 0).toBe(0)

    const { data: guests } = await ownerB.client
      .from('session_guests')
      .select('id')
      .eq('session_id', sessionA.id)
    expect(guests?.length ?? 0).toBe(0)
  })

  it('owner cannot INSERT into table_sessions directly (must use RPC)', async () => {
    const { error } = await ownerA.client
      .from('table_sessions')
      .insert({ tenant_id: tenantA.id, physical_table_id: physicalTableA.id })
    expect(error).not.toBeNull()
  })

  it('owner cannot INSERT into session_guests directly', async () => {
    const { error } = await ownerA.client.from('session_guests').insert({
      session_id: sessionA.id,
      browser_token: 'attemptedDirect12',
    })
    expect(error).not.toBeNull()
  })

  it('owner cannot INSERT into table_session_events directly', async () => {
    const { error } = await ownerA.client.from('table_session_events').insert({
      session_id: sessionA.id,
      type: 'session_opened',
    })
    expect(error).not.toBeNull()
  })

  it('tenantB exists for cross-tenant isolation tests', () => {
    // Sanity check: tenantB se usa en los tests anteriores via ownerB.
    expect(tenantB.id).toBeDefined()
  })
})
