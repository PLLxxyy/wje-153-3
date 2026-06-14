/* ================================================================
   Home.tsx — Venue list with category filter, search, and favorites
   ================================================================ */

import React, { useState, useMemo, useCallback } from 'react';
import type { Venue, VenueType } from '../types';
import { VENUE_TYPE_LABELS, VENUE_TYPE_TAG_CLASS } from '../types';
import { getVenues, getFavorites, isFavorite, toggleFavorite } from '../utils/storage';

interface Props {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

const ALL_CATEGORIES: ('all' | VenueType)[] = ['all', 'basketball', 'badminton', 'pingpong', 'tennis', 'football'];

const CATEGORY_LABELS: Record<string, string> = {
  all: '全部',
  ...VENUE_TYPE_LABELS,
};

function renderStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '☆' : '') + '☆'.repeat(empty);
}

export default function Home({ onNavigate }: Props) {
  const venues = useMemo(() => getVenues(), []);
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [favVersion, setFavVersion] = useState(0);

  const handleToggleFav = useCallback((e: React.MouseEvent, venueId: string) => {
    e.stopPropagation();
    toggleFavorite(venueId);
    setFavVersion((v) => v + 1);
  }, []);

  const favoriteIds = useMemo(() => {
    void favVersion;
    return new Set(getFavorites());
  }, [favVersion]);

  const filtered = useMemo(() => {
    let list = venues;
    if (category !== 'all') {
      list = list.filter((v) => v.type === category);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.location.toLowerCase().includes(q) ||
          VENUE_TYPE_LABELS[v.type].includes(q),
      );
    }
    list = [...list].sort((a, b) => {
      const aFav = favoriteIds.has(a.id) ? 0 : 1;
      const bFav = favoriteIds.has(b.id) ? 0 : 1;
      return aFav - bFav;
    });
    return list;
  }, [venues, category, search, favoriteIds]);

  return (
    <div>
      {/* Hero */}
      <div className="hero-section">
        <h1>运动场地预约平台</h1>
        <p>查找并预约您身边的优质运动场地</p>
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="搜索场地名称、位置或类型..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="main-content">
        {/* Category tabs */}
        <div className="category-tabs" style={{ marginTop: 20 }}>
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-tab ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Venue grid */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🏟️</div>
            <p>没有找到符合条件的场地</p>
          </div>
        ) : (
          <div className="venue-grid">
            {filtered.map((venue) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                isFav={favoriteIds.has(venue.id)}
                onToggleFav={handleToggleFav}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function VenueCard({
  venue,
  isFav,
  onToggleFav,
  onNavigate,
}: {
  venue: Venue;
  isFav: boolean;
  onToggleFav: (e: React.MouseEvent, venueId: string) => void;
  onNavigate: Props['onNavigate'];
}) {
  return (
    <div className="venue-card" onClick={() => onNavigate('detail', { id: venue.id })}>
      <div className="venue-card-img-wrapper">
        <img className="venue-card-img" src={venue.images[0]} alt={venue.name} loading="lazy" />
        {isFav && <span className="fav-badge">已收藏</span>}
        <button
          className={`fav-btn ${isFav ? 'active' : ''}`}
          onClick={(e) => onToggleFav(e, venue.id)}
          title={isFav ? '取消收藏' : '收藏'}
        >
          {isFav ? '❤️' : '🤍'}
        </button>
      </div>
      <div className="venue-card-body">
        <div className="venue-card-title">{venue.name}</div>
        <span className={`venue-card-tag ${VENUE_TYPE_TAG_CLASS[venue.type]}`}>
          {VENUE_TYPE_LABELS[venue.type]}
        </span>
        <div className="venue-card-location">📍 {venue.location}</div>
        <div className="venue-card-rating">
          <span>{renderStars(venue.rating)}</span>
          <span>{venue.rating.toFixed(1)}</span>
          <span style={{ color: '#aaa', fontSize: '0.8rem' }}>({venue.reviewCount}条评价)</span>
        </div>
      </div>
    </div>
  );
}
