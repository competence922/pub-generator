'use client';

import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';

function shortPrix(val) {
  const clean = val.replace(/\s/g, '');
  if (clean.length > 5) return clean.slice(0, 4) + '…';
  return val.length > 6 ? clean : val;
}

export default function AdGenerator() {
  const [photoOriginal, setPhotoOriginal] = useState(null);
  const [photoDetoure, setPhotoDetoure] = useState(null);
  const [useDetoure, setUseDetoure] = useState(true);
  const [removingBg, setRemovingBg] = useState(false);
  const [bgError, setBgError] = useState(false);
  const [photoName, setPhotoName] = useState('');
  const [phrase, setPhrase] = useState('Fait main, livré chez toi');
  const [prix, setPrix] = useState('15 000');
  const [devise, setDevise] = useState('CFA');
  const [brand, setBrand] = useState('TON NOM');
  const [downloading, setDownloading] = useState(null);

  const photo = useDetoure && photoDetoure ? photoDetoure : photoOriginal;

  const story1 = useRef(null);
  const storyMinimalClair = useRef(null);
  const storyMinimalSombre = useRef(null);
  const storyMinimalSable = useRef(null);
  const storyNeon = useRef(null);

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoOriginal(ev.target.result);
      setPhotoDetoure(null);
      setUseDetoure(true);
      setPhotoName(file.name);
    };
    reader.readAsDataURL(file);

    setRemovingBg(true);
    setBgError(false);
    const formData = new FormData();
    formData.append('image', file);
    fetch('/api/remove-bg', { method: 'POST', body: formData })
      .then((res) => {
        if (!res.ok) throw new Error('Détourage échoué');
        return res.blob();
      })
      .then((blob) => {
        setPhotoDetoure(URL.createObjectURL(blob));
      })
      .catch((err) => {
        console.error('Détourage échoué', err);
        setBgError(true);
        setUseDetoure(false);
      })
      .finally(() => {
        setRemovingBg(false);
      });
  }

  async function handleDownload(ref, filename) {
    if (!ref.current) return;
    setDownloading(filename);
    try {
      const dataUrl = await toPng(ref.current, { pixelRatio: 3 });
      const link = document.createElement('a');
      link.download = filename + '.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export échoué', err);
    } finally {
      setDownloading(null);
    }
  }

  const photoZone = (placeholder) =>
    photo ? <img src={photo} alt="produit" /> : <div className="placeholder-text">{placeholder}</div>;

  return (
    <div className="wrap">
      <div className="intro">
        <div className="eyebrow">v1 — app en ligne</div>
        <h1>Génère tes pubs</h1>
        <p>Renseigne les infos une fois, les 5 templates se mettent à jour en direct. Chaque carte a son propre bouton de téléchargement en PNG.</p>
      </div>

      <div className="layout">
        {/* FORM */}
        <div className="panel">
          <h2>Tes infos</h2>

          <div className="field">
            <label>Photo produit</label>
            <label className="upload-box">
              {photo && <img className="upload-preview" src={photo} alt="aperçu" />}
              <span>
                {removingBg
                  ? 'Détourage du fond en cours…'
                  : bgError
                  ? 'Détourage indisponible — photo originale utilisée'
                  : photoName || 'Clique pour choisir une image'}
              </span>
              <input type="file" accept="image/*" onChange={handlePhotoChange} />
            </label>
            {photoDetoure && !removingBg && (
              <button
                type="button"
                className="toggle-bg-btn"
                onClick={() => setUseDetoure((v) => !v)}
              >
                {useDetoure ? 'Revenir à la photo originale' : 'Utiliser la version détourée'}
              </button>
            )}
          </div>

          <div className="field">
            <label>Phrase d&apos;accroche</label>
            <input
              type="text"
              maxLength={60}
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Prix</label>
            <div className="price-row">
              <input type="text" value={prix} onChange={(e) => setPrix(e.target.value)} />
              <select value={devise} onChange={(e) => setDevise(e.target.value)}>
                <option value="CFA">CFA</option>
                <option value="AED">AED</option>
                <option value="€">€</option>
                <option value="$">$</option>
                <option value="DH">DH</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label>Nom du vendeur <span style={{ textTransform: 'none', fontWeight: 400 }}>(template Marché uniquement)</span></label>
            <input
              type="text"
              maxLength={18}
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>

          <div className="hint">Le téléchargement se fait en PNG, prêt à publier en story Instagram/TikTok (format 9:16).</div>
        </div>

        {/* CARDS */}
        <div className="board">
          <div className="card-wrap">
            <div className="card-label">1 — Marché</div>
            <div className="story marche" ref={story1}>
              <div className="stripe"></div>
              <div className="top"><div className="phrase">{phrase}</div></div>
              <div className="photo-zone">{photoZone('PHOTO PRODUIT')}</div>
              <div className="bottom">
                <div className="brand">{brand.toUpperCase()}</div>
                <div className="tag">
                  <div className="prix">{shortPrix(prix)}</div>
                  <div className="devise">{devise}</div>
                </div>
              </div>
            </div>
            <button
              className="download-btn"
              disabled={downloading === 'pub-marche'}
              onClick={() => handleDownload(story1, 'pub-marche')}
            >
              {downloading === 'pub-marche' ? 'Export…' : 'Télécharger'}
            </button>
          </div>

          <div className="card-wrap">
            <div className="card-label">2 — Minimal Clair</div>
            <div className="story minimal minimal-clair" ref={storyMinimalClair}>
              <div className="top">
                <div className="eyebrow2">Nouveauté</div>
                <div className="phrase">{phrase}</div>
              </div>
              <div className="photo-zone">{photoZone('PHOTO PRODUIT')}</div>
              <div className="bottom">
                <div className="prix-block">
                  <div className="label">Prix</div>
                  <div className="prix">{prix}</div>
                </div>
                <div className="dot"></div>
              </div>
            </div>
            <button
              className="download-btn"
              disabled={downloading === 'pub-minimal-clair'}
              onClick={() => handleDownload(storyMinimalClair, 'pub-minimal-clair')}
            >
              {downloading === 'pub-minimal-clair' ? 'Export…' : 'Télécharger'}
            </button>
          </div>

          <div className="card-wrap">
            <div className="card-label">3 — Minimal Sombre</div>
            <div className="story minimal minimal-sombre" ref={storyMinimalSombre}>
              <div className="top">
                <div className="eyebrow2">Nouveauté</div>
                <div className="phrase">{phrase}</div>
              </div>
              <div className="photo-zone">{photoZone('PHOTO PRODUIT')}</div>
              <div className="bottom">
                <div className="prix-block">
                  <div className="label">Prix</div>
                  <div className="prix">{prix}</div>
                </div>
                <div className="dot"></div>
              </div>
            </div>
            <button
              className="download-btn"
              disabled={downloading === 'pub-minimal-sombre'}
              onClick={() => handleDownload(storyMinimalSombre, 'pub-minimal-sombre')}
            >
              {downloading === 'pub-minimal-sombre' ? 'Export…' : 'Télécharger'}
            </button>
          </div>

          <div className="card-wrap">
            <div className="card-label">4 — Minimal Sable</div>
            <div className="story minimal minimal-sable" ref={storyMinimalSable}>
              <div className="top">
                <div className="eyebrow2">Nouveauté</div>
                <div className="phrase">{phrase}</div>
              </div>
              <div className="photo-zone">{photoZone('PHOTO PRODUIT')}</div>
              <div className="bottom">
                <div className="prix-block">
                  <div className="label">Prix</div>
                  <div className="prix">{prix}</div>
                </div>
                <div className="dot"></div>
              </div>
            </div>
            <button
              className="download-btn"
              disabled={downloading === 'pub-minimal-sable'}
              onClick={() => handleDownload(storyMinimalSable, 'pub-minimal-sable')}
            >
              {downloading === 'pub-minimal-sable' ? 'Export…' : 'Télécharger'}
            </button>
          </div>

          <div className="card-wrap">
            <div className="card-label">5 — Néon Nuit</div>
            <div className="story neon" ref={storyNeon}>
              <div className="glow"></div>
              <div className="top"><div className="phrase">{phrase}</div></div>
              <div className="photo-zone">{photoZone('PHOTO PRODUIT')}</div>
              <div className="bottom">
                <div className="tag">
                  <div className="prix">{prix}</div>
                  <div className="devise">{devise}</div>
                </div>
              </div>
            </div>
            <button
              className="download-btn"
              disabled={downloading === 'pub-neon'}
              onClick={() => handleDownload(storyNeon, 'pub-neon')}
            >
              {downloading === 'pub-neon' ? 'Export…' : 'Télécharger'}
            </button>
          </div>
        </div>
      </div>

      <footer>
        Le détourage du fond est automatique (via remove.bg). Si le résultat n&apos;est pas parfait, tu peux revenir à la photo originale.
      </footer>
    </div>
  );
}
