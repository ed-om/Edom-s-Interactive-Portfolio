import type { ReactNode } from 'react';

export function GardenArt() {
  return (
    <div className="garden-art" aria-hidden="true">
      <div className="halftone halftone--left" />
      <div className="halftone halftone--right" />
      <div className="color-wash color-wash--one" />
      <div className="color-wash color-wash--two" />
      <svg className="vine-art vine-art--left" viewBox="0 0 240 600" fill="none">
        <path className="draw-line" pathLength="1" d="M18 594C78 514 20 434 89 358S111 207 170 157 205 73 222 10" />
        <path className="draw-line leaf-line" pathLength="1" d="M76 431C27 429 13 391 21 357 54 369 79 395 76 431Z" />
        <path className="draw-line leaf-line" pathLength="1" d="M107 322C149 295 161 258 145 229 113 248 96 282 107 322Z" />
        <path className="draw-line leaf-line" pathLength="1" d="M153 203C195 205 222 176 227 144 189 150 160 173 153 203Z" />
        <path className="draw-line leaf-line" pathLength="1" d="M47 528C7 530-6 499 4 473 32 484 53 506 47 528Z" />
        <path className="draw-line leaf-line" pathLength="1" d="M188 109C157 98 149 69 159 43 185 60 198 85 188 109Z" />
      </svg>
      <svg className="vine-art vine-art--right" viewBox="0 0 270 620" fill="none">
        <path className="draw-line" pathLength="1" d="M256 604C200 524 249 444 184 369S158 218 97 164 65 78 38 14" />
        <path className="draw-line leaf-line" pathLength="1" d="M196 437C243 433 257 397 249 365 217 378 193 402 196 437Z" />
        <path className="draw-line leaf-line" pathLength="1" d="M170 326C129 299 118 263 134 233 166 253 181 287 170 326Z" />
        <path className="draw-line leaf-line" pathLength="1" d="M119 207C78 209 51 181 46 149 84 154 112 178 119 207Z" />
        <path className="draw-line leaf-line" pathLength="1" d="M225 536C265 538 279 506 269 480 241 492 219 514 225 536Z" />
        <path className="draw-line leaf-line" pathLength="1" d="M71 112C101 99 106 71 94 46 71 61 60 86 71 112Z" />
      </svg>
      <svg className="spore-orbit" viewBox="0 0 360 360" fill="none">
        <circle cx="180" cy="180" r="119" stroke="currentColor" strokeDasharray="1 8" strokeWidth="1.5" />
        <circle cx="180" cy="180" r="149" stroke="currentColor" strokeDasharray="30 18 2 13" strokeWidth="1" />
        <path className="draw-line" pathLength="1" d="M45 142C79 96 58 70 104 43M99 37L106 42L99 49" />
        <path className="draw-line" pathLength="1" d="M314 213C279 259 301 286 254 312M260 306L252 313L261 318" />
      </svg>
      <div className="spore-field spore-field--a">{Array.from({ length: 9 }, (_, i) => <i key={i} />)}</div>
      <div className="spore-field spore-field--b">{Array.from({ length: 6 }, (_, i) => <i key={i} />)}</div>
      <span className="handmark handmark--a">✳</span>
      <span className="handmark handmark--b">✧</span>
      <span className="handmark handmark--c">⌁</span>
      <span className="handmark handmark--d">✿</span>
      <div className="tape-piece tape-piece--a" />
      <div className="tape-piece tape-piece--b" />
    </div>
  );
}

export function PaperTexture() {
  return <div className="paper-texture" aria-hidden="true" />;
}

export function HandArrow({ className = '' }: { className?: string }) {
  return (
    <svg className={`hand-arrow ${className}`} viewBox="0 0 150 48" fill="none" aria-hidden="true">
      <path className="draw-line" pathLength="1" d="M3 31C36 8 80 9 129 24" />
      <path className="draw-line" pathLength="1" d="M113 12L130 24L112 34" />
    </svg>
  );
}

export function TinyStamp({ children }: { children: ReactNode }) {
  return <span className="tiny-stamp">{children}</span>;
}
