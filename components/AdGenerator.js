'use client';

import { useState, useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';
import PubBackgroundPrototype from '@/components/PubBackgroundPrototype';

export default function AdGenerator() {
  const [photo, setPhoto] = useState(null);
  const [photoDetoure, setPhotoDetoure] = useState(null);
  const [phrase, setPhrase] = useState('');
  const [prix, setPrix] = useState('');
  const [brand, setBrand] = useState('');
  const [template, setTemplate] = useState('marche');
  const [removingBg, setRemovingBg] = useState(false);
  const [bgError, setBgError] = useState(false);
  const [photoName, setPhotoName] = useState('');
  const previewRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    setPhotoName(file.name);
    const url = URL.createObjectURL(file);
    setPhoto(url);
    setPhotoDetoure(null);
    setBgError(false);
    setRemovingBg(true);

    try {
      const formData = new FormData();
      formData.append('image_file', file);
      const res = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: { 'X-Api-Key': 'YOUR_API_KEY' },
        body: formData,
      });
      if (!res.ok) throw new Error('bg removal failed');
      const blob = await res.blob();
      setPhotoDetoure(URL.createObjectURL(blob));
    } catch (e) {
      setBgError(true);
      setPhotoDetoure(url);
    } finally {
      setRemovingBg(false);
    }
  }, []);

  const download = useCallback(async () => {
    if (!previewRef.current) return;
    const dataUrl = await toPng(previewRef.current, { quality: 0.95, pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `pub-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  }, []);

  const shortPrix = (p) => (p ? p.toString().replace('.', ',') : '');

  const photoZone = (placeholder) => (
    <div className="w-full h-full flex items-center justify-center bg-gray-200/50 text-gray-400 text-sm">
      {placeholder}
    </div>
  );

  const templates = {
    marche: {
      bg: 'bg-yellow-400',
      text: 'text-black',
      font: 'font-black',
      badge: 'bg-red-600 text-white',
    },
    minimal: {
      bg: 'bg-white',
      text: 'text-gray-900',
      font: 'font-light',
      badge: 'bg-black text-white',
    },
    neon: {
      bg: 'bg-gray-900',
      text: 'text-cyan-400',
      font: 'font-black',
      badge: 'bg-pink-500 text-white',
    },
    elegant: {
      bg: 'bg-stone-100',
      text: 'text-stone-800',
      font: 'font-serif',
      badge: 'bg-stone-800 text-stone-100',
    },
  };

  const t = templates[template] || templates.marche;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* FORMULAIRE */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold mb-4">🛠️ Créer ta pub</h2>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFile(e.dataTransfer.files[0]);
            }}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFile(e.target.files?.[0])}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <span className="text-2xl">📤</span>
              <span className="text-sm text-gray-600">
                <strong>Clique</strong> ou <strong>glisse</strong> ta photo ici
              </span>
            </label>
          </div>

          {photo && (
            <p className="text-sm text-green-600">
              ✅ {photoName} {removingBg && '— Détourage en cours…'}
            </p>
          )}
          {bgError && <p className="text-sm text-orange-500">⚠️ Détourage indisponible</p>}

          <div>
            <label className="block text-sm font-medium mb-1">Phrase d'accroche</label>
            <input
              type="text"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder="Ex: Sneakers tendance 2026"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Prix (€)</label>
            <input
              type="number"
              value={prix}
              onChange={(e) => setPrix(e.target.value)}
              placeholder="49.99"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Template</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(templates).map((tName) => (
                <button
                  key={tName}
                  onClick={() => setTemplate(tName)}
                  className={`px-4 py-2 rounded-lg border capitalize transition-all ${
                    template === tName
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {tName}
                </button>
              ))}
            </div>
          </div>

          {template === 'marche' && (
            <div>
              <label className="block text-sm font-medium mb-1">Nom du vendeur</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Jean Dupont"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          )}

          <button
            onClick={download}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            ⬇️ Télécharger en PNG
          </button>
        </div>

        {/* PRÉVISUALISATION */}
        <div className="lg:sticky lg:top-8 h-fit">
          <h2 className="text-xl font-bold mb-4">👀 Prévisualisation</h2>
          <div
            ref={previewRef}
            className={`relative w-[300px] h-[533px] ${t.bg} ${t.text} ${t.font} rounded-xl overflow-hidden shadow-2xl mx-auto`}
          >
            <div className="h-[55%] w-full relative">
              {photoDetoure || photo ? (
                <img
                  src={photoDetoure || photo}
                  alt="Produit"
                  className="w-full h-full object-cover"
                />
              ) : (
                photoZone('PHOTO PRODUIT')
              )}
            </div>

            <div className="p-6 flex flex-col gap-3 h-[45%]">
              <span className={`inline-block self-start px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${t.badge}`}>
                En promo
              </span>

              <h2 className="text-2xl leading-tight break-words">
                {phrase || 'Ta phrase d\'accroche'}
              </h2>

              {prix && <p className="text-4xl">{shortPrix(prix)}€</p>}

              {template === 'marche' && brand && (
                <p className="text-sm opacity-70 mt-auto">{brand.toUpperCase()}</p>
              )}
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-3">Format Story (9:16)</p>
        </div>
      </div>
    </div>
  );
}
