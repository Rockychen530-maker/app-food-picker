"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ==================== Types ====================
interface Restaurant {
  id: string;
  name: string;
  rating: number;
  priceLevel: number;
  cuisineType: string;
  distance: string;
  address: string;
  isHidden: boolean;
  lat: number;
  lng: number;
  photoUrl?: string;
  hours?: string;
}

interface FilterState {
  budget: number; // -1: 不限, 0: <$100, 1: $100-300, 2: >$300
  cuisines: string[];
  distance: number; // meters
  hasFamily: boolean;
  hasTakeout: boolean;
  hasParking: boolean;
}

interface LocationState {
  lat: number;
  lng: number;
  name: string;
}

// ==================== Constants ====================
const CUISINES = ["中式", "日式", "韓式", "美式", "義式", "在地小吃", "異國料理"];
const BUDGET_LABELS = ["<$100", "$100-300", ">$300"];
const DISTANCE_OPTIONS = [500, 1000, 5000];

// Demo data for when API fails
const DEMO_RESTAURANTS: Restaurant[] = [
  { id: "1", name: "老街牛肉麵", rating: 4.5, priceLevel: 1, cuisineType: "中式", distance: "320m", address: "台北市大同區保安街", isHidden: false, lat: 25.055, lng: 121.512 },
  { id: "2", name: "味增屋", rating: 4.2, priceLevel: 2, cuisineType: "日式", distance: "580m", address: "台北市大同區民生西路", isHidden: false, lat: 25.056, lng: 121.514 },
  { id: "3", name: "Oppa 韓式燒肉", rating: 4.7, priceLevel: 2, cuisineType: "韓式", distance: "850m", address: "台北市大同區重慶北路", isHidden: false, lat: 25.058, lng: 121.516 },
  { id: "4", name: "阿珠小吃", rating: 4.0, priceLevel: 0, cuisineType: "在地小吃", distance: "420m", address: "台北市大同區歸綏街", isHidden: true, lat: 25.054, lng: 121.511 },
  { id: "5", name: "Solo Pizza", rating: 4.6, priceLevel: 2, cuisineType: "義式", distance: "1200m", address: "台北市大同區承德路", isHidden: false, lat: 25.062, lng: 121.518 },
  { id: "6", name: "漢堡兄弟", rating: 4.3, priceLevel: 1, cuisineType: "美式", distance: "2100m", address: "台北市中山區南京東路", isHidden: false, lat: 25.065, lng: 121.520 },
  { id: "7", name: "泰Thai食堂", rating: 4.4, priceLevel: 1, cuisineType: "異國料理", distance: "650m", address: "台北市大同區太原路", isHidden: true, lat: 25.057, lng: 121.513 },
  { id: "8", name: "阿嬤的灶", rating: 4.8, priceLevel: 0, cuisineType: "在地小吃", distance: "280m", address: "台北市大同區延平北路", isHidden: true, lat: 25.053, lng: 121.510 },
];

// ==================== Components ====================

// Header
function Header({ location }: { location: LocationState | null }) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E74C3C] to-[#C0392B] flex items-center justify-center">
          <span className="text-white text-sm">🎯</span>
        </div>
        <div>
          <h1 className="text-base font-bold text-[#E74C3C] leading-tight">就決定是你了</h1>
          <p className="text-xs text-gray-400">{location?.name || "AI 美食推薦"}</p>
        </div>
      </div>
      <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      </button>
    </header>
  );
}

// Pokeball Button
function PokeballButton({ onClick, isSpinning, disabled }: { onClick: () => void; isSpinning: boolean; disabled: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={onClick}
        disabled={isSpinning || disabled}
        className={`pokeball-btn ${isSpinning ? "spinning" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""} animate-pulse-glow`}
        aria-label="一鍵決定吃什麼"
      />
      <p className="text-xs text-gray-400 font-medium">
        {isSpinning ? "🏃 幫你找美食中..." : disabled ? "載入中..." : "點我決定！"}
      </p>
    </div>
  );
}

// Filter Section
function FilterSection({ filters, onChange }: { filters: FilterState; onChange: (f: FilterState) => void }) {
  const [expanded, setExpanded] = useState(false);

  const toggleCuisine = (cuisine: string) => {
    const next = filters.cuisines.includes(cuisine)
      ? filters.cuisines.filter((c) => c !== cuisine)
      : [...filters.cuisines, cuisine];
    onChange({ ...filters, cuisines: next });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-gray-700"
      >
        <span>🔍 篩選條件</span>
        <span className="text-gray-400">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 animate-slide-up">
          {/* Budget */}
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">💰 預算</p>
            <div className="flex gap-2">
              {BUDGET_LABELS.map((label, i) => (
                <button
                  key={i}
                  onClick={() => onChange({ ...filters, budget: i === 0 ? 0 : i === 1 ? 1 : 2 })}
                  className={`flex-1 py-2 rounded-full text-xs font-medium border transition-all ${
                    filters.budget === (i === 0 ? 0 : i === 1 ? 1 : 2)
                      ? "bg-[#E74C3C] text-white border-[#E74C3C]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#E74C3C]"
                  }`}
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => onChange({ ...filters, budget: -1 })}
                className={`flex-1 py-2 rounded-full text-xs font-medium border transition-all ${
                  filters.budget === -1
                    ? "bg-gray-500 text-white border-gray-500"
                    : "bg-white text-gray-400 border-gray-200"
                }`}
              >
                不限
              </button>
            </div>
          </div>

          {/* Cuisine */}
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">🍜 料理類型</p>
            <div className="flex flex-wrap gap-2">
              {CUISINES.map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => toggleCuisine(cuisine)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    filters.cuisines.includes(cuisine)
                      ? "bg-[#E74C3C] text-white border-[#E74C3C]"
                      : "bg-white text-gray-600 border-gray-200"
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>

          {/* Distance */}
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">📍 距離</p>
            <div className="flex gap-2">
              {DISTANCE_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => onChange({ ...filters, distance: d })}
                  className={`flex-1 py-2 rounded-full text-xs font-medium border transition-all ${
                    filters.distance === d
                      ? "bg-[#E74C3C] text-white border-[#E74C3C]"
                      : "bg-white text-gray-600 border-gray-200"
                  }`}
                >
                  {d >= 1000 ? `${d / 1000}km` : `${d}m`}
                </button>
              ))}
            </div>
          </div>

          {/* Special Needs */}
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">✨ 特殊需求</p>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: "hasFamily", label: "👨‍👩‍👧 適合家庭" },
                { key: "hasTakeout", label: "🥡 可外帶" },
                { key: "hasParking", label: "🚗 有停車位" },
              ].map(({ key, label }) => {
                const k = key as keyof FilterState;
                return (
                  <button
                    key={key}
                    onClick={() => onChange({ ...filters, [key]: !filters[k] })}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      filters[k]
                        ? "bg-[#F39C12] text-white border-[#F39C12]"
                        : "bg-white text-gray-500 border-gray-200"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Map View with real data
function MapView({ restaurants, selectedId, onSelect }: { restaurants: Restaurant[]; selectedId: string | null; onSelect: (r: Restaurant) => void }) {
  return (
    <div className="relative map-container">
      <div className="w-full h-64 bg-gradient-to-br from-[#E8F4F8] to-[#D4E9F7] flex items-center justify-center relative overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(10)].map((_, i) => (
            <div key={`h-${i}`} className="absolute w-full h-px bg-blue-400" style={{ top: `${(i + 1) * 10}%` }} />
          ))}
          {[...Array(10)].map((_, i) => (
            <div key={`v-${i}`} className="absolute h-full w-px bg-blue-400" style={{ left: `${(i + 1) * 10}%` }} />
          ))}
        </div>

        {/* Restaurant Markers */}
        <div className="absolute inset-0 p-4">
          {restaurants.map((r, i) => {
            const style = {
              position: "absolute" as const,
              left: `${10 + (i % 4) * 22}%`,
              top: `${15 + Math.floor(i / 4) * 30}%`,
            };
            return (
              <button
                key={r.id}
                style={style}
                onClick={() => onSelect(r)}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm shadow-lg transition-all ${
                  selectedId === r.id ? "scale-125 z-10 ring-2 ring-[#E74C3C]" : "hover:scale-110"
                } ${r.isHidden ? "bg-yellow-400 text-yellow-900" : "bg-blue-500 text-white"}`}
                title={r.name}
              >
                {r.isHidden ? "⭐" : "📍"}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur rounded-lg px-3 py-1.5 text-xs flex gap-3 shadow-sm">
          <span className="flex items-center gap-1"><span className="text-blue-500">📍</span> Google 店家</span>
          <span className="flex items-center gap-1"><span className="text-yellow-500">⭐</span> 隱藏版</span>
        </div>

        {/* Map Label */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-lg px-3 py-1.5 text-xs text-gray-500 shadow-sm">
          🗺️ {restaurants.length} 家附近美食
        </div>
      </div>
    </div>
  );
}

// Restaurant Card
function RestaurantCard({ restaurant, onClose, onRetry }: { restaurant: Restaurant; onClose: () => void; onRetry: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 animate-in fade-in duration-200">
      <div className="bottom-sheet w-full max-w-md mx-auto p-5 animate-slide-up">
        {/* Hidden Badge */}
        {restaurant.isHidden && (
          <div className="flex items-center gap-1 bg-[#F1C40F]/20 text-[#F1C40F] text-xs font-bold px-3 py-1 rounded-full w-fit mb-3">
            <span>✨</span> 獨家！隱藏版巷弄美食
          </div>
        )}

        {/* Rating & Price */}
        <div className="flex items-center gap-2 mb-2">
          <span className="flex items-center gap-1 bg-[#F39C12] text-white text-xs font-bold px-2 py-0.5 rounded">
            ⭐ {restaurant.rating.toFixed(1)}
          </span>
          <span className="text-xs text-gray-400">
            {"$".repeat(Math.max(1, restaurant.priceLevel))}
          </span>
          <span className="text-xs text-gray-400">• {restaurant.cuisineType}</span>
          {restaurant.hours && (
            <span className="text-xs text-green-600">• {restaurant.hours}</span>
          )}
        </div>

        {/* Name */}
        <h2 className="text-xl font-bold text-gray-800 mb-1">{restaurant.name}</h2>
        <p className="text-sm text-gray-500 mb-4">📍 {restaurant.address} ({restaurant.distance})</p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + " " + restaurant.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-[#3498DB] text-white py-3 rounded-xl font-medium text-sm text-center flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <span>🗺️</span> 查看地圖
          </a>
          <button
            onClick={onRetry}
            className="flex-1 bg-[#E74C3C] text-white py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <span>🔄</span> 再轉一次
          </button>
        </div>

        {/* Dismiss */}
        <button onClick={onClose} className="w-full mt-3 py-2 text-xs text-gray-400">
          暫時不需要
        </button>
      </div>
    </div>
  );
}

// Ad Banner
function AdBanner() {
  return (
    <div className="bg-gradient-to-r from-[#FFF8F0] to-[#FDEBD0] border border-[#F39C12]/30 rounded-xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-[#F39C12]/20 flex items-center justify-center text-xl">🍔</div>
      <div className="flex-1">
        <p className="text-xs text-gray-400">廣告</p>
        <p className="text-sm font-medium text-gray-700">美食外送首選 - 新用戶免運！</p>
      </div>
      <button className="text-xs text-[#E74C3C] font-medium">詳情</button>
    </div>
  );
}

// Bottom Stats
function BottomStats({ count, hiddenCount, loading }: { count: number; hiddenCount: number; loading: boolean }) {
  if (loading) {
    return (
      <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-center justify-center text-xs text-gray-400">
        <span className="animate-pulse">🔄 載入餐廳資料中...</span>
      </div>
    );
  }
  return (
    <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
      <span>共找到 <strong className="text-[#E74C3C]">{count}</strong> 家符合條件</span>
      <span className="flex items-center gap-1">
        <span className="text-yellow-500">⭐</span> {hiddenCount} 家隱藏版待挖掘
      </span>
    </div>
  );
}

// ==================== Main Page ====================
export default function HomePage() {
  const [filters, setFilters] = useState<FilterState>({
    budget: -1,
    cuisines: [],
    distance: 5000,
    hasFamily: false,
    hasTakeout: false,
    hasParking: false,
  });

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<LocationState | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch restaurants from API
  const fetchRestaurants = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    try {
      const query = filters.cuisines.length > 0 ? filters.cuisines.join(",") : "餐廳";
      const response = await fetch(`/api/restaurants?lat=${lat}&lng=${lng}&q=${encodeURIComponent(query)}&num=20`);
      const data = await response.json();

      if (data.success && data.restaurants) {
        setRestaurants(data.restaurants);
      } else {
        throw new Error(data.error || "Failed to fetch restaurants");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("無法載入餐廳，使用示範資料");
      setRestaurants(DEMO_RESTAURANTS);
    } finally {
      setLoading(false);
    }
  }, [filters.cuisines]);

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({
            lat: latitude,
            lng: longitude,
            name: "目前位置",
          });
          fetchRestaurants(latitude, longitude);
        },
        () => {
          // Fallback to Taipei if location denied
          setLocation({ lat: 25.033, lng: 121.5654, name: "台北市" });
          fetchRestaurants(25.033, 121.5654);
        }
      );
    } else {
      setLocation({ lat: 25.033, lng: 121.5654, name: "台北市" });
      fetchRestaurants(25.033, 121.5654);
    }
  }, []);

  // Re-fetch when filters change
  useEffect(() => {
    if (location) {
      fetchRestaurants(location.lat, location.lng);
    }
  }, [filters.cuisines, filters.distance, location, fetchRestaurants]);

  // Filter restaurants based on filters
  const filteredRestaurants = restaurants.filter((r) => {
    if (filters.budget >= 0 && r.priceLevel !== filters.budget) return false;
    if (filters.cuisines.length > 0 && !filters.cuisines.includes(r.cuisineType)) return false;
    return true;
  });

  const hiddenCount = filteredRestaurants.filter((r) => r.isHidden).length;

  const handleDecide = useCallback(() => {
    if (filteredRestaurants.length === 0) return;

    setIsSpinning(true);
    setShowResult(false);

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * filteredRestaurants.length);
      const chosen = filteredRestaurants[randomIndex];
      setSelectedRestaurant(chosen);
      setIsSpinning(false);
      setShowResult(true);
    }, 1500);
  }, [filteredRestaurants]);

  const handleClose = () => {
    setShowResult(false);
    setSelectedRestaurant(null);
  };

  const handleRetry = () => {
    setShowResult(false);
    setTimeout(() => handleDecide(), 100);
  };

  return (
    <div className="min-h-dvh bg-[#FFF8F0] flex flex-col">
      <Header location={location} />

      <main className="flex-1 overflow-y-auto pb-20">
        {/* Pokeball Section */}
        <section className="flex flex-col items-center py-8 gap-4">
          <PokeballButton onClick={handleDecide} isSpinning={isSpinning} disabled={loading || filteredRestaurants.length === 0} />
          <p className="text-sm text-gray-500 text-center px-4">
            {isSpinning
              ? "🏃 幫你找美食中..."
              : loading
              ? "載入附近美食..."
              : filteredRestaurants.length > 0
              ? "按下去，一秒解決選擇困難！"
              : "沒有找到符合條件的店家"}
          </p>
        </section>

        {/* Filter */}
        <section className="px-4 mb-4">
          <FilterSection filters={filters} onChange={setFilters} />
        </section>

        {/* Ad Banner */}
        <section className="px-4 mb-4">
          <AdBanner />
        </section>

        {/* Map */}
        <section className="px-4 mb-4">
          <h3 className="text-sm font-bold text-gray-700 mb-2">📍 附近美食</h3>
          <MapView
            restaurants={filteredRestaurants}
            selectedId={selectedRestaurant?.id ?? null}
            onSelect={(r) => {
              setSelectedRestaurant(r);
              setShowResult(true);
            }}
          />
        </section>

        {/* Restaurant List */}
        <section className="px-4 mb-4 space-y-3">
          <h3 className="text-sm font-bold text-gray-700">🍽️ 符合條件的店家</h3>
          {loading ? (
            <div className="bg-white rounded-xl p-6 text-center">
              <span className="text-3xl">⏳</span>
              <p className="text-sm text-gray-500 mt-2">載入餐廳資料中...</p>
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center">
              <span className="text-3xl">🤔</span>
              <p className="text-sm text-gray-500 mt-2">沒有找到符合條件的店家</p>
              <p className="text-xs text-gray-400 mt-1">試試放寬篩選條件</p>
            </div>
          ) : (
            filteredRestaurants.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setSelectedRestaurant(r);
                  setShowResult(true);
                }}
                className="restaurant-card w-full p-4 text-left flex items-center gap-3"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${r.isHidden ? "bg-yellow-100" : "bg-gray-100"}`}>
                  {r.isHidden ? "⭐" : "🍽️"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-gray-800 truncate">{r.name}</h4>
                    {r.isHidden && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">隱藏版</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{r.cuisineType} • {r.distance}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-yellow-600">⭐ {r.rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-400">{"$".repeat(Math.max(1, r.priceLevel))}</span>
                    {r.hours && <span className="text-xs text-green-600">{r.hours}</span>}
                  </div>
                </div>
                <span className="text-gray-300">›</span>
              </button>
            ))
          )}
        </section>
      </main>

      <BottomStats count={filteredRestaurants.length} hiddenCount={hiddenCount} loading={loading} />

      {showResult && selectedRestaurant && (
        <RestaurantCard
          restaurant={selectedRestaurant}
          onClose={handleClose}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
}