'use client'

import React, { useEffect, useState, useMemo } from 'react'
import NavBar from '@/Componente/NavBar'
import Image from 'next/image'
import Link from 'next/link'

type Entry = {
  ts: string
  ms_played: number
  master_metadata_track_name: string | null
  master_metadata_album_artist_name: string | null
  skipped: boolean | null
}

type Period = '1 week' | '1 month' | '6 months' | 'All time'
type View   = 'songs' | 'artists'

interface TopItem {
  rank: number
  title: string
  subtitle?: string   // for songs: artist name; for artists: undefined
  totalMs: number
}

const periods: Period[] = ['1 week', '1 month', '6 months', 'All time']

export default function TopPage() {
  const [view, setView] = useState<View>('songs')
  const [period, setPeriod] = useState<Period>('All time')
  const [data, setData] = useState<Entry[]>([])
  const [latestDate, setLatestDate] = useState<Date | null>(null)

  // 1) load the full history and find latest date
  useEffect(() => {
    fetch('/history.json')
      .then(res => res.json())
      .then((json: any[]) => {
        // filter valid entries
        const filtered = json.filter(e =>
          typeof e.ms_played === 'number' &&
          e.master_metadata_track_name &&
          e.master_metadata_album_artist_name &&
          e.skipped !== true
        )
        setData(filtered)

        // find latest date
        const dates = filtered
          .filter(e => !!e.ts)
          .map(e => new Date(e.ts))
        if (dates.length > 0) {
          const mostRecent = dates.reduce((latest, current) => current > latest ? current : latest)
          setLatestDate(mostRecent)
        }
      })
      .catch(console.error)
  }, [])

  // 2) derive topItems based on view and period
  const topItems = useMemo(() => {
    if (!latestDate) return [];

    // Calculate the start date based on the selected period
    let startDate: Date | null = null;
    if (period === '1 week') {
      startDate = new Date(latestDate);
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === '1 month') {
      startDate = new Date(latestDate);
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === '6 months') {
      startDate = new Date(latestDate);
      startDate.setMonth(startDate.getMonth() - 6);
    } else if (period === 'All time') {
      startDate = null;
    }

    // Filter data by period
    const filteredData = startDate
      ? data.filter(e => {
          if (!e.ts) return false;
          const entryDate = new Date(e.ts);
          return entryDate >= startDate && entryDate <= latestDate;
        })
      : data;

    // Group and rank as
    const map = new Map<string, number>();
    filteredData.forEach(({ ms_played, master_metadata_track_name: track, master_metadata_album_artist_name: artist }) => {
      const safeArtist = artist ?? 'Unknown Artist';
      const key = view === 'songs'
        ? `${track}@@@${safeArtist}`
        : safeArtist;
      map.set(key, (map.get(key) || 0) + ms_played);
    });

    const arr: TopItem[] = Array.from(map.entries())
      .map(([key, totalMs]) => {
        if (view === 'songs') {
          const [track, artist] = key.split('@@@');
          return { rank: 0, title: track, subtitle: artist, totalMs };
        } else {
          return { rank: 0, title: key, totalMs };
        }
      })
      .sort((a, b) => b.totalMs - a.totalMs)
      .slice(0, 100)
      .map((item, i) => ({ ...item, rank: i + 1 }));

    return arr;
  }, [data, view, period, latestDate]);

  return (
    <>
      <main className="bg-[#261633] min-h-screen max-w-md mx-auto px-4 pt-20 pb-20 space-y-4 text-white">
      <div className="absolute top-4 left-4 z-20">
            <Image src="/Spotify.png" alt="Logo" width={48} height={48} />
          </div>
        <h1 className="text-center text-2xl font-bold">
          Top #100 {view === 'songs' ? 'Songs' : 'Artists'}
        </h1>

       

        {/* view toggle */}
        <div className="flex justify-center space-x-2">
          {(['songs','artists'] as View[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                view === v ? 'bg-[#460B37] text-white' : 'bg-gray-200 text-black'
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        {/* period toggle (stubbed) */}
        <div className="flex justify-center space-x-2 overflow-x-auto pb-2">
          {periods.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 whitespace-nowrap rounded-full text-xs font-medium ${
                period === p ? 'bg-[#460B37] text-white' : 'bg-gray-200 text-black'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* list */}
        <ul className="space-y-1">
          {topItems.map(({ rank, title, subtitle, totalMs }) => {
            const href =
  view === 'songs'
    ? `/track?track=${encodeURIComponent(title)}&artist=${encodeURIComponent(subtitle ?? '')}`
    : `/artist/${encodeURIComponent(title)}`;
            return (
              <li key={title + subtitle} className="rounded-lg overflow-hidden">
                <Link
                  href={href}
                  className="flex justify-between items-center bg-[#780251] px-4 py-2 w-full h-full hover:bg-[#a03a7a] transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">
                      {rank}. {title}
                    </span>
                    {subtitle && <span className="text-sm text-gray-400">{subtitle}</span>}
                  </div>
                  <span className="text-xs text-gray-400">{Math.round(totalMs/60000)} min</span>
                </Link>
              </li>
            );
          })}
        </ul> 
        <NavBar />
      </main>
    </>
  )
}