export function SectionDivider() {
  return (
    <div className="relative w-full h-px">
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(6, 214, 160, 0.3) 50%, transparent 100%)",
        }}
      />
    </div>
  );
}
