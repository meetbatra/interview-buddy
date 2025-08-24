const Header = () => {
  return (
    <header className="relative z-10 p-4 flex-shrink-0">
      <h1 className="text-white md:text-3xl text-xl font-bold tracking-wide">
        INTERVIEW BUDDY
      </h1>
      <div className="absolute top-4 right-6 space-x-4">
        <a 
          href="https://github.com/meetbatra/interview-buddy" 
          className="text-white hover:text-gray-300 transition-colors"
          aria-label="GitHub Repository"
          target="blank"
        >
          GitHub
        </a>
      </div>
    </header>
  );
};

export default Header;
