import { useEffect, useMemo, useState } from 'react';
import { useLoaderData } from 'react-router';

interface Entry {
  id: string;
  from: string;
  to: string;
  projectId: string;
  breakDuratioMinutes: number;
  description: string;
  customerName: string;
  projectName: string;
}

async function clientLoader() {
  const data: Entry[] = await fetch('http://localhost:3000/entries').then((e) =>
    e.json(),
  );

  return { data };
}

function IndexTable({ entries }: { entries: Entry[] }) {
  return (
    <table className="table-auto border-separate">
      <thead className="">
        <tr className=" p-2 text-left">
          <th>Project Name</th>
          <th>From</th>
          <th>Until</th>
          <th>Break</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody className="">
        {entries.map((entry) => {
          const timestringsFrom = new Date(entry.from)
            .toISOString()
            .slice(0, 16)
            .replace('T', ' ')
            .split(' ');

          const timestringsTo = new Date(entry.to)
            .toISOString()
            .slice(0, 16)
            .replace('T', ' ')
            .split(' ');

          return (
            <tr className=" bg-slate-700" key={entry.id}>
              <td className="p-2">{entry.projectName}</td>
              <td className="p-2">
                <p>
                  {timestringsFrom[0]}
                  <br />
                  {timestringsFrom[1]}
                </p>
              </td>
              <td className="p-2">
                <p>
                  {timestringsTo[0]}
                  <br />
                  {timestringsTo[1]}
                </p>
              </td>
              <td className="p-2">{entry.breakDuratioMinutes ?? 0}</td>
              <td className="p-2 w-full">{entry.description}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function Index() {
  const [entries, setEntries] = useState<Entry[]>();
  useEffect(() => {
    clientLoader().then((e) => setEntries(e.data));
  });

  return (
    <div className="flex flex-col w-full max-w-4xl">
      <section className=" min-w-full">
        <h1 className="text-xl">All known entries</h1>
        {entries === undefined ? (
          <p>Loading…</p>
        ) : (
          <IndexTable entries={entries} />
        )}
      </section>
    </div>
  );
}
