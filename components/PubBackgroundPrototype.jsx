import React, { useState, useRef, useCallback } from "react";
import { Upload, Download, Sparkles } from "lucide-react";

// ---- Color extraction (pure canvas, no external deps) ----
function extractDominantColor(img) {
  const canvas = document.createElement("canvas");
  const size = 60; // small sample for speed
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);

  let r = 0, g = 0, b = 0, count = 0;
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha < 200) continue;
    const rr = data[i], gg = data[i + 1], bb = data[i + 2];
    const lum = (rr + gg + bb) / 3;
    if (lum > 245 || lum < 12) continue;
    r += rr; g += gg; b += bb; count++;
  }
  if (count === 0) return { r: 200, g: 170, b: 150 };
  return { r: Math.round(r / count), g: Math.round(g / count), b: Math.round(b / count) };
}

function toHex({ r, g, b }) {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function shade({ r, g, b }, amt) {
  const f = (c) => Math.max(0, Math.min(255, Math.round(c + amt)));
  return { r: f(r), g: f(g), b: f(b) };
}

function complementary({ r, g, b }) {
  return {
    r: Math.round(255 - r * 0.35),
    g: Math.round(255 - g * 0.35),
    b: Math.round(255 - b * 0.35),
  };
}

const STYLES = [
  { id: "gradient", label: "Dégradé doux" },
  { id: "halo", label: "Halo lumineux" },
  { id: "geometric", label: "Formes géométriques" },
];

export default function PubBackgroundPrototype() {
  const [image, setImage] = useState(null);
  const [color, setColor] = useState({ r: 210, g: 170, b: 140 });
  const [style, setStyle] = useState("gradient");
  const fileInputRef = useRef(null);
  const stageRef = useRef(null);

  const handleFile = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setColor(extractDominantColor(img));
        setImage(e.target.result);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }, []);

  const light = toHex(shade(color, 70));
  const lighter = toHex(shade(color, 110));
  const dark = toHex(shade(color, -40));
  const comp = toHex(complementary(color));

  const backgroundStyle = (() => {
    if (style === "gradient") {
      return { background: `linear-gradient(135deg, ${lighter} 0%, ${light} 45%, ${comp} 100%)` };
    }
    if (style === "halo") {
      return { background: `radial-gradient(circle at 50% 42%, ${lighter} 0%, ${light} 35%, ${dark} 100%)` };
    }
    return { background: `#faf8f5` };
  })();

  const handleDownload = () => {
    const width = 1000, height = 1000;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    const drawBg = () => {
      if (style === "gradient") {
        const g = ctx.createLinearGradient(0, 0, width, height);
        g.addColorStop(0, lighter);
        g.addColorStop(0.45, light);
        g.addColorStop(1, comp);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
      } else if (style === "halo") {
        const g = ctx.createRadialGradient(width / 2, height * 0.42, 0, width / 2, height * 0.42, width * 0.7);
        g.addColorStop(0, lighter);
        g.addColorStop(0.35, light);
        g.addColorStop(1, dark);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.fillStyle = "#faf8f5";
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = light;
        ctx.beginPath();
        ctx.arc(width * 0.18, height * 0.22, 160, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = comp;
        ctx.beginPath();
        ctx.arc(width * 0.85, height * 0.78, 220, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    };

    drawBg();

    if (image) {
      const img = new Image();
      img.onload = () => {
        const maxDim = width * 0.62;
        const ratio = Math.min(maxDim / img.width, maxDim / img.height);
        const w = img.width * ratio;
        const h = img.height * ratio;
        const x = (width - w) / 2;
        const y = (height - h) / 2 - 20;

        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.25)";
        ctx.shadowBlur = 40;
        ctx.shadowOffsetY = 25;
        ctx.drawImage(img, x, y, w, h);
        ctx.restore();

        const link = document.createElement("a");
        link.download = `pub-fond-${style}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      };
      img.src = image;
    } else {
      const link = document.createElement("a");
      link.download = `pub-fond-${style}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <p className="text-xs tracking-widest uppercase text-stone-400 font-medium">Prototype</p>
          <h1 className="text-2xl font-semibold text-stone-800 mt-1">Fonds pour tes visuels produit</h1>
          <p className="text-sm text-stone-500 mt-1">Upload un produit, la couleur du fond s'adapte automatiquement.</p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-stone-300 rounded-xl py-6 flex flex-col items-center gap-2 text-stone-500 hover:border-stone-400 hover:bg-stone-100/50 transition-colors mb-5"
        >
          <Upload size={20} />
          <span className="text-sm">{image ? "Changer la photo produit" : "Choisir une photo produit"}</span>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />

        <div className="flex gap-2 mb-5">
          {STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setStyle(s.id)}
              className={`flex-1 text-xs py-2 rounded-lg border transition-colors ${
                style === s.id ? "bg-stone-800 text-white border-stone-800" : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div ref={stageRef} className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-sm border border-stone-200" style={backgroundStyle}>
          {style === "geometric" && (
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <circle cx="18" cy="22" r="16" fill={light} opacity="0.5" />
              <circle cx="85" cy="80" r="22" fill={comp} opacity="0.45" />
            </svg>
          )}

          {image ? (
            <img
              src={image}
              alt="Produit"
              className="absolute inset-0 m-auto max-w-[62%] max-h-[62%] object-contain"
              style={{ filter: "drop-shadow(0 25px 30px rgba(0,0,0,0.25))" }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-stone-400 text-sm gap-2">
              <Sparkles size={16} />
              Ta photo produit apparaîtra ici
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-4">
          <span className="text-xs text-stone-400 mr-1">Palette détectée</span>
          {[lighter, light, toHex(color), dark, comp].map((c, i) => (
            <div key={i} className="w-5 h-5 rounded-full border border-white shadow-sm" style={{ background: c }} />
          ))}
        </div>

        <button
          onClick={handleDownload}
          className="w-full mt-5 bg-stone-800 text-white text-sm py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-stone-700 transition-colors"
        >
          <Download size={16} />
          Télécharger en PNG (1000×1000)
        </button>
      </div>
    </div>
  );
}
