const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Floating geometric shapes */}
      <div className="absolute top-10 left-10 w-4 h-4 bg-white opacity-30 rotate-45 animate-pulse"></div>
      <div className="absolute top-20 right-20 w-6 h-6 bg-yellow-400 opacity-40 rounded-full animate-bounce delay-100"></div>
      <div className="absolute top-40 left-1/4 w-3 h-3 bg-pink-400 opacity-50 rotate-45 animate-pulse delay-300"></div>
      <div className="absolute top-60 right-1/3 w-5 h-5 bg-green-400 opacity-30 rounded-full animate-bounce delay-500"></div>
      <div className="absolute bottom-40 left-20 w-4 h-4 bg-blue-300 opacity-40 rotate-45 animate-pulse delay-700"></div>
      <div className="absolute bottom-60 right-10 w-3 h-3 bg-red-400 opacity-50 rounded-full animate-bounce delay-200"></div>
      <div className="absolute top-80 left-1/2 w-6 h-6 bg-purple-300 opacity-30 rotate-45 animate-pulse delay-600"></div>
      <div className="absolute bottom-20 left-1/3 w-4 h-4 bg-yellow-300 opacity-40 rounded-full animate-bounce delay-400"></div>
      
      {/* Additional scattered elements */}
      <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-white opacity-60 animate-pulse delay-800"></div>
      <div className="absolute bottom-1/4 left-1/2 w-3 h-3 bg-cyan-400 opacity-40 rotate-45 animate-bounce delay-900"></div>
      <div className="absolute top-1/3 left-10 w-2 h-2 bg-orange-400 opacity-50 rounded-full animate-pulse delay-1000"></div>
    </div>
  );
};

export default AnimatedBackground;
