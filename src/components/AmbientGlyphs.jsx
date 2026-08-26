import React from "react";
import styles from "./AmbientGlyphs.module.css";

function OrbitGlyph() {
  return (
    <svg viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="8" />
      <path d="M8 24c0-8.8 7.2-16 16-16M40 24c0 8.8-7.2 16-16 16" />
      <circle cx="10" cy="16" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SparkGlyph() {
  return (
    <svg viewBox="0 0 48 48">
      <path d="M24 6v10M24 32v10M6 24h10M32 24h10" />
      <path d="m12 12 7 7M29 29l7 7M36 12l-7 7M19 29l-7 7" />
      <circle cx="24" cy="24" r="3" />
    </svg>
  );
}

function NodeGlyph() {
  return (
    <svg viewBox="0 0 48 48">
      <path d="m24 8 15 27H9L24 8Z" />
      <path d="M16 35 29 20" />
      <circle cx="24" cy="8" r="2" fill="currentColor" stroke="none" />
      <circle cx="39" cy="35" r="2" fill="currentColor" stroke="none" />
      <circle cx="9" cy="35" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SignalGlyph() {
  return (
    <svg viewBox="0 0 48 48">
      <path d="M9 32c4-8 10-12 18-12M9 39c6-12 15-18 28-18" />
      <circle cx="10" cy="31" r="2" fill="currentColor" stroke="none" />
      <path d="M32 9h7v7" />
    </svg>
  );
}

function BracketGlyph() {
  return (
    <svg viewBox="0 0 48 48">
      <path d="M18 9h-8v10M30 9h8v10M18 39h-8V29M30 39h8V29" />
      <path d="M18 24h12M24 18v12" />
    </svg>
  );
}

function WaveGlyph() {
  return (
    <svg viewBox="0 0 48 48">
      <path d="M5 25c5-9 10-9 15 0s10 9 15 0 8-8 10-3" />
      <path d="M8 34h32" />
    </svg>
  );
}

const GLYPHS = [OrbitGlyph, SparkGlyph, NodeGlyph, SignalGlyph, BracketGlyph, WaveGlyph];
const MOTIONS = ["orbit", "pop", "drift", "pop", "orbit", "drift"];

export default function AmbientGlyphs({ className = "" }) {
  return (
    <div className={`${styles.field} ${className}`} aria-hidden="true">
      {GLYPHS.map((Glyph, index) => (
        <span
          className={`${styles.glyph} ${styles[MOTIONS[index]]}`}
          key={MOTIONS[index] + index}
        >
          <Glyph />
        </span>
      ))}
    </div>
  );
}
