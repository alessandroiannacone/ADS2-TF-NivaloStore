import React from 'react';

interface OlvaCourierLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const OlvaCourierLogo: React.FC<OlvaCourierLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const fontSizes = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl sm:text-3xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Emblema Gráfico Vectorial de Olva Courier */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          viewBox="0 0 48 36"
          className={size === 'sm' ? 'w-8 h-6' : size === 'lg' ? 'w-14 h-10' : 'w-11 h-8'}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Fondo redondeado dinámico con inclinación aerodinámica */}
          <rect
            x="2"
            y="2"
            width="44"
            height="32"
            rx="8"
            fill="#E30613"
            className="drop-shadow-xs"
          />
          {/* Raya de velocidad azul Olva */}
          <path
            d="M2 24L32 6H44L14 34H2V24Z"
            fill="#002F6C"
            opacity="0.85"
          />
          {/* Letra O estilizada con flecha de velocidad */}
          <circle cx="21" cy="18" r="8" stroke="white" strokeWidth="3.2" />
          <path
            d="M17 18H25M25 18L21 14M25 18L21 22"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Tipografía Oficial: OLVA (Rojo) + COURIER (Azul Marino) */}
      <div className={`flex flex-col leading-none ${fontSizes[size]}`}>
        <div className="flex items-baseline gap-1.5 font-black tracking-tight italic">
          <span className="text-[#E30613] font-['Poppins',sans-serif] tracking-tighter drop-shadow-xs font-black">
            OLVA
          </span>
          <span className="text-[#002F6C] font-['Poppins',sans-serif] font-extrabold not-italic tracking-wider text-[0.75em]">
            COURIER
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[9px] font-semibold text-[#667085] tracking-widest uppercase not-italic">
            Envíos Nacionales
          </span>
        )}
      </div>
    </div>
  );
};
