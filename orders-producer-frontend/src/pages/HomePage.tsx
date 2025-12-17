import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="flex min-h-screen">
      {/* Chef Section - Left Side */}
      <Link 
        to="/cocina"
        className="flex-1 bg-gradient-to-br from-orange-400 to-orange-500 hover:from-orange-500/70 hover:to-orange-600 transition-all duration-300 flex flex-col items-center justify-center text-white relative group overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        
        <div className="relative z-10 flex flex-col items-center gap-8 px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center">
            I'm a Chef
          </h2>
          
          <div className="w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
            <img 
              src="/images/chef-image.png" 
              alt="Chef"
              className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </Link>

      {/* Waiter Section - Right Side */}
      <Link 
        to="/mesero"
        className="flex-1 bg-gradient-to-br from-blue-300 to-blue-400 hover:from-blue-500/50 hover:to-blue-600/50 transition-all duration-300 flex flex-col items-center justify-center text-white relative group overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        
        <div className="relative z-10 flex flex-col items-center gap-8 px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center">
            I'm a Waiter
          </h2>
          
          <div className="w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
            <img 
              src="/images/waiter_image.png" 
              alt="Waiter"
              className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </Link>
      
      {/* Admin Link - Discrete bottom corner */}
      <Link 
        to="/login"
        className="absolute bottom-4 right-4 text-gray-500 hover:text-gray-700 text-sm transition-colors duration-200"
      >
        Admin
      </Link>
    </div>
  );
}
