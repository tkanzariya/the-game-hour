import { useEffect, useState } from 'react'
import { fetchGames } from '@/lib/ops/api'
import type { OpsGame } from '@/lib/ops/types'

export default function OpsGamesPage() {
  const [games, setGames] = useState<OpsGame[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetchGames().then((rows) => {
      setGames(rows)
      setLoading(false)
    })
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-semibold">Games</h1>
      <p className="text-sm opacity-70">Catalog used when assigning games to an event.</p>
      {loading ? (
        <div className="flex justify-center py-10">
          <span className="loading loading-spinner loading-lg" aria-label="Loading" />
        </div>
      ) : games.length === 0 ? (
        <div role="status" className="alert">
          <span>No games in the catalog yet.</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Indoor</th>
                <th>Outdoor</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.id}>
                  <td className="font-medium">{game.name}</td>
                  <td>{game.venue_indoor ? 'Yes' : '—'}</td>
                  <td>{game.venue_outdoor ? 'Yes' : '—'}</td>
                  <td className="max-w-xs truncate">{game.description || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
