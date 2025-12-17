import React, { useEffect, useState } from 'react'
import { fetchRecommendations } from '../api'

export default function RecommendationPanel({ context }: { context: any }){
	const [recs, setRecs] = useState<any[] | null>(null)

	useEffect(() => {
		let mounted = true
		fetchRecommendations(context).then(r => { if (mounted) setRecs(r) })
		return () => { mounted = false }
	}, [context])

	if (!recs) return <aside style={{ marginTop: 16 }}>Loading recommendations...</aside>

	return (
		<aside style={{ marginTop: 16 }}>
			<strong>Recommendations</strong>
			<ul>
				{recs.map(r => <li key={r.id}>{r.type}: {r.title}</li>)}
			</ul>
		</aside>
	)
}
