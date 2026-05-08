export interface Agent {
  id: string;
  nom: string;
  organizationId?: string;
}

export async function listAgents(): Promise<Agent[]> {
  return [{ id: 'sofia-001', nom: 'Sofia', organizationId: 'org-001' }];
}
