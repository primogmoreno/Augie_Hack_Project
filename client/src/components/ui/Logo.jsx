export default function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect width="64" height="64" rx="14" fill="#173124"/>
      <path d="M14 20 C18 18, 26 18, 32 20 L32 46 C26 44, 18 44, 14 46 Z" fill="#faf9f5" opacity="0.18"/>
      <path d="M50 20 C46 18, 38 18, 32 20 L32 46 C38 44, 46 44, 50 46 Z" fill="#faf9f5" opacity="0.18"/>
      <rect x="20" y="36" width="4" height="8" rx="1" fill="#faf9f5"/>
      <rect x="27" y="30" width="4" height="14" rx="1" fill="#faf9f5"/>
      <rect x="34" y="24" width="4" height="20" rx="1" fill="#4f1b08"/>
      <rect x="41" y="32" width="4" height="12" rx="1" fill="#faf9f5"/>
    </svg>
  );
}
