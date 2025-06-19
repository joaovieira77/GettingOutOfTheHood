'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import NavBar from '@/Componente/NavBar'

type HistoryEntry = {
  ts: string
  ms_played: number
  master_metadata_track_name: string
  master_metadata_album_artist_name: string
  skipped?: boolean
}

const ArtistPage = () => {
  const params = useParams()
  const artist = decodeURIComponent(params.id as string)

  const [data, setData] = useState<HistoryEntry[]>([])
  const [latestDate, setLatestDate] = useState<Date | null>(null)
  const [playsPerMonth, setPlaysPerMonth] = useState<{ labels: string[]; values: number[] }>({ labels: [], values: [] })
  const [artistRank, setArtistRank] = useState<number | null>(null)

  useEffect(() => {
    fetch('/history.json')
      .then(res => res.json())
      .then((json: HistoryEntry[]) => {
        const filtered = json.filter(
          e =>
            typeof e.ms_played === 'number' &&
            e.master_metadata_track_name &&
            e.master_metadata_album_artist_name &&
            !e.skipped
        )

        setData(filtered)
  // Find the latest timestamp from entries
        if (filtered.length > 0) {
          const latest = filtered.reduce((a, b) => new Date(a.ts) > new Date(b.ts) ? a : b)
          setLatestDate(new Date(latest.ts))
        }
 // Accumulate total play time per artist
        const artistTotals = filtered.reduce((acc: Record<string, number>, e) => {
          const name = e.master_metadata_album_artist_name
          acc[name] = (acc[name] || 0) + e.ms_played
          return acc
        }, {})
// Sort artists by playtime and find current artist's rank
        const sortedArtists = Object.entries(artistTotals)
          .sort((a, b) => b[1] - a[1])
          .map(([name]) => name)

        const rank = sortedArtists.indexOf(artist) + 1
        setArtistRank(rank > 0 ? rank : null) // Save rank if found
      })
      .catch(console.error)
  }, [artist])
 // Filter out plays of only the current artist
  const artistData = data.filter(e => e.master_metadata_album_artist_name === artist)
  const totalMinutes = Math.round(artistData.reduce((acc, e) => acc + e.ms_played, 0) / 60000) // Calculate total minutes listened to this artist
  const uniqueSongs = [...new Set(artistData.map(e => e.master_metadata_track_name))].length  // Count unique songs played

    // Get top 5 most played songs by playtime
  const topSongs = Object.entries(
    artistData.reduce((acc: Record<string, number>, e) => {
      const track = e.master_metadata_track_name
      acc[track] = (acc[track] || 0) + e.ms_played
      return acc
    }, {})
  )
    .sort((a, b) => b[1] - a[1]) // Sort descending by time
    .slice(0, 5) // Take top 5 

    // Calculate plays per month (last 6 months)
  useEffect(() => {
    if (!data.length || !latestDate) return

    const months: Record<string, number> = {}
//counts the times per month
    for (let i = 5; i >= 0; i--) {
      const d = new Date(latestDate.getFullYear(), latestDate.getMonth() - i, 1)
      const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      months[label] = 0
    }
// Count how many times the artist was played in each of the last 6 months
    artistData.forEach(e => {
      const d = new Date(e.ts)
      const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (label in months) months[label]++
    })

    setPlaysPerMonth({
      labels: Object.keys(months),
      values: Object.values(months),
    })
  }, [data, latestDate])
 // Calculate total ms played for this artist and overall
  const artistMs = artistData.reduce((acc, e) => acc + e.ms_played, 0)
  const totalMs = data.reduce((acc, e) => acc + e.ms_played, 0)
  const artistPercent = totalMs > 0 ? ((artistMs / totalMs) * 100).toFixed(1) : '0.0'     // Calculate percentage of time spent listening to this artist

  return (
    <div className="w-full min-h-screen mx-auto p-6 bg-[#261633] flex flex-col items-center relative text-white"
      style={{ fontFamily: "var(--font-jetbrains-mono)" }}>

      <div className="absolute top-4 left-4 z-20">
        <Image src="/Spotify.png" alt="Logo" width={48} height={48} />
      </div>

      <div className="max-w-lg w-full mt-15">
        {artistRank && (
          <div className="flex flex-col items-center text-center my-6">
            <h2 className="text-3xl font-bold">{artist}</h2>
            <div className="text-lg text-gray-400 font-semibold mt-1">
              #{artistRank} All Time
            </div>
          </div>
        )}

        <hr className="my-4 border-gray-200" />

        <section className="bg-[#E1E5C8] rounded-lg p-4 text-black mb-6">
          <div className="flex justify-between">
            <h3 className="text-lg font-bold">{uniqueSongs} songs</h3>
            <h3 className="text-lg font-bold">{totalMinutes} min</h3>
          </div>
          <p className="text-center mt-2 text-sm">{artistPercent}% of your plays</p>
        </section>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Most Listened Songs</h2>
          <ul className="space-y-2">
            {topSongs.map(([track, ms], i) => (
              <li key={track} className="flex justify-between items-center px-4 py-2 bg-[#780251] rounded-lg">
                <span>{i + 1}. {track}</span>
                <span className="text-sm">{Math.round(ms / 60000)} min</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Plays per Month (Last 6 Months)</h2>
          <div className="flex mt-10 items-end h-40 gap-2">
            {playsPerMonth.values.map((value, idx) => {
              const max = Math.max(...playsPerMonth.values, 1)
              return (
                <div key={playsPerMonth.labels[idx]} className="flex flex-col items-center flex-1">
                  <div
                    className="bg-[#780251] w-8 rounded-t"
                    style={{
                      height: `${(value / max) * 160}px`,
                      minHeight: value > 0 ? '8px' : '2px',
                      transition: 'height 0.3s',
                    }}
                    title={`${value} plays`}
                  />
                  <span className="text-xs mt-1">{playsPerMonth.labels[idx].slice(5)}</span>
                </div>
              )
            })}
          </div>
        </div>

        <button className="w-full py-2 px-4 bg-[#780251] mt-6 mb-10 hover:bg-[#460B37] text-white font-medium rounded-full transition duration-200">
          Listen to Artist
        </button>
      </div>

      <NavBar />
    </div>
  )
}

export default ArtistPage