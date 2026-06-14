/* ================================================================
   Favorites.tsx — Manage all favorited venues with one-click booking
   ================================================================ */

import React, { useState, useMemo, useCallback } from 'react';
import type { Venue } from '../types';
import { VENUE_TYPE_LABELS, VENUE_TYPE_TAG_CLASS } from '../types';
import { getVenues, getFavorites, toggleFavorite } from '../utils/storage';

interface Props {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

function renderStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '☆' : '') + '☆'.repeat(empty);
}

export default function Favorites({ onNavigate, showToast }: Props) {
  const [favVersion, setFavVersion] = useState(0);

  const handleRemoveFav = useCallback((venueId: string, venueName: string) => {
    toggleFavorite(venueId);
    setFavVersion((v) => v + 1);
    showToast(`已取消收藏「${venueName}」`, 'success');
  }, [showToast]);

  const favoriteVenues = useMemo(() => {
    void favVersion;
    const favIds = new Set(getFavorites());
    return getVenues().filter((v) => favIds.has(v.id));
  }, [favVersion]);

  return (
    <div className="main-content" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="breadcrumb">
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>首页</a>
        <span>/</span>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('profile'); }}>个人中心</a>
        <span>/</span>
        <span>我的收藏</span>
      </div>

      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>❤️ 我的收藏</h1>

      {favoriteVenues.length === 0 ? (
        <div className="empty-state">
          <div className="icon">💔</div>
          <p>还没有收藏任何场地</p>
          <button
            className="btn-primary"
            style={{ marginTop: 16, maxWidth: 200, margin: '16px auto 0' }}
            onClick={() => onNavigate('home')}
          >
            去发现场地
          </button>
        </div>
      ) : (
        <div className="favorites-list">
          {favoriteVenues.map((venue) => (
            <div key={venue.id} className="favorite-item">
              <img
                className="favorite-item-img"
                src={venue.images[0]}
                alt={venue.name}
                onClick={() => onNavigate('detail', { id: venue.id })}
              />
              <div className="favorite-item-body" onClick={() => onNavigate('detail', { id: venue.id })}>
                <div className="favorite-item-title">{venue.name}</div>
                <span className={`venue-card-tag ${VENUE_TYPE_TAG_CLASS[venue.type]}`}>
                  {VENUE_TYPE_LABELS[venue.type]}
                </span>
                <div className="favorite-item-location">📍 {venue.location}</div>
                <div className="favorite-item-rating">
                  {renderStars(venue.rating)} {venue.rating.toFixed(1)}
                  <span style={{ color: '#aaa', fontSize: '0.8rem', marginLeft: 4 }}>
                    ({venue.reviewCount}条评价)
                  </span>
                </div>
                <div className="favorite-item-price">💰 {venue.price} 元/时段</div>
              </div>
              <div className="favorite-item-actions">
                <button
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem', width: 'auto' }}
                  onClick={() => onNavigate('detail', { id: venue.id })}
                >
                  一键预约
                </button>
                <button
                  className="btn-danger"
                  onClick={() => handleRemoveFav(venue.id, venue.name)}
                >
                  取消收藏
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
