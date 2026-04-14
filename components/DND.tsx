'use client';

import Papa, { ParseResult, ParseError } from "papaparse";
import { useState, useRef, useMemo } from "react";

export default function DND() {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [processed, setProcessed] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const [data, setData] = useState<string[][]>([]);
    const [search, setSearch] = useState("");

    const [sortingColumn, setSortingColumn] = useState(0);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

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
        if (!file) return;

        const parsed = await parseCSV(file);
        setData(parsed);
        setProcessed(true);
    };

    const handleSort = (index: number) => {
        if (sortingColumn === index) {
            setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortingColumn(index);
            setSortDirection("asc");
        }
    };

    const displayedData = useMemo(() => {
        if (data.length === 0) return [];

        const header = data[0];
        const rows = data.slice(1);

        // SORT
        const sortedRows = [...rows].sort((a, b) => {
            const valA = a[sortingColumn];
            const valB = b[sortingColumn];

            const numA = parseFloat(valA);
            const numB = parseFloat(valB);

            let result = 0;

            if (!isNaN(numA) && !isNaN(numB)) {
                result = numA - numB;
            } else {
                result = String(valA).localeCompare(String(valB));
            }

            return sortDirection === "asc" ? result : -result;
        });

        // SEARCH
        const lowerSearch = search.toLowerCase();

        const filteredRows = sortedRows.filter((row) => {
            if (!search) return true;

            return row.some((cell) =>
                String(cell).toLowerCase().includes(lowerSearch)
            );
        });

        return [header, ...filteredRows];
    }, [data, search, sortingColumn, sortDirection]);

    return (
        <>
            {/* Upload UI */}
            <div className={`w-full max-w-md mx-auto p-8 ${processed ? "hidden" : "block"}`}>
                <div
                    className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                        isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
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
                        <p className="text-sm text-gray-500">
                            Drop CSV file here or click to browse
                        </p>
                    )}
                </div>

                <button
                    onClick={handleClick}
                    className="mt-4 w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Process
                </button>
            </div>

            {/* Table */}
            {processed && (
                <div className="w-full my-8">
                    {/* Search */}
                    <div className="block w-lg mx-auto">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-lg bg-gray-300 px-2 py-2"
                            placeholder="Search..."
                        />
                    </div>

                    <table className="w-7xl mx-auto mt-8 border table-auto">
                        <thead>
                            <tr>
                                {/* Row number header */}
                                <th className="border px-2 py-2 bg-gray-200">
                                    #
                                </th>

                                {/* Data headers */}
                                {displayedData[0]?.map((cell, index) => (
                                    <th
                                        key={index}
                                        className="border px-2 py-2 bg-gray-200"
                                    >
                                        <button
                                            onClick={() => handleSort(index)}
                                            className="w-full flex items-center justify-center gap-1"
                                        >
                                            {cell}

                                            {sortingColumn === index && (
                                                <span>
                                                    {sortDirection === "asc" ? "▲" : "▼"}
                                                </span>
                                            )}
                                        </button>
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {displayedData.slice(1).map((row, i) => (
                                <tr key={i}>
                                    {/* Row number */}
                                    <td className="border px-2 py-1 text-center bg-gray-100 font-medium">
                                        {i + 1}
                                    </td>

                                    {/* Cells */}
                                    {row.map((cell, j) => (
                                        <td
                                            key={j}
                                            className="border px-2 py-1 text-center"
                                        >
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
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