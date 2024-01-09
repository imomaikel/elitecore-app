export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[1595px]">
      {children}
      <div className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 fixed w-[100px] h-[200px] rotate-45 left-0 md:left-[400px] top-0 blur-[150px] -z-10" />
      <div className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 fixed w-[100px] h-[200px] md:w-[200px] md:h-[600px] rotate-45 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-[225px] opacity-40 -z-10" />
      <div className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 fixed w-[300px] h-[100px] rotate-12 right-24 hidden md:block blur-[150px] -z-10" />
      <div className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 fixed w-[100px] h-[200px] rotate-45 bottom-0 right-0 blur-[150px] -z-10" />
    </div>
  );
}
