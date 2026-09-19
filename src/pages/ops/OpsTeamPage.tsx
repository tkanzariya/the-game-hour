import { useEffect, useState } from 'react'
import { fetchTeam } from '@/lib/ops/api'
import type { OpsTeamMember } from '@/lib/ops/types'

export default function OpsTeamPage() {
  const [team, setTeam] = useState<OpsTeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetchTeam().then((rows) => {
      setTeam(rows)
      setLoading(false)
    })
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-semibold">Team</h1>
      <p className="text-sm opacity-70">Coaches and facilitators assigned to events.</p>
      {loading ? (
        <div className="flex justify-center py-10">
          <span className="loading loading-spinner loading-lg" aria-label="Loading" />
        </div>
      ) : team.length === 0 ? (
        <div role="status" className="alert">
          <span>No team members in the catalog yet.</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Position</th>
                <th>Phone</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {team.map((member) => (
                <tr key={member.id}>
                  <td className="font-medium">{member.name}</td>
                  <td>{member.position || '—'}</td>
                  <td>{member.phone || '—'}</td>
                  <td>{member.email || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
