import { useState, useMemo } from "react";

interface TableProps {
    data: string[][];
}

export default function Table({ data }: TableProps) {
    const [search, setSearch] = useState("");
    const [highlight, setHighlight] = useState(false);
    const [sortingColumn, setSortingColumn] = useState(0);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

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

        const sortedRows = [...rows].sort((a, b) => {
            const rawA = a[sortingColumn] ?? "";
            const rawB = b[sortingColumn] ?? "";

            const valA = getSortValue(String(rawA));
            const valB = getSortValue(String(rawB));

            let result: number;

            if (typeof valA === "number" && typeof valB === "number") {
                result = valA - valB;
            } else {
                result = String(valA).localeCompare(String(valB));
            }

            return sortDirection === "asc" ? result : -result;
        });

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
        <div className="w-full my-8">
            {/* Search */}
            <div className="block w-lg mx-auto flex">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-lg border-b-1 border-gray-300 dark:border-gray-600 bg-[var(--color-background)] text-[var(--color-foreground)] px-2 py-2 focus:outline-0 placeholder:italic"
                    placeholder="Search..."
                />

                <div className="flex items-center ml-8">
                    <input
                        type="checkbox"
                        id="highlight"
                        checked={highlight}
                        onChange={(e) => setHighlight(e.target.checked)}
                        className=""
                    />
                    <label htmlFor="highlight" className="ml-2 text-md text-gray-900 dark:text-gray-100">Highlight</label>
                </div>
            </div>

            <table className="w-7xl mx-auto mt-8 border border-black table-auto bg-[var(--color-light-background)]">
                <thead>
                    <tr>
                        <th className="border border-black px-2 py-2 bg-[var(--color-light-background)] text-[var(--color-foreground)]">
                            #
                        </th>

                        {displayedData[0]?.map((cell, index) => (
                            <th
                                key={index}
                                className="border border-black px-2 py-2 bg-[var(--color-light-background)] text-[var(--color-foreground)]"
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
                    {displayedData.slice(1).map((row, i) => {
                        // determine highlight classes based on last field value
                        let cellBgClass = "";
                        let cellTextClass = "text-[var(--color-foreground)]";
                        if (highlight) {
                            const last = String(row[row.length - 1] ?? "").trim();
                            const num = parseFloat(last.replace(/,/g, '.'));
                            if (!isNaN(num)) {
                                if (num < 0) {
                                    cellBgClass = "bg-red-900";
                                    cellTextClass = "text-red-50";
                                } else if (num < 50) {
                                    cellBgClass = "bg-yellow-900";
                                    cellTextClass = "text-yellow-50";
                                } else {
                                    cellBgClass = "bg-green-900";
                                    cellTextClass = "text-green-50";
                                }
                            }
                        }

                        return (
                            <tr key={i}>
                                <td className="border border-black px-2 py-1 text-center bg-[var(--color-light-background)] font-medium text-[var(--color-foreground)]">
                                    {i + 1}
                                </td>

                                {row.map((cell, j) => (
                                    <td
                                        key={j}
                                        className={`border border-black px-2 py-1 text-center ${j === 0 ? 'bg-[var(--color-light-background)] text-[var(--color-foreground)]' : ''} ${j !== 0 && cellBgClass ? `${cellBgClass} ${cellTextClass}` : 'text-[var(--color-foreground)]'}`}
                                    >
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function parseDate(str: string): Date | null {
    const parts = str.split('.');
    if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // months are 0-based
        const year = parseInt(parts[2], 10);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            const date = new Date(year, month, day);
            // Validate the date
            if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
                return date;
            }
        }
    }
    return null;
}

function getSortValue(val: string): number | string {
    const trimmed = val.trim();

    // Try parsing DD.MM.YYYY first
    const date = parseDate(trimmed);
    if (date) return date.getTime();

    const num = parseFloat(trimmed.replace(/,/g, '.'));
    if (!isNaN(num) && /^[-+]?\d*(?:[.,]\d+)?$/.test(trimmed)) {
        return num;
    }

    return trimmed.toLowerCase();
}