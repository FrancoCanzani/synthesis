export default function GridPattern() {
  return (
    <div className='absolute inset-0 -z-10 grid grid-cols-12 gap-1 opacity-20'>
      {Array.from({ length: 144 }).map((_, i) => (
        <div
          key={i}
          className={`aspect-square ${
            Math.random() > 0.7 ? 'bg-black' : 'bg-gray-300'
          } transition-colors duration-500 hover:bg-black`}
        />
      ))}
    </div>
  );
}
