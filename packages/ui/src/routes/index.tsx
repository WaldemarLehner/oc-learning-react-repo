import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Button } from '@/components/ui/button';
import { Delete, Edit, Plus } from 'lucide-react';

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
    <Table>
      <TableCaption>A listing of all entries</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Project Name</TableHead>
          <TableHead>From</TableHead>
          <TableHead>Until</TableHead>
          <TableHead>Break</TableHead>
          <TableHead>Description</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((e) => {
          const timestringsFrom = new Date(e.from)
            .toISOString()
            .slice(0, 16)
            .replace('T', ' ')
            .split(' ');

          const timestringsTo = new Date(e.to)
            .toISOString()
            .slice(0, 16)
            .replace('T', ' ')
            .split(' ');
          return (
            <TableRow key={e.id}>
              <TableCell>{e.projectName}</TableCell>
              <TableCell>
                {timestringsFrom[0]}
                <br />
                {timestringsFrom[1]}
              </TableCell>
              <TableCell>
                {timestringsTo[0]}
                <br />
                {timestringsTo[1]}
              </TableCell>
              <TableCell>{e.breakDuratioMinutes}</TableCell>
              <TableCell>{e.description}</TableCell>
              <TableCell>
                <Link to={`/entries/${e.id}/edit`}>
                  <Button variant={'ghost'} size={'icon'}>
                    <Edit />
                  </Button>
                </Link>
                <Button variant={'ghost'} size={'icon'}>
                  <Delete />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default function Index() {
  const [entries, setEntries] = useState<Entry[]>();
  useEffect(() => {
    clientLoader().then((e) => setEntries(e.data));
  }, []);

  return (
    <div className="flex flex-col w-full max-w-4xl">
      <section className=" min-w-full">
        <h1 className="text-xl">All known entries</h1>
        {entries === undefined ? (
          <p>Loading…</p>
        ) : (
          <>
            <IndexTable entries={entries} />
            <Link to={'entries/new'}>
              <Button variant="outline">
                <Plus /> Add Item{' '}
              </Button>
            </Link>
          </>
        )}
      </section>
    </div>
  );
}
