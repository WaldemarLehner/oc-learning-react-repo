import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import {
  Select,
  SelectLabel,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormEvent, MouseEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';

async function getAllProjects() {
  const result = z
    .array(
      z.object({
        id: z.string(),
        customerName: z.string(),
        projectName: z.string(),
      }),
    )
    .parse(await (await fetch('http://localhost:3000/projects')).json());
  return result;
}

export function NewEntry() {
  const [projects, setProjects] = useState<
    {
      id: string;
      customerName: string;
      projectName: string;
    }[]
  >();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>();
  const [description, setDescription] = useState<string>('');

  useEffect(() => {
    getAllProjects().then((e) => setProjects(e));
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    console.log(event);
  }

  function handleReset(
    event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
  ): void {
    event.preventDefault();
    setDate(undefined);
    setFrom('');
    setTo('');
    setDescription('');
    setSelectedProject(undefined);
  }

  if (!projects) {
    return <>Loading...</>;
  }

  return (
    <div>
      <Link to={'/'}>
        <Button variant={'link'}>
          <ArrowLeft /> Go back
        </Button>
      </Link>
      <Card className=" min-w-[600px]">
        <CardHeader>
          <CardTitle>Create new Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col w-full gap-2">
              <Label htmlFor="project">Project</Label>
              <Select
                value={selectedProject}
                onValueChange={setSelectedProject}
                name="project"
              >
                <SelectTrigger className="">
                  <SelectValue placeholder="Which Project were you working on?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Project</SelectLabel>
                    {projects.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.projectName}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Label htmlFor="description">Description</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                name="description"
                required
              ></Input>
              <div className="flex flex-row">
                <div className="min-h-[350px]">
                  <Label htmlFor="project">Day of Work</Label>
                  <Calendar
                    className="w-full"
                    selected={date}
                    onSelect={setDate}
                    mode="single"
                  ></Calendar>
                </div>
                <div className="flex flex-col w-full">
                  <div>
                    <Label htmlFor="from">Work from</Label>
                    <Input
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      name="from"
                      required
                      placeholder="09:00"
                    ></Input>
                  </div>
                  <div>
                    <Label htmlFor="until">Work until</Label>
                    <Input
                      name="until"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      required
                      placeholder="17:00"
                    ></Input>
                  </div>
                  <div>
                    <Label htmlFor="break">Break</Label>
                    <Input
                      name="break"
                      type="number"
                      min={0}
                      placeholder="60"
                    ></Input>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-row">
                <Button
                  onClick={(e) => handleReset(e)}
                  type="reset"
                  variant="outline"
                >
                  Reset
                </Button>
                <Button type="submit">Submit</Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
