export type DocumentSummary = {
  id: string
  title: string
  version: string
  status: string
  tags: string[]
}

// Mocked API surface for frontend scaffolding. Replace with real REST calls.
export async function fetchDocuments(): Promise<DocumentSummary[]> {
  return Promise.resolve([
    { id: 'd1', title: 'Engagement Plan', version: '1.2', status: 'Published', tags: ['plan','governance'] },
    { id: 'd2', title: 'Migration Notes', version: '0.9', status: 'Draft', tags: ['migration'] }
  ])
}

export async function fetchProjects() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'
  try {
    const response = await fetch(`${API_BASE}/api/projects`)
    if (!response.ok) throw new Error('Failed to fetch projects')
    return await response.json()
  } catch (error) {
    console.error('Error fetching projects:', error)
    return []
  }
}

export async function fetchDocumentById(id: string) {
  // sample detail with versions
  return Promise.resolve({
    id,
    title: id === 'd1' ? 'Engagement Plan' : 'Migration Notes',
    version: id === 'd1' ? '1.2' : '0.9',
    status: id === 'd1' ? 'Published' : 'Draft',
    tags: id === 'd1' ? ['plan','governance'] : ['migration'],
    versions: [
      { version: '1.2', notes: 'Minor edits' },
      { version: '1.1', notes: 'Add appendix' },
    ],
    content: 'This is mock content for ' + id
  })
}

export async function fetchProjectById(id: string) {
  return Promise.resolve({
    id,
    name: id === 'p1' ? 'Client Alpha' : 'Client Beta',
    description: id === 'p1' ? 'Migration and knowledge capture' : 'Operational excellence',
    documents: [ { id: 'd1', title: 'Engagement Plan', version: '1.2' } ]
  })
}

export async function fetchCommunities() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'
  try {
    const response = await fetch(`${API_BASE}/api/communities`)
    if (!response.ok) throw new Error('Failed to fetch communities')
    return await response.json()
  } catch (error) {
    console.error('Error fetching communities:', error)
    return []
  }
}

export async function fetchAnalytics() {
  return Promise.resolve({ documentsPublished: 124, activeCommunities: 8, topSkills: ['migration','governance','cloud'] })
}

export async function fetchGovernanceLogs() {
  return Promise.resolve([
    { id: 'g1', time: '2025-12-01', actor: 'Alice', action: 'Published', target: 'Engagement Plan' },
    { id: 'g2', time: '2025-11-12', actor: 'Bob', action: 'Approved', target: 'Migration Notes' }
  ])
}

export async function fetchNotifications() {
  return Promise.resolve([
    { id: 'n1', time: '2025-12-10', message: 'Document Engagement Plan published' },
    { id: 'n2', time: '2025-12-11', message: 'Project Client Beta new comment' }
  ])
}

export async function fetchRecommendations(_context: any) {
  // Mocked recommendation engine
  return Promise.resolve([
    { id: 'r1', type: 'document', title: 'Governance checklist' },
    { id: 'r2', type: 'expert', title: 'Senior Migration Consultant' }
  ])
}

export async function fetchLegacyDocuments() {
  // Migration adapter: provide historical docs
  return Promise.resolve([
    { id: 'legacy-1', title: 'Old Engagement Memo', migrated: false },
  ])
}
