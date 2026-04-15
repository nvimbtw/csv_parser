import Papa, { ParseResult, ParseError } from "papaparse";
import { useState, useRef } from "react";

interface FileFormProps {
    onDataParsed: (data: string[][]) => void;
}

export default function FileForm({ onDataParsed }: FileFormProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) setFile(droppedFile);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) setFile(selectedFile);
    };

    const handleClick = async () => {
        if (!file || isProcessing) return;

        setIsProcessing(true);
        try {
            const parsed = await parseCSV(file);
            onDataParsed(parsed);
        } catch (error) {
            console.error('Error parsing CSV:', error);
            alert('Error parsing CSV. Please check the file format.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full h-[calc(100vh-4rem)] content-center max-w-2xl mx-auto p-8">
            <div
                className={`border-1 px-12 py-24 text-center cursor-pointer transition-colors ${
                    isDragging ? "border-red-500 bg-red-50" : "border-red-300 hover:border-red-400"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                />

                {file ? (
                    <p className="text-xl text-gray-600">{file.name}</p>
                ) : (
                    <p className="text-xl text-gray-500">
                        Drop CSV file here or click to browse
                    </p>
                )}
            </div>

            <button
                onClick={handleClick}
                disabled={isProcessing || !file}
                className="mt-4 w-full py-2 px-4 bg-red-500 text-white border-1 cursor-pointer border-red-500 hover:bg-red-50 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isProcessing ? 'Processing...' : 'Process'}
            </button>
        </div>
    );
}

function parseCSV(file: File): Promise<string[][]> {
    return new Promise((resolve, reject) => {
        Papa.parse<string[]>(file, {
            complete: (results: ParseResult<string[]>) => {
                resolve(results.data);
            },
            error: (error: ParseError) => {
                reject(error);
            }
        });
    });
}