interface MoleculaLogoProps {
  className?: string;
  height?: number | string;
}

export function MoleculaLogo({ className = "", height = 28 }: MoleculaLogoProps) {
  return (
    <div className={`inline-flex items-center ${className}`}>
      <img
        src="/molecula-logo.svg"
        alt="MOLECULA"
        style={{ height }}
        className="w-auto object-contain select-none"
      />
    </div>
  );
}
