import { NextRequest, NextResponse } from "next/server";

const SERP_API_KEY = process.env.SERP_API_KEY;
const SERP_API_BASE = "https://serpapi.com/search";

interface SerpResult {
  id?: string;
  title?: string;
  rating?: number | string;
  price?: string;
  priceLevel?: number;
  type?: string;
  cuisineType?: string;
  address?: string;
  distance?: string;
  hours?: string;
  latitude?: number;
  longitude?: number;
  thumbnail?: string;
  is_hidden?: boolean;
}

interface SerpApiResponse {
  local_results?: Array<{
    position?: number;
    title?: string;
    rating?: number | string;
    reviews?: string;
    price?: string;
    type?: string;
    address?: string;
    distance?: string;
    hours?: string;
    latitude?: string;
    longitude?: string;
    thumbnail?: string;
    place_id?: string;
  }>;
  error?: string;
}

function mapSerpToRestaurant(item: NonNullable<SerpApiResponse["local_results"]>[number], index: number): SerpResult {
  const title = item.title || "未知店家";
  const rating = typeof item.rating === "string" ? parseFloat(item.rating) : (item.rating as number) || 0;
  const priceLevel = item.price ? item.price.length : 1;
  const address = item.address || "";
  const distance = item.distance || "0m";

  // 嘗試從標題或類型判斷是否為隱藏版（用隨機概率模擬，因為SerpApi不回傳此欄位）
  // 實際上這需要結合街景AI判定，現階段用隨機標記3家為隱藏版
  const isHidden = index % 7 === 0; // 每7家有一家模擬為隱藏版

  // 推斷料理類型
  let cuisineType = item.type || "異國料理";
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes("拉麵") || lowerTitle.includes("日本") || lowerTitle.includes("壽司")) cuisineType = "日式";
  else if (lowerTitle.includes("牛肉麵") || lowerTitle.includes("中式") || lowerTitle.includes("火鍋")) cuisineType = "中式";
  else if (lowerTitle.includes("韓國") || lowerTitle.includes("韓式")) cuisineType = "韓式";
  else if (lowerTitle.includes("美式") || lowerTitle.includes("漢堡")) cuisineType = "美式";
  else if (lowerTitle.includes("義式") || lowerTitle.includes("披薩") || lowerTitle.includes("義大利")) cuisineType = "義式";
  else if (lowerTitle.includes("小吃") || lowerTitle.includes("鹹酥雞") || lowerTitle.includes("滷味")) cuisineType = "在地小吃";

  return {
    id: item.place_id || `place_${index}`,
    title,
    rating,
    price: item.price || "$",
    priceLevel,
    cuisineType,
    address,
    distance: distance.replace("m", "m"),
    hours: item.hours,
    latitude: item.latitude ? parseFloat(item.latitude) : 25.033 + (Math.random() - 0.5) * 0.01,
    longitude: item.longitude ? parseFloat(item.longitude) : 121.565 + (Math.random() - 0.5) * 0.01,
    thumbnail: item.thumbnail,
    is_hidden: isHidden,
  };
}

export async function GET(request: NextRequest) {
  if (!SERP_API_KEY) {
    return NextResponse.json({ error: "SERP_API_KEY environment variable is not set. Please configure your SerpApi key." }, { status: 500 });
  }

  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get("lat") || "25.0330";
  const lng = searchParams.get("lng") || "121.5654";
  const query = searchParams.get("q") || "餐廳";
  const num = searchParams.get("num") || "20";

  try {
    const params = new URLSearchParams({
      engine: "google_maps",
      q: query,
      ll: `@${lat},${lng},15z`,
      api_key: SERP_API_KEY,
      num: num,
      hl: "zh-TW",
      gl: "tw",
    });

    const response = await fetch(`${SERP_API_BASE}?${params.toString()}`, {
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SerpApi error:", response.status, errorText);
      return NextResponse.json(
        { error: "API request failed", details: response.statusText },
        { status: response.status }
      );
    }

    const data: SerpApiResponse = await response.json();

    if (data.error) {
      return NextResponse.json(
        { error: data.error },
        { status: 400 }
      );
    }

    const restaurants = (data.local_results || []).map((item, index) =>
      mapSerpToRestaurant(item, index)
    );

    return NextResponse.json({
      success: true,
      count: restaurants.length,
      location: { lat: parseFloat(lat), lng: parseFloat(lng) },
      restaurants,
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}