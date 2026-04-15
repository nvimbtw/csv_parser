'use client';

import { useState } from 'react';

import Header from '../components/Header';
import FileForm from '../components/FileForm';
import Table from '../components/Table';

export default function Home() {
  const [data, setData] = useState<string[][]>([]);

  return (
    <>
      <Header />
      {data.length === 0 ? (
        <FileForm onDataParsed={setData} />
      ) : (
        <Table data={data} />
      )}
    </>
  );
}

