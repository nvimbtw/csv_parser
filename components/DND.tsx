'use client';
import { parse } from "path";
import Papa, { ParseResult, ParseError } from "papaparse";
import { useState, useEffect, useRef } from "react";

export default function DND() {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [processed, setProcessed] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [data, setData] = useState<string[][]>([]);
    const [search, setSearch] = useState("");

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

        const parsed = await parseCSV(file);

        setData(parsed);

        console.log("data length: ", data.length);

        populateTable(data, search);

        setProcessed(true);
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            populateTable(data, search)
        }, 1);

        return () => clearTimeout(timeout);
    }, [data, search]);

    return (
        <>
            <div className={`w-full max-w-md mx-auto p-8 ${ processed ? "hidden" : "block" } `}>
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

            </div>
            <div className={`
                    w-full
                    my-8
                    ${processed ? "block" : "hidden"}
                `}>
                <form action="" className="block w-lg mx-auto">
                    <input 
                        type="text" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-lg bg-gray-300 px-2 py-2"
                    />
                </form>
                <table id="dataTable" className="
                    w-7xl
                    mx-auto
                    mt-8
                    border-1
                    border-red-500
                    table-auto
                "></table>
            </div>
        </>
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

function populateTable(data: string[][], search: string) {
    var table = document.getElementById("dataTable");
    if (!table) return;

    table.innerHTML = "";

    if (data.length === 0) return;

    const header = data[0];
    const rows = data.slice(1);

    const lowerSearch = search.toLowerCase();

    const filteredRows = rows.filter((row) => {
        if (!search) return true;

        return row.some((cell) =>
            String(cell).toLowerCase().includes(lowerSearch)
        );
    });

    const headerRow = table.insertRow(0);
    headerRow.className = "w-full font-bold";

    header.forEach((cell, index) => {
        const th = headerRow.insertCell(index);
        th.innerHTML = cell;
        th.className = "border-1 border-gray-500 px-1 py-2 text-center bg-gray-200";
    });

    filteredRows.forEach((row, rowIndex) => {
        const tableRow = table.insertRow(rowIndex + 1);

        row.forEach((cell, cellIndex) => {
            const td = tableRow.insertCell(cellIndex);
            td.innerHTML = cell;
            td.className = "border-1 border-gray-300 px-1 py-2 text-center";
        });
    });
}
