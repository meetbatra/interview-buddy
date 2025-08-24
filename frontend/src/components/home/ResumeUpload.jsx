import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ResumeUpload = ({ setResumeFile }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const validateFileType = (file) => {
    const allowedTypes = ['application/pdf'];
    const fileExtension = file.name.toLowerCase().split('.').pop();
    
    if (!allowedTypes.includes(file.type) && fileExtension !== 'pdf') {
      return false;
    }
    return true;
  };

  const validateFileSize = (file) => {
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    return file.size <= maxSizeInBytes;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelection = (file) => {
    setError(''); // Clear any previous errors
    
    if (!validateFileType(file)) {
      setError('Please upload only PDF files.');
      return;
    }
    
    if (!validateFileSize(file)) {
      setError(`File size must be less than 5MB. Your file is ${formatFileSize(file.size)}.`);
      return;
    }
    
    setSelectedFile(file);
    setResumeFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileSelection(file);
      e.dataTransfer.clearData();
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors h-[10rem] ${
        dragActive 
          ? "border-blue-400 bg-blue-400 bg-opacity-10" 
          : "border-gray-600 hover:border-gray-500"
      }`}
      style={{ cursor: "pointer" }}
      tabIndex={0}
      onClick={handleClick}
    >
      <Input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileChange}
        data-testid="resume-input"
      />
      <div className="flex flex-col items-center justify-center gap-2">
        <span className="text-gray-300 text-sm">
          {selectedFile ? (
            <>Selected: <span className="font-medium text-white">{selectedFile.name}</span></>
          ) : (
            <>Drag &amp; drop your PDF resume</>
          )}
        </span>
        {error && (
          <span className="text-red-400 text-xs mt-1">{error}</span>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;