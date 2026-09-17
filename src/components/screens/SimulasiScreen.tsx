import React, { useState } from 'react';
import { ASSETS } from '../../data';

export const SimulasiScreen: React.FC = () => {
  const [activeLab, setActiveLab] = useState<'jembatan' | 'klinometer'>('jembatan');

  // Jembatan Parabola state
  const [spanL, setSpanL] = useState<number>(100); // 40m - 160m
  const [sagS, setSagS] = useState<number>(15); // 5m - 25m
  const [truckWeight, setTruckWeight] = useState<number>(45); // ton

  // Calculations for Parabola Suspension Bridge: y = a * x^2
  // x from -L/2 to +L/2
  // at x = L/2, y = S => a = S / (L/2)^2 = 4S / L^2
  const aCoeff = (4 * sagS) / Math.pow(spanL, 2);
  const cableTension = Math.round((truckWeight * 9.8 * spanL) / (8 * sagS)); // Horizontal cable tension in kN
  // Cable arc length approximation: L * (1 + 8/3 * (S/L)^2)
  const cableLength = (spanL * (1 + (8 / 3) * Math.pow(sagS / spanL, 2))).toFixed(2);

  // SVG dimensions for bridge
  // svg viewbox 0 0 400 180
  const svgWidth = 380;
  const svgHeight = 160;
  const roadY = 135;
  const towerHeight = 90;
  const towerLeftX = 50;
  const towerRightX = 330;
  const midX = (towerLeftX + towerRightX) / 2;
  const lowestY = roadY - 10;
  const towerTopY = lowestY - sagS * 3.5;

  // Path for parabolic main cable
  const cablePath = `M ${towerLeftX} ${towerTopY} Q ${midX} ${lowestY + 15} ${towerRightX} ${towerTopY}`;

  // Generate hanger vertical suspension cables
  const hangers = [];
  const numHangers = 9;
  for (let i = 1; i < numHangers; i++) {
    const fraction = i / numHangers;
    const hx = towerLeftX + (towerRightX - towerLeftX) * fraction;
    // Parabolic interpolation for y
    const normalizedX = fraction * 2 - 1; // -1 to 1
    const hy = lowestY + 5 - (1 - normalizedX * normalizedX) * (lowestY - towerTopY);
    hangers.push({ x: hx, yTop: Math.max(towerTopY, hy), yBottom: roadY });
  }

  return (
    <div className="flex flex-col w-full px-margin-mobile pb-space-2xl space-y-space-md">
      {/* Lab Switcher */}
      <div className="w-full bg-surface-container-high p-space-xs rounded-xl flex items-center shadow-sm">
        <button
          className={`flex-1 py-space-sm px-space-md rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-space-xs cursor-pointer ${
            activeLab === 'jembatan'
              ? 'bg-surface-container-lowest text-primary dark:text-primary-fixed shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          onClick={() => setActiveLab('jembatan')}
        >
          <span className="material-symbols-outlined text-[18px]">bridge</span>
          <span>Parabola Jembatan</span>
        </button>
        <button
          className={`flex-1 py-space-sm px-space-md rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-space-xs cursor-pointer ${
            activeLab === 'klinometer'
              ? 'bg-surface-container-lowest text-primary dark:text-primary-fixed shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          onClick={() => setActiveLab('klinometer')}
        >
          <span className="material-symbols-outlined text-[18px]">straighten</span>
          <span>Klinometer 3D</span>
        </button>
      </div>

      {activeLab === 'jembatan' && (
        <div className="flex flex-col gap-space-md animate-in fade-in">
          {/* Main Simulation Showcase Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-md flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-secondary-container text-on-secondary-container">
                  <span className="material-symbols-outlined text-[20px]">science</span>
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-on-surface">
                    Laboratorium Parabola Jembatan Selat Sunda II
                  </h3>
                  <span className="text-[11px] text-on-surface-variant">
                    Integrasi Kalkulus Diferensial & Geometri Spasial
                  </span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold">
                Live 2D Physics
              </span>
            </div>

            {/* Bridge Interactive Canvas / SVG */}
            <div className="w-full bg-primary-container text-on-primary rounded-xl p-space-sm overflow-hidden relative shadow-inner">
              <div className="absolute top-2 left-3 flex items-center gap-2 z-10 text-[11px] font-mono text-secondary-fixed">
                <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-ping"></span>
                <span>
                  f(x) = {aCoeff.toFixed(5)} · x² + {lowestY}
                </span>
              </div>

              <svg className="w-full h-48 overflow-visible" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
                {/* Water waves background */}
                <rect x="0" y={roadY + 10} width={svgWidth} height="40" fill="#001c37" opacity="0.6" />
                <path
                  d={`M 0 ${roadY + 15} Q 95 ${roadY + 12} 190 ${roadY + 15} T 380 ${roadY + 15}`}
                  fill="none"
                  stroke="#41ddc2"
                  strokeWidth="1.2"
                  opacity="0.4"
                />

                {/* Bridge Piers / Foundations */}
                <rect x={towerLeftX - 6} y={roadY - 10} width="12" height="35" fill="#314865" />
                <rect x={towerRightX - 6} y={roadY - 10} width="12" height="35" fill="#314865" />

                {/* Suspension Towers */}
                <line
                  x1={towerLeftX}
                  y1={towerTopY - 10}
                  x2={towerLeftX}
                  y2={roadY + 10}
                  stroke="#dae2fd"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <line
                  x1={towerRightX}
                  y1={towerTopY - 10}
                  x2={towerRightX}
                  y2={roadY + 10}
                  stroke="#dae2fd"
                  strokeWidth="6"
                  strokeLinecap="round"
                />

                {/* Cross bracings on towers */}
                <line
                  x1={towerLeftX - 4}
                  y1={towerTopY + 20}
                  x2={towerLeftX + 4}
                  y2={towerTopY + 35}
                  stroke="#768dad"
                  strokeWidth="1.5"
                />
                <line
                  x1={towerRightX - 4}
                  y1={towerTopY + 20}
                  x2={towerRightX + 4}
                  y2={towerTopY + 35}
                  stroke="#768dad"
                  strokeWidth="1.5"
                />

                {/* Vertical Hangers */}
                {hangers.map((h, idx) => (
                  <line
                    key={idx}
                    x1={h.x}
                    y1={h.yTop}
                    x2={h.x}
                    y2={h.yBottom}
                    stroke="#65fade"
                    strokeWidth="1.2"
                    opacity="0.8"
                    strokeDasharray={idx % 2 === 0 ? 'none' : '2 1'}
                  />
                ))}

                {/* Main Parabolic Cable */}
                <path d={cablePath} fill="none" stroke="#65fade" strokeWidth="3" />

                {/* Roadway Deck */}
                <rect x="20" y={roadY} width="340" height="7" rx="1.5" fill="#b0c8eb" />
                <line x1="20" y1={roadY + 3.5} x2="360" y2={roadY + 3.5} stroke="#000f22" strokeWidth="1" strokeDasharray="5 3" />

                {/* Heavy Truck Symbol on Bridge */}
                <rect x={midX - 18} y={roadY - 12} width="22" height="11" rx="2" fill="#c87900" />
                <rect x={midX + 4} y={roadY - 9} width="10" height="8" rx="1.5" fill="#ffb86b" />
                <circle cx={midX - 12} cy={roadY - 1} r="2.5" fill="#000f22" />
                <circle cx={midX - 3} cy={roadY - 1} r="2.5" fill="#000f22" />
                <circle cx={midX + 9} cy={roadY - 1} r="2.5" fill="#000f22" />

                {/* Dimension indicators */}
                <line x1={towerLeftX} y1={roadY + 22} x2={towerRightX} y2={roadY + 22} stroke="#ffdcbc" strokeWidth="1" />
                <text x={midX - 25} y={roadY + 30} fill="#ffdcbc" fontSize="9" fontWeight="700">
                  L = {spanL} meter
                </text>

                {/* Sag indicator */}
                <line x1={midX + 35} y1={towerTopY} x2={midX + 35} y2={lowestY + 15} stroke="#ffb86b" strokeWidth="1" strokeDasharray="2 2" />
                <text x={midX + 40} y={(towerTopY + lowestY) / 2 + 5} fill="#ffb86b" fontSize="8.5" fontWeight="700">
                  S = {sagS}m
                </text>
              </svg>

              {/* HUD metric cards inside canvas */}
              <div className="grid grid-cols-3 gap-2 mt-2 pt-1 border-t border-surface-container-highest/20 text-xs">
                <div className="p-2 rounded bg-surface-container-lowest/10">
                  <span className="text-[10px] text-surface-container-highest block">Panjang Kabel</span>
                  <span className="font-bold text-secondary-fixed">{cableLength} m</span>
                </div>
                <div className="p-2 rounded bg-surface-container-lowest/10">
                  <span className="text-[10px] text-surface-container-highest block">Gaya Tarik (H)</span>
                  <span className="font-bold text-tertiary-fixed">{cableTension} kN</span>
                </div>
                <div className="p-2 rounded bg-surface-container-lowest/10">
                  <span className="text-[10px] text-surface-container-highest block">Beban Tronton</span>
                  <span className="font-bold text-on-primary">{truckWeight} Ton</span>
                </div>
              </div>
            </div>

            {/* Sliders for Bridge Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm bg-surface-container-low p-space-sm rounded-xl">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-on-surface">Bentang Jembatan (L)</span>
                  <span className="text-primary dark:text-primary-fixed">{spanL} m</span>
                </div>
                <input
                  className="w-full accent-secondary h-1.5 bg-surface-container-highest rounded-lg cursor-pointer"
                  type="range"
                  min={60}
                  max={160}
                  value={spanL}
                  onChange={(e) => setSpanL(parseFloat(e.target.value))}
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-on-surface">Lendutan Kabel (S)</span>
                  <span className="text-primary dark:text-primary-fixed">{sagS} m</span>
                </div>
                <input
                  className="w-full accent-secondary h-1.5 bg-surface-container-highest rounded-lg cursor-pointer"
                  type="range"
                  min={8}
                  max={25}
                  value={sagS}
                  onChange={(e) => setSagS(parseFloat(e.target.value))}
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-on-surface">Beban Uji Kendaraan</span>
                  <span className="text-primary dark:text-primary-fixed">{truckWeight} Ton</span>
                </div>
                <input
                  className="w-full accent-tertiary-container h-1.5 bg-surface-container-highest rounded-lg cursor-pointer"
                  type="range"
                  min={20}
                  max={60}
                  value={truckWeight}
                  onChange={(e) => setTruckWeight(parseFloat(e.target.value))}
                />
              </div>
            </div>

            {/* Theoretical & RME Reflection Card */}
            <div className="p-3.5 rounded-xl bg-surface-container flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary text-[24px] flex-shrink-0">
                psychology
              </span>
              <div className="space-y-1 text-xs">
                <span className="font-bold text-primary dark:text-primary-fixed block">
                  Refleksi Fisika-Matematis (RME): Mengapa Harus Parabola?
                </span>
                <p className="text-on-surface-variant leading-relaxed">
                  Jika kabel hanya menahan beratnya sendiri, kurvanya adalah kurva <em>katenoid</em>{' '}
                  (cosh x). Namun karena beban dek jembatan dan kendaraan terdistribusi seragam
                  sepanjang sumbu horisontal, kabel tertarik membentuk kurva <strong>parabola kuadratis</strong>.
                  Bentuk ini meminimalkan gaya geser dan momen lentur destruktif pada tiang beton penopang!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeLab === 'klinometer' && (
        <div className="flex flex-col gap-space-md animate-in fade-in">
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-md space-y-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-primary-fixed text-primary-container">
                  <span className="material-symbols-outlined text-[20px]">architecture</span>
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-on-surface">
                    Laboratorium Klinometer Busur Digital
                  </h3>
                  <span className="text-[11px] text-on-surface-variant">
                    Pengukuran Triangulasi Lapangan Nyata
                  </span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-bold">
                Alat Lapangan
              </span>
            </div>

            <div className="relative rounded-xl overflow-hidden h-44 bg-surface-container">
              <img
                className="w-full h-full object-cover"
                alt="Students holding handmade inclinometer"
                src={ASSETS.trigonometriContext}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent flex items-end p-space-sm">
                <div className="text-on-primary text-xs">
                  <span className="font-bold block">Prinsip Kerja Klinometer Busur Derajat</span>
                  <span className="text-surface-container-highest text-[11px]">
                    Memanfaatkan tali berbandul gravitasi sebagai garis vertikal 90° tegak lurus
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-surface-container-low rounded-xl space-y-2 text-xs">
              <div className="font-bold text-primary dark:text-primary-fixed flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[18px]">rule</span>
                <span>Formula Triangulasi Klinometer:</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container-lowest font-mono text-on-surface">
                Tinggi Objek = (Jarak Horisontal · tan(Sudut Elevasi)) + Tinggi Mata Pengamat
              </div>
              <p className="text-on-surface-variant leading-relaxed">
                Di lapangan, jika jarak ke objek tidak bisa diukur langsung karena tebing jurang
                atau sungai, gunakan metode <strong>Dua Titik Pengamatan (Two-Point Tangent System)</strong>{' '}
                seperti yang dipelajari pada sesi latihan Trisula!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
