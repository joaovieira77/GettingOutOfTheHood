"use client";

import React, { useEffect, useState, useMemo } from "react";
import NavBar from "@/Componente/NavBar";
import Image from "next/image";

interface Entry {
  ts: string;
  ms_played: number;
  master_metadata_track_name: string | null;
  master_metadata_album_artist_name: string | null;
  master_metadata_album_album_name: string | null;
  skipped: boolean | null;
}

export default function ProfilePage() {
  const [data, setData] = useState<Entry[]>([]);
  const [latestDate, setLatestDate] = useState<Date | null>(null);

  useEffect(() => {
    fetch("/history.json")
      .then((res) => res.json())
      .then((json: any[]) => {
        const filtered = json.filter(
          (e) =>
            typeof e.ms_played === "number" &&
            e.master_metadata_track_name &&
            e.master_metadata_album_artist_name &&
            e.skipped !== true
        );
        setData(filtered);

        const dates = filtered
          .filter((e) => !!e.ts)
          .map((e) => new Date(e.ts));
  // Extracts all valid timestamps
        if (dates.length > 0) {
          const mostRecent = dates.reduce((latest, current) =>
            current > latest ? current : latest // Find latest play date
          );
          setLatestDate(mostRecent);
        }
      })
      .catch(console.error);
  }, []);

  const stats = useMemo(() => {
    if (data.length === 0) return null;

    const totalMs = data.reduce((sum, e) => sum + e.ms_played, 0);
    const totalMinutes = Math.round(totalMs / 60000);     // Total listening time in minutes

    const artistMap = new Map<string, number>();
    data.forEach((e) => {
      const artist = e.master_metadata_album_artist_name;
      if (artist) artistMap.set(artist, (artistMap.get(artist) || 0) + e.ms_played);
    });    // Creates a map: artist → total ms_played

    const topArtist = Array.from(artistMap.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0];// Top artist by listening time
 
    const artistCount = new Set(
      data.map((e) => e.master_metadata_album_artist_name)
    ).size;    // Number of unique artists

    const lastPlayed = data.reduce((latest, entry) => {
      return new Date(entry.ts) > new Date(latest.ts) ? entry : latest;
    });  // Most recent track played

    const uniqueDays = new Set(
      data.map((e) => new Date(e.ts).toISOString().split("T")[0])
    ).size;   // Count of unique listening days

    const avgPerDay = Math.round(totalMinutes / (uniqueDays || 1));    // Average listening time per day

    return {
      totalMinutes,
      artistCount,
      topArtist,
      avgPerDay,
      lastPlayed,
    };
  }, [data]);

  const streak = useMemo(() => {
    if (data.length === 0) return 0;

    const dias = new Set(
      data.map((e) => new Date(e.ts).toISOString().split("T")[0])
    );
    // Unique dates you listened to music
    const diasArray = Array.from(dias)
      .map((d) => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());   // Sorted array of those dates, newest first

    let streakCount = 1;
    for (let i = 1; i < diasArray.length; i++) {
      const diff =
        (diasArray[i - 1].getTime() - diasArray[i].getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streakCount++;
      } else if (diff > 1) {
        break;
      }
    }

    return streakCount;
  }, [data]);
// get top 3 artists by total listening time
  const topArtists = useMemo(() => {
    const artistMap = new Map<string, number>();
    data.forEach((e) => {
      const artist = e.master_metadata_album_artist_name;
      if (artist) artistMap.set(artist, (artistMap.get(artist) || 0) + e.ms_played);
    });

    return Array.from(artistMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([artist]) => artist);
  }, [data]);

  if (!stats) return <div className="text-white p-6">Loading...</div>;

  return (
    <main className="bg-[#261633] min-h-screen max-w-md mx-auto px-4 py-8 text-white"
     style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
      <div className="absolute top-4 left-4 z-20">
        <Image src="/Spotify.png" alt="Logo" width={48} height={48} />
      </div>

      <div className="flex flex-col items-center mb-4">
        <div className="mt-2 text-center">
          <h2 className="text-xl font-semibold">Username</h2>
          <span className="text-sm text-gray-300">Streak 🔥 {streak} days</span>
        </div>
      </div>

      <section className="bg-[#E1E5C8] rounded-lg p-4 text-black mb-4">
        <div className="flex justify-between">
          <div>
            <p className="text-sm">Minutes</p>
            <h3 className="text-lg font-bold">{stats.totalMinutes}</h3>
          </div>
          <div>
            <p className="text-sm">Artists</p>
            <h3 className="text-lg font-bold">{stats.artistCount}</h3>
          </div>
        </div>
        <p className="text-center mt-2 text-sm">Top Artist</p>
        <div className="text-center font-bold">
          <p>{stats.topArtist}</p>
        </div>
      </section>

      <section className="flex gap-2 mb-4">
        <div className="bg-[#CD1A92] rounded-lg p-4 flex-1 text-center">
          <p className="text-sm">{stats.avgPerDay} min</p>
          <span className="text-xs">per day</span>
        </div>
        <div className="bg-[#620BDC] rounded-lg p-4 flex-1 text-center">
          <p className="text-sm font-bold mb-1">Last song listened</p>
          <p className="text-xs">
            {stats.lastPlayed.master_metadata_track_name}<br />
            <span className="text-gray-300">
              {stats.lastPlayed.master_metadata_album_artist_name}
            </span>
          </p>
        </div>
      </section>

      <section className="bg-[#780251] rounded-lg p-4 mb-4">
        <h4 className="font-semibold mb-2 text-white">Genre</h4>
        <p className="text-sm mb-2">Your top genre is //genre//</p>
        <div className="space-y-1">
          <div className="bg-white h-3 w-4/5 rounded"></div>
          <div className="bg-white h-3 w-3/5 rounded"></div>
          <div className="bg-white h-3 w-2/5 rounded"></div>
        </div>
      </section>

      <section className="bg-[#B53304] rounded-lg p-4 text-white text-center mb-10">
        <p className="text-sm mb-2">Top 3 Artists</p>
        <ol className="text-lg font-semibold space-y-1">
          {topArtists.map((artist, index) => (
            <li key={artist}>
              {index + 1}. {artist}
            </li>
          ))}
        </ol>
      </section>

      <NavBar />
    </main>
  );
}
