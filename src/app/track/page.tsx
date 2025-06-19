'use client'

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import NavBar from '@/Componente/NavBar';
import Image from 'next/image';
import Link from 'next/link';

const SongPage = () => {
  const searchParams = useSearchParams();
  const track = searchParams.get('track') || 'Unknown Track';
  const artist = searchParams.get('artist') || 'Unknown Artist';

  const [data, setData] = useState<any[]>([]);
  const [latestDate, setLatestDate] = useState<Date | null>(null);
  const [playsPerMonth, setPlaysPerMonth] = useState<{ labels: string[]; values: number[] }>({ labels: [], values: [] });

 
  useEffect(() => {
    fetch('/history.json')
      .then(res => res.json())
      .then((json: any[]) => {
        const filtered = json.filter((e: any) =>
          typeof e.ms_played === 'number' &&
          e.master_metadata_track_name === track &&
          e.master_metadata_album_artist_name === artist &&
          e.skipped !== true
        );
        setData(filtered);

        if (filtered.length > 0) {
          const latest = filtered.reduce(
            (a: typeof filtered[0], b: typeof filtered[0]) =>
              new Date(a.ts) > new Date(b.ts) ? a : b
          );
          setLatestDate(new Date(latest.ts));
        }
      })
      .catch(console.error);
  }, [track, artist]);

  const album = data[0]?.master_metadata_album_album_name || 'Unknown Album';
  const totalPlays = data.length;
  const totalMinutes = Math.round(data.reduce((acc, e) => acc + e.ms_played, 0) / 60000);

  // Plays per month calculation
  useEffect(() => {
    if (!data.length || !latestDate) return;

    const months: Record<string, number> = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date(latestDate.getFullYear(), latestDate.getMonth() - i, 1);
      const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[label] = 0;
    }

    data.forEach(entry => {
      const date = new Date(entry.ts);
      const label = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (label in months) months[label]++;
    });

    setPlaysPerMonth({
      labels: Object.keys(months),
      values: Object.values(months),
    });
  }, [data, latestDate]);

  return (
    <div className="w-full min-h-screen mx-auto p-6 bg-[#261633] flex flex-col items-center relative text-white">
      <div className="absolute top-4 left-4 z-20">
        <Image src="/Spotify.png" alt="Logo" width={48} height={48} />
      </div>

      <div className="max-w-lg w-full mt-15">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-xl font-bold">{track}</h1>
          <span className="text-white-500">~{totalMinutes} min</span>
        </div>

        <div className="flex justify-between items-center mb-1">
          <p className="text-white-600">{artist}</p>
          <span className="text-white-500">{totalPlays} plays</span>
        </div>

        <p className="text-white-500 text-sm mb-3">{album}</p>
        <hr className="my-3 border-gray-200" />

        <div className="flex justify-center flex-wrap gap-2 mb-6">
          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">Genre</span>
          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">Genre</span>
          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">Genre</span>
        </div>

        <div className="mb-6 ">
          <h2 className="text-lg font-semibold mb-2">Plays per Month (Last 6 Months)</h2>
          <div className="flex mt-10 items-end h-40 gap-2">
            {playsPerMonth.values.map((value, idx) => {
              const max = Math.max(...playsPerMonth.values, 1);
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
                  <span className="text-xs mt-1 text-white">{playsPerMonth.labels[idx].slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <button className="w-full py-2 px-4 bg-[#780251] mt-6 hover:bg-[#460B37] text-white font-medium rounded-full transition duration-200">Listen Now</button>
          <Link
  href={`/artist/${encodeURIComponent(artist)}`}
  className="w-full py-2 px-4 bg-[#780251] hover:bg-[#460B37] text-white font-medium rounded-full transition duration-200 text-center rounded-full"
>
  View Artist
</Link>
        </div>
      </div>

      <NavBar />
    </div>
  );
};

export default SongPage;
