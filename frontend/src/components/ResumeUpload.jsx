import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ResumeUpload = ({ setResumeFile }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setResumeFile(file);
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
      setSelectedFile(file);
      setResumeFile(file);
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
      className={`border-2 border-dashed border-black rounded-lg p-6 flex flex-col items-center justify-center transition-colors h-[10rem] ${
        dragActive ? "border-primary bg-muted" : "border-muted"
      }`}
      style={{ cursor: "pointer" }}
      tabIndex={0}
      onClick={handleClick}
    >
      <Input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={handleFileChange}
        data-testid="resume-input"
      />
      <div className="flex flex-col items-center justify-center gap-2">
        <span className="text-muted-foreground text-sm">
          {selectedFile ? (
            <>Selected: <span className="font-medium">{selectedFile.name}</span></>
          ) : (
            <>Drag &amp; drop your resume, or</>
          )}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          {selectedFile ? "Change file" : "Browse files"}
        </Button>
      </div>
    </div>
  );
};

export default ResumeUpload;