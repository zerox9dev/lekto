import { createServiceClient } from '@/lib/supabase/service'

export interface PortalStudent {
  id: string
  name: string
  portal_active: boolean | null
}

export async function getPortalStudentByToken(token: string): Promise<PortalStudent | null> {
  const service = createServiceClient()
  const { data } = await service
    .from('students')
    .select('id, name, portal_active')
    .eq('invite_token', token)
    .maybeSingle()

  if (!data || !data.portal_active) return null
  return data as PortalStudent
}
