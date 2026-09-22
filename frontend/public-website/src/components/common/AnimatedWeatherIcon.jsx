import React from "react";

/**
 * Flat 2D animated weather icons (Open-Meteo WMO codes).
 * Intentionally not 3D — crisp illustration style.
 */
export default function AnimatedWeatherIcon({ code, className = "" }) {
  const type = resolveType(code);

  return (
    <span
      className={`wx2-icon wx2-icon--${type} ${className}`}
      aria-hidden="true"
    >
      {type === "sun" && <IconClear />}
      {type === "partly" && <IconPartly />}
      {type === "cloud" && <IconCloudy />}
      {type === "fog" && <IconFog />}
      {type === "rain" && <IconRain />}
      {type === "snow" && <IconSnow />}
      {type === "storm" && <IconStorm />}
    </span>
  );
}

function resolveType(code) {
  if (code === 0) return "sun";
  if ([1, 2].includes(code)) return "partly";
  if (code === 3) return "cloud";
  if ([45, 48].includes(code)) return "fog";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return "rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ([95, 96, 99].includes(code)) return "storm";
  return "partly";
}

function IconClear() {
  return (
    <svg viewBox="0 0 48 48" className="wx2-svg" fill="none">
      <circle className="wx2-sun-glow" cx="24" cy="24" r="11" />
      <circle className="wx2-sun-disk" cx="24" cy="24" r="8.5" />
      <g className="wx2-rays">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((d) => (
          <path
            key={d}
            className="wx2-ray"
            d="M24 4.5v4.2"
            transform={`rotate(${d} 24 24)`}
            strokeLinecap="round"
          />
        ))}
      </g>
    </svg>
  );
}

function IconPartly() {
  return (
    <svg viewBox="0 0 48 48" className="wx2-svg" fill="none">
      <g className="wx2-partly-sun">
        <circle className="wx2-sun-glow" cx="16" cy="16" r="7" />
        <circle className="wx2-sun-disk" cx="16" cy="16" r="5.5" />
        <g className="wx2-rays wx2-rays-sm">
          {[20, 65, 110, 200, 245, 290].map((d) => (
            <path
              key={d}
              className="wx2-ray"
              d="M16 5.5v2.8"
              transform={`rotate(${d} 16 16)`}
              strokeLinecap="round"
            />
          ))}
        </g>
      </g>
      <g className="wx2-float">
        <path
          className="wx2-cloud-body"
          d="M14.5 34.5c-3.4 0-6.2-2.5-6.2-5.6 0-2.8 2-5.1 4.7-5.5.7-3.2 3.5-5.6 6.9-5.6 2.4 0 4.5 1.1 5.8 2.9 1-.6 2.2-.9 3.4-.9 3.5 0 6.3 2.6 6.3 5.8 0 .3 0 .6-.1.9 2.3.5 4 2.4 4 4.7 0 2.7-2.3 4.8-5.2 4.8H14.5z"
        />
        <path
          className="wx2-cloud-edge"
          d="M14.5 34.5c-3.4 0-6.2-2.5-6.2-5.6 0-2.8 2-5.1 4.7-5.5.7-3.2 3.5-5.6 6.9-5.6 2.4 0 4.5 1.1 5.8 2.9 1-.6 2.2-.9 3.4-.9 3.5 0 6.3 2.6 6.3 5.8 0 .3 0 .6-.1.9 2.3.5 4 2.4 4 4.7 0 2.7-2.3 4.8-5.2 4.8H14.5z"
        />
      </g>
    </svg>
  );
}

function IconCloudy() {
  return (
    <svg viewBox="0 0 48 48" className="wx2-svg" fill="none">
      <g className="wx2-float wx2-float-slow">
        <path
          className="wx2-cloud-back"
          d="M10 28.5c-2.6 0-4.7-2-4.7-4.4 0-2.2 1.6-4 3.7-4.3.6-2.7 3-4.7 5.9-4.7 1.8 0 3.4.8 4.5 2 1.1-.9 2.5-1.4 4-1.4 3.1 0 5.6 2.3 5.6 5.1v.2c1.9.2 3.4 1.8 3.4 3.6 0 2-1.7 3.7-3.9 3.7H10z"
        />
      </g>
      <g className="wx2-float">
        <path
          className="wx2-cloud-body"
          d="M13 36c-3.5 0-6.3-2.6-6.3-5.8 0-2.9 2.1-5.3 4.9-5.7.8-3.4 3.8-5.9 7.4-5.9 2.5 0 4.7 1.2 6.1 3.1 1.1-.6 2.3-1 3.6-1 3.7 0 6.7 2.8 6.7 6.2 0 .3 0 .7-.1 1 2.4.5 4.2 2.5 4.2 4.9 0 2.8-2.4 5.1-5.4 5.1H13z"
        />
      </g>
    </svg>
  );
}

function IconFog() {
  return (
    <svg viewBox="0 0 48 48" className="wx2-svg" fill="none">
      <g className="wx2-float">
        <path
          className="wx2-cloud-body wx2-cloud-muted"
          d="M14 24c-3 0-5.4-2.2-5.4-5 0-2.5 1.8-4.6 4.2-4.9.6-2.8 3.1-4.9 6.1-4.9 2.1 0 3.9 1 5.1 2.5.9-.5 2-.8 3.1-.8 3.1 0 5.6 2.3 5.6 5.1 0 .3 0 .5-.1.8 2.1.4 3.6 2.1 3.6 4.1 0 2.3-2 4.2-4.5 4.2H14z"
        />
      </g>
      <g className="wx2-mist">
        <path className="wx2-mist-line wx2-m1" d="M10 30h28" strokeLinecap="round" />
        <path className="wx2-mist-line wx2-m2" d="M13 35h22" strokeLinecap="round" />
        <path className="wx2-mist-line wx2-m3" d="M11 40h26" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function IconRain() {
  return (
    <svg viewBox="0 0 48 48" className="wx2-svg" fill="none">
      <g className="wx2-float">
        <path
          className="wx2-cloud-body"
          d="M12.5 26c-3.2 0-5.8-2.4-5.8-5.3 0-2.6 1.9-4.8 4.4-5.2.7-3.1 3.4-5.4 6.7-5.4 2.3 0 4.3 1.1 5.6 2.8.9-.5 2.1-.8 3.3-.8 3.4 0 6.1 2.5 6.1 5.6 0 .3 0 .6-.1.8 2.2.5 3.8 2.3 3.8 4.5 0 2.5-2.2 4.5-4.9 4.5H12.5z"
        />
      </g>
      <g className="wx2-rain">
        <path className="wx2-drop wx2-d1" d="M16 30l-2.5 8" strokeLinecap="round" />
        <path className="wx2-drop wx2-d2" d="M24 31l-2.5 9" strokeLinecap="round" />
        <path className="wx2-drop wx2-d3" d="M32 30l-2.5 8" strokeLinecap="round" />
        <path className="wx2-drop wx2-d4" d="M20 32l-2 6" strokeLinecap="round" />
        <path className="wx2-drop wx2-d5" d="M28 33l-2 6" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function IconSnow() {
  return (
    <svg viewBox="0 0 48 48" className="wx2-svg" fill="none">
      <g className="wx2-float">
        <path
          className="wx2-cloud-body"
          d="M12.5 25c-3.2 0-5.8-2.4-5.8-5.3 0-2.6 1.9-4.8 4.4-5.2.7-3.1 3.4-5.4 6.7-5.4 2.3 0 4.3 1.1 5.6 2.8.9-.5 2.1-.8 3.3-.8 3.4 0 6.1 2.5 6.1 5.6 0 .3 0 .6-.1.8 2.2.5 3.8 2.3 3.8 4.5 0 2.5-2.2 4.5-4.9 4.5H12.5z"
        />
      </g>
      <g className="wx2-snow">
        <g className="wx2-flake wx2-f1" transform="translate(15 32)">
          <path d="M0-3.2v6.4M-2.8-1.6l5.6 3.2M-2.8 1.6l5.6-3.2" strokeLinecap="round" />
        </g>
        <g className="wx2-flake wx2-f2" transform="translate(24 35)">
          <path d="M0-3.2v6.4M-2.8-1.6l5.6 3.2M-2.8 1.6l5.6-3.2" strokeLinecap="round" />
        </g>
        <g className="wx2-flake wx2-f3" transform="translate(33 31)">
          <path d="M0-3.2v6.4M-2.8-1.6l5.6 3.2M-2.8 1.6l5.6-3.2" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}

function IconStorm() {
  return (
    <svg viewBox="0 0 48 48" className="wx2-svg" fill="none">
      <g className="wx2-float">
        <path
          className="wx2-cloud-body wx2-cloud-storm"
          d="M12 24c-3.3 0-6-2.5-6-5.5 0-2.8 2-5.1 4.6-5.5.7-3.3 3.6-5.7 7-5.7 2.4 0 4.5 1.1 5.9 2.9 1-.6 2.2-.9 3.4-.9 3.5 0 6.4 2.7 6.4 6 0 .3 0 .6-.1.9 2.3.5 4 2.4 4 4.8 0 2.7-2.3 4.9-5.2 4.9H12z"
        />
      </g>
      <path
        className="wx2-bolt"
        d="M26.5 26.5l-5.5 8.5h4.2l-2.8 9.5 9.2-11.5h-4.5l4.4-6.5z"
      />
      <g className="wx2-rain wx2-rain-storm">
        <path className="wx2-drop wx2-d1" d="M14 31l-1.8 5" strokeLinecap="round" />
        <path className="wx2-drop wx2-d3" d="M34 31l-1.8 5" strokeLinecap="round" />
      </g>
    </svg>
  );
}
