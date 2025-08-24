import { cn } from "@/lib/utils";

const CodeEditor = ({ children, title = "interview-buddy", className }) => {
  return (
    <div className={cn(
      "bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden",
      className
    )}>
      {/* Window header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <span className="text-gray-400 text-sm font-mono">{title}</span>
        <div className="text-gray-400 text-sm">
          <span className="ml-2 text-xs font-mono">Form.jsx</span>
        </div>
      </div>
      
      {/* Content area */}
      <div className="p-8 space-y-6">
        <div className="text-blue-300 font-mono text-sm mb-6">
          <span className="text-purple-400">import</span> 
          <span className="text-white"> &#123; </span>
          <span className="text-green-400">startInterview</span>
          <span className="text-white"> &#125; </span>
          <span className="text-purple-400">from</span>
          <span className="text-yellow-400"> 'interview-buddy'</span>
        </div>
        
        {children}
      </div>
    </div>
  );
};

export default CodeEditor;
