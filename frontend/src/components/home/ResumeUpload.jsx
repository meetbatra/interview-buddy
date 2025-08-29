import { useRef, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileCheck, AlertTriangle } from "lucide-react";

const ResumeUpload = ({ setResumeFile, disabled = false }) => {
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
      const errorMsg = 'Please upload only PDF files.';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    if (!validateFileSize(file)) {
      const errorMsg = `File size must be less than 5MB. Your file is ${formatFileSize(file.size)}.`;
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    setSelectedFile(file);
    setResumeFile(file);
    toast.success(`Resume uploaded successfully: ${file.name}`);
  };

  const handleFileChange = (e) => {
    if (disabled) return;
    const file = e.target.files && e.target.files[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleDragOver = (e) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    if (disabled) return;
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
    if (disabled) return;
    inputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors h-[10rem] ${
          disabled 
            ? "border-gray-700 bg-gray-800/50 cursor-not-allowed opacity-50" 
            : dragActive 
              ? "border-blue-400 bg-blue-400 bg-opacity-10" 
              : "border-gray-600 hover:border-gray-500 cursor-pointer"
        }`}
        style={{ cursor: disabled ? "not-allowed" : "pointer" }}
        tabIndex={0}
        onClick={handleClick}
      >
        <Input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
          data-testid="resume-input"
        />
        <div className="flex flex-col items-center justify-center gap-2">
          {disabled ? (
            <div className="w-8 h-8 text-gray-500 mb-2 animate-spin">
              <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          ) : selectedFile ? (
            <FileCheck className="w-8 h-8 text-green-400 mb-2" />
          ) : (
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
          )}
          <span className="text-gray-300 text-sm text-center">
            {disabled ? (
              <>Starting interview...</>
            ) : selectedFile ? (
              <>Selected: <span className="font-medium text-white">{selectedFile.name}</span></>
            ) : (
              <>Drag & drop your PDF resume or click to browse</>
            )}
          </span>
        </div>
      </div>
      
      {error && (
        <Alert className="bg-red-500/10 border-red-500/20 text-red-300">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ResumeUpload;