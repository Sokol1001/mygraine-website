export default function PhoneFrame({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative rounded-[2.75rem] border-[9px] border-gray-900 bg-gray-900 shadow-2xl shadow-indigo-400/30 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-2xl z-10" />
        <img src={src} alt={alt} className="block w-full h-auto rounded-[2rem]" />
      </div>
    </div>
  );
}
