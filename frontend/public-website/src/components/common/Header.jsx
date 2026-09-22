import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { User, MapPin, Mail } from "lucide-react";

import Navbar from "./Navbar";
import NotificationDropdown from "./NotificationDropdown";
import MobileMenu from "./MobileMenu";
import SubscribeModal from "./SubscribeModal";
import AnimatedWeatherIcon from "./AnimatedWeatherIcon";
import AdSlot from "../ads/AdSlot";
import logo from "../../assets/logos/industryodishalogo.png";

export default function Header() {
  const [categories, setCategories] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [weather, setWeather] = useState(null);
  const [locationName, setLocationName] = useState("Bhubaneswar");
  const [weatherLoading, setWeatherLoading] = useState(true);

  useEffect(() => {
    loadCategories();
    getCurrentWeather();
  }, []);

  useEffect(() => {
    const open = () => setSubscribeOpen(true);
    window.addEventListener("open-subscribe", open);
    return () => window.removeEventListener("open-subscribe", open);
  }, []);

  const loadCategories = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api/public"}/categories`
      );
      const list =
        res.data?.data?.categories ||
        res.data?.categories ||
        res.data?.data ||
        [];
      setCategories(Array.isArray(list) ? list : []);
    } catch (err) {
      console.log("Categories Error:", err);
    }
  };

  const getCurrentWeather = async () => {
    // Always show Bhubaneswar weather (Industry Odisha HQ city)
    const BHUBANESWAR = { lat: 20.2961, lon: 85.8245, name: "Bhubaneswar" };
    setLocationName(BHUBANESWAR.name);

    try {
      const weatherRes = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${BHUBANESWAR.lat}&longitude=${BHUBANESWAR.lon}&current=temperature_2m,weather_code&timezone=Asia%2FKolkata`
      );
      setWeather({
        temperature: Math.round(weatherRes.data.current.temperature_2m),
        weatherCode: weatherRes.data.current.weather_code,
      });
    } catch {
      setWeather(null);
    } finally {
      setWeatherLoading(false);
    }
  };

  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="hidden lg:block bg-[#0a4caf] text-white/80 text-xs">
          <div className="max-w-site mx-auto px-4 h-9 flex items-center justify-between">
            <span>{currentDate}</span>
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => setSubscribeOpen(true)}
                className="hover:text-white transition font-semibold"
              >
                Subscribe
              </button>
              <Link to="/about" className="hover:text-white transition">
                About
              </Link>
              <Link to="/contact" className="hover:text-white transition">
                Contact
              </Link>
              <Link to="/privacy-policy" className="hover:text-white transition">
                Privacy
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-site mx-auto px-4">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center min-h-[72px] lg:min-h-[88px] gap-3">
            <div className="flex items-center min-w-0">
              {!weatherLoading && weather ? (
                <div className="flex items-center gap-3 text-ink">
                  <AnimatedWeatherIcon
                    code={weather.weatherCode}
                    className="w-10 h-10 sm:w-11 sm:h-11 shrink-0"
                  />
                  <div className="leading-tight min-w-0">
                    <div className="flex items-center gap-1 text-xs text-ink-muted">
                      <MapPin size={12} />
                      <span className="truncate max-w-[120px] lg:max-w-[160px]">
                        {locationName}
                      </span>
                    </div>
                    <div className="text-lg font-bold">{weather.temperature}°C</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 text-ink-muted text-sm">
                  <AnimatedWeatherIcon code={2} className="w-9 h-9 opacity-80" />
                  <span className="truncate">{locationName}</span>
                </div>
              )}            </div>

            <Link to="/" className="justify-self-center py-2">
              <img
                src={logo}
                alt="Industry Odisha"
                className="h-12 sm:h-14 lg:h-16 object-contain"
              />
            </Link>

            <div className="flex justify-end items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setSubscribeOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#0a4caf] text-white text-sm font-semibold hover:bg-[#0a4caf]/90 transition"
              >
                <Mail size={16} />
                <span className="hidden sm:inline">Subscribe</span>
              </button>

              <NotificationDropdown />

              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border border-slate-300 text-sm font-semibold hover:bg-ink hover:text-white hover:border-ink transition"
              >
                <User size={18} />
                <span className="hidden sm:inline">Sign in</span>
              </Link>
            </div>
          </div>
        </div>

        <Navbar categories={categories} onMenuClick={() => setMenuOpen(true)} />

        <AdSlot
          position="header"
          size="leaderboard"
          label="Sponsored"
          className="max-w-site mx-auto px-4 border-t border-slate-100"
        />
      </header>

      <MobileMenu open={menuOpen} setOpen={setMenuOpen} />

      <SubscribeModal
        open={subscribeOpen}
        onClose={() => setSubscribeOpen(false)}
      />
    </>
  );
}
