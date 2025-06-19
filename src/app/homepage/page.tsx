'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { BarChart } from '@/Componente/BarChart'
import NavBar from  '@/Componente/NavBar'
import Image from 'next/image'
import Link from 'next/link'
type Entry = {
  ts: string
  ms_played: number
  master_metadata_track_name: string | null
  master_metadata_album_artist_name: string | null
  skipped: boolean | null
}

type Season = 'Winter' | 'Spring' | 'Summer' | 'Fall'

// Determine season by exact day/month (solstices & equinoxes)
const getSeason = (date: Date): Season => {
  const d = date.getUTCDate()
  const m = date.getUTCMonth() + 1

  // Winter: Dec 21–Feb 28/29, and Mar 1–19
  if ((m === 12 && d >= 21) || m === 1 || m === 2 || (m === 3 && d < 20)) {
    return 'Winter'
  }

  // Spring: Mar 20–May 31, and Jun 1–20
  if ((m === 3 && d >= 20) || m === 4 || m === 5 || (m === 6 && d < 21)) {
    return 'Spring'
  }

  // Summer: Jun 21–Aug 31, and Sep 1–22
  if ((m === 6 && d >= 21) || m === 7 || m === 8 || (m === 9 && d < 23)) {
    return 'Summer'
  }

  // Fall: Sep 23–Dec 20
  return 'Fall'
}

// Color the Bg for the seasons
const getSeasonBg = (season: Season): string => {
  switch (season) {
    case 'Winter': return 'bg-[#6eaee8]'
    case 'Spring': return 'bg-[#81d8b3]'
    case 'Summer': return 'bg-[#ffd166]'
    case 'Fall':   return 'bg-[#ff7f51]'
  }
}

export default function Home() {
  const [data, setData] = useState<Entry[]>([]) // Raw listening data
  const [view, setView] = useState<'season' | 'timeofday'>('season') // Chart toggle view
  const [seasonFilter, setSeasonFilter] = useState<Season>('Winter') // Season for top songs
  const [artistSeasonFilter, setArtistSeasonFilter] = useState<Season>('Winter') // Season for top artists

 useEffect(() => {
    fetch('/history.json')
      .then(res => res.json())
      .then((json: any[]) => {
        //  filter shape
        setData(
          json.filter(e =>
            typeof e.ms_played === 'number' &&
            e.master_metadata_track_name &&
            e.master_metadata_album_artist_name &&
            e.skipped !== true
          )
        )
      })
      .catch(console.error)
  }, [])

  const stats = useMemo(() => {
    const seasonCount: Record<Season, number> = {
      Winter: 0, Spring: 0, Summer: 0, Fall: 0
    }
    const hourCount: Record<number, number> = {}
    const seasonalSongs: Record<Season, Record<string, number>> = {
      Winter: {}, Spring: {}, Summer: {}, Fall: {}
    }
    const seasonalArtists: Record<Season, Record<string, number>> = {
      Winter: {}, Spring: {}, Summer: {}, Fall: {}
    }
    const trackArtistMap: Record<string, string> = {}

    data.forEach(entry => {
      const {
        ts,
        ms_played,
        master_metadata_track_name: track,
        master_metadata_album_artist_name: artist,
        skipped
      } = entry

      // skip podcasts (no track/artist)
      //  skip manually skipped plays
      

      // remember who the artist is for this track
      if (track && artist && !trackArtistMap[track]) {
        trackArtistMap[track] = artist
      }

      const date = new Date(ts)
      const season = getSeason(date)
      const hour = date.getUTCHours()

      seasonCount[season] += ms_played // accumulate ms_played for the season
      // accumulate ms_played for the hour
      hourCount[hour] = (hourCount[hour] || 0) + ms_played //
      if (track) {
        seasonalSongs[season][track] =
          (seasonalSongs[season][track] || 0) + ms_played // accumulate ms_played for the track
      }
      if (artist) {
        seasonalArtists[season][artist] =
          (seasonalArtists[season][artist] || 0) + ms_played // accumulate ms_played for the artist
      }
    })
// Sort the seasonal counts and hours
    const sort = (obj: Record<string, number>) =>
      Object.entries(obj).sort((a, b) => b[1] - a[1])

    return {
      topSeasons: sort(seasonCount as Record<string, number>),
      topHours:   sort(hourCount),
      songs:      seasonalSongs,
      artists:    seasonalArtists,
      trackArtistMap,
    }
  }, [data])

  // take top 5 songs & artists for the selected season
  const topSongs = Object.entries(stats.songs[seasonFilter])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

 const topArtists = Object.entries(stats.artists[artistSeasonFilter])

    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <>
    <main className="bg-[#261633] max-w-md mx-auto pt-22 px-4 py-6 space-y-6">
      
<div className="absolute top-4 left-4 z-20">
            <Image src="/Spotify.png" alt="Logo" width={48} height={48} />
          </div>
      {/* Toggle */}
      <div className="flex justify-center space-x-2 mb-4">
        {['season', 'timeofday'].map(v => (
          <button
            key={v}
            onClick={() => setView(v as typeof view)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              view === v
                ? 'bg-[#460B37] text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
             style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            {v === 'season'
              ? 'Seasonal Distribution'
              : 'Most Listened Time'}
              
          </button>
        ))}
      </div>

      {/* Chart */}
      {view === 'season' ? (
        <BarChart
          title="Listening by Season"
          labels={stats.topSeasons.map(([s]) => s)}
          values={stats.topSeasons.map(([, ms]) => ms)}
          
        />
      ) : (
        <BarChart
          title="Listening by Hour"
          labels={stats.topHours.slice(0, 5).map(([h]) => `${h}:00`)}
          values={stats.topHours.slice(0, 5).map(([, ms]) => ms)}
        />
      )}

      {/* Top Songs */}
      <section>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-base font-semibold text-white"
          
          >Songs</h2>
          <div className="flex gap-2">
            {['Winter','Spring','Summer','Fall'].map(s => (
              <button
                key={s}
                onClick={() => setSeasonFilter(s as Season)}
                className={`px-3 py-1 text-xs rounded-full ${
                  seasonFilter === s
                    ? 'bg-[#460B37] text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
                
              style={{ fontFamily: "var(--font-geist-mono)" }} >
                {s}
              </button>
            ))}
          </div>
        </div>
        <ul
          className={`${getSeasonBg(seasonFilter)}
                      rounded-lg shadow text-sm text-gray-800`}
        
        >
          {topSongs.map(([song, ms], i) => {
            const artist = stats.trackArtistMap[song]
            return (
              <li
                key={song}
                className="flex justify-between px-4 py-2"
              >
                <div className="flex flex-col">
                  <span className=" font-medium text-white"
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                    {i + 1}. {song}
                  </span>
                  <span className="text-xs text-gray-200"
                  >
                    {artist}
                  </span>
                </div>
                <span className="text-white">
                  {Math.round(ms / 60000)} min
                </span>
              </li>
            )
          })}
        </ul>
      </section>

      {/* Top Artists */}
      <section>
                        
        <div className="flex justify-between items-center  mb-2">
  <h2 className="text-base font-semibold text-white">Artists</h2>
  <div className="flex gap-2">
    {['Winter','Spring','Summer','Fall'].map(s => (
      <button
        key={s}
        onClick={() => setArtistSeasonFilter(s as Season)}
        className={`px-3 py-1 text-xs rounded-full ${
          artistSeasonFilter === s
            ? 'bg-[#460B37] text-white'
            : 'bg-gray-200 text-gray-700'
        }`}
       style={{ fontFamily: "var(--font-geist-mono)" }}>
        {s}
      </button>
    ))}
  </div>
</div>

        <ul
          className={`${getSeasonBg(artistSeasonFilter)}
                      rounded-lg  shadow text-sm text-gray-800 mb-10`}
        >
          {topArtists.map(([artist, ms], i) => (
            <li
              key={artist}
              className="flex justify-between px-4 py-2"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
              <span className="text-white">
                {i + 1}. {artist}
              </span>
              <span className="text-white">
                {Math.round(ms / 60000)} min
              </span>
            </li>
          ))}
        </ul>
      </section> 
      <NavBar />
    </main>
         
    
  
   </>
  ) 
}  
