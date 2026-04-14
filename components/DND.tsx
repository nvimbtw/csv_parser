'use client';
import { parse } from "path";
import Papa, { ParseResult, ParseError } from "papaparse";
import { useState, useRef } from "react";

export default function DND() {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [processed, setProcessed] = useState(false);
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
        if (!file) {
            console.log("No file selected");
            return;
        }

        const data = await parseCSV(file);

        if (!data) {
            console.log("No file selected");
            return;
        }

        populateTable(data);        

        setProcessed(true);
    };

    return (
        <div className="w-full max-w-md mx-auto p-8">
            <div
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
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
                    <p className="text-sm text-gray-600">{file.name}</p>
                ) : (
                    <p className="text-sm text-gray-500">Drop CSV file here or click to browse</p>
                )}
            </div>

            <button onClick={handleClick} className="mt-4 w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600">
                Process
            </button>

            <div className={processed ? "block" : "hidden"}>
                <table id="dataTable"></table>
            </div>
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

function populateTable(data: ParseResult<string[]>) {
    var table = document.getElementById("dataTable");

    data.forEach(function(row: string[], index: number, data: ParseResult<string[]>) {
        var tableRow = table.insertRow(index);

        row.forEach(function(cell: string, index: number, row: string[]) {
            var TableRowCell = tableRow.insertCell(index)
            TableRowCell.innerHTML = cell;
        });
    });
}
