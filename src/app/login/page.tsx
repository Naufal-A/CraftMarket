export default function LoginPage() {
  return (
    <div className="flex h-screen">
      
      <div className="w-1/2 bg-white flex flex-col justify-center px-24">
        
        <img 
          src="/images/logo.png" 
          alt="Logo" 
          className="w-16 mx-auto mb-6 opacity-90"
        />

        <h1 className="text-3xl font-semibold text-[#8C6E63] mb-5 text-center">
          Masuk ke CraftMarket
        </h1>

        <div className="flex gap-5 mb-5 justify-center">
          {[ 
            { src: "/images/facebook.png", w: "w-6" },
            { src: "/images/google.png", w: "w-7" },
            { src: "/images/linkendin.png", w: "w-6" }
          ].map((item, idx) => (
            <div 
              key={idx}
              className="w-11 h-11 rounded-full shadow-sm border border-gray-200 flex items-center justify-center bg-white hover:shadow-md transition cursor-pointer"
            >
              <img src={item.src} className={item.w} />
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-500 mb-5 text-center">
          atau masuk dengan email
        </p>

        <input
          type="email"
          placeholder="Email"
          className="border border-gray-300 rounded-lg px-4 py-2.5 w-full mb-3
          focus:border-[#B89C8A] focus:ring-[#B89C8A] focus:ring-1 outline-none transition"
        />

        <input
          type="password"
          placeholder="Password"
          className="border border-gray-300 rounded-lg px-4 py-2.5 w-full mb-4
          focus:border-[#B89C8A] focus:ring-[#B89C8A] focus:ring-1 outline-none transition"
        />

        <button className="bg-[#B89C8A] text-white w-full py-2.5 rounded-lg 
        hover:bg-[#A88B78] transition text-center text-base font-medium shadow-sm">
          MASUK
        </button>
      </div>

      <div className="w-1/2 bg-[#CAB1A3] flex flex-col items-center justify-center px-20 text-white">
        <h2 className="text-4xl font-bold mb-3">Halo, Teman!</h2>
        <p className="text-center text-base opacity-90">
          Masukkan data Anda untuk mulai menjelajah.
        </p>
      </div>

    </div>
  );
}