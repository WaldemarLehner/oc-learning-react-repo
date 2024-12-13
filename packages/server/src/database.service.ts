import {
  HttpException,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { readFileSync } from 'fs';
import { readFile } from 'fs/promises';
import { basename } from 'path';
import { exit } from 'process';
import { Database } from 'sqlite3';
import { MigrationFn, SequelizeStorage, Umzug } from 'umzug';
import { promisify } from 'util';
import { endOfDay, parseISO, startOfDay } from 'date-fns';
import {
  NewEntry,
  PatchEntry,
  Project,
  ProjectZod,
  RichEntry,
  RichEntryZod,
} from './model';
import { randomUUID } from 'crypto';

export const CreationImpossibleProjectNotFound = Symbol(
  'CreationImpossibleProjectNotFound',
);

export const UpdateFailedIdNotFound = Symbol('UpdateFailedIdNotFound');

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  #db: Database;

  public getAllProjects() {
    return new Promise<Project[]>((res, rej) => {
      this.#db.all(
        'SELECT id, customer_name, project_name FROM project ORDER BY project_name ASC',
        (err, rows) => {
          if (err) {
            rej(err);
            return;
          }

          res(
            rows.map((e: any) => {
              const response: Project = {
                id: e.id,
                customerName: e.customer_name,
                projectName: e.project_name,
              };
              return ProjectZod.parse(response);
            }),
          );
        },
      );
    });
  }
  public getProjectById(id: string) {
    return new Promise<Project | undefined>((res, rej) => {
      this.#db.get(
        'SELECT id, customer_name, project_name FROM project FROM time_entry_project_view WHERE id = ?',
        [id],
        (err, row: any) => {
          if (err) {
            rej(err);
            return;
          }
          if (row == null) {
            return res(undefined);
          }
          const response: Project = {
            id: row.id,
            customerName: row.customer_name,
            projectName: row.project_name,
          };

          res(ProjectZod.parse(response));
        },
      );
    });
  }

  public getAll(limit = -1, offset = -1) {
    return new Promise<RichEntry[]>((res, rej) => {
      this.#db.all(
        'SELECT entry_id, time_from, time_to, project_id, break_duration_minutes, description, customer_name, project_name FROM time_entry_project_view LIMIT ? OFFSET ?',
        [limit, offset],
        (err, rows) => {
          if (err) {
            rej(err);
            return;
          }

          res(
            rows.map((e: any) => {
              const response: RichEntry = {
                id: e.entry_id,
                from: e.time_from,
                to: e.time_to,
                projectId: e.project_id,
                breakDurationMinutes: e.break_duration_minutes,
                description: e.description,
                customerName: e.customer_name,
                projectName: e.project_name,
              };
              return RichEntryZod.parse(response);
            }),
          );
        },
      );
    });
  }

  public getEntryById(id: string) {
    return new Promise<RichEntry | undefined>((res, rej) => {
      this.#db.get(
        'SELECT entry_id, time_from, time_to, project_id, break_duration_minutes, description, customer_name, project_name FROM time_entry_project_view WHERE entry_id = ?',
        [id],
        (err, row: any) => {
          if (err) {
            rej(err);
            return;
          }
          if (row == null) {
            return res(undefined);
          }
          const response: RichEntry = {
            id: row.entry_id,
            from: row.time_from,
            to: row.time_to,
            projectId: row.project_id,
            breakDurationMinutes: row.break_duration_minutes,
            description: row.description,
            customerName: row.customer_name,
            projectName: row.project_name,
          };

          res(RichEntryZod.parse(response));
        },
      );
    });
  }

  public getEntriesInRange(from: string, to: string) {
    return new Promise<RichEntry[]>((res, rej) => {
      this.#db.all(
        `
        SELECT entry_id, time_from, time_to, project_id, break_duration_minutes, description, customer_name, project_name 
        FROM time_entry_project_view
        WHERE (? BETWEEN time_from AND time_to) OR (? BETWEEN time_from AND time_to) OR 
        (? <= time_from AND ? >= time_to)
        `,
        [from, to, from, to],
        (err, rows) => {
          if (err) {
            rej(err);
            return;
          }

          res(
            rows.map((e: any) => {
              const response: RichEntry = {
                id: e.entry_id,
                from: e.time_from,
                to: e.time_to,
                projectId: e.project_id,
                breakDurationMinutes: e.break_duration_minutes,
                description: e.description,
                customerName: e.customer_name,
                projectName: e.project_name,
              };
              return RichEntryZod.parse(response);
            }),
          );
        },
      );
    });
  }

  public deleteEntryById(id: string) {
    return new Promise<void>((res, rej) => {
      this.#db.get(
        'DELETE FROM time_entry_project_view WHERE entry_id = ?',
        [id],
        (err) => {
          if (err) {
            rej(err);
            return;
          }
          res();
        },
      );
    });
  }

  public async createEntry(entryData: NewEntry) {
    const project = await this.getProjectById(entryData.projectId);
    if (project === undefined) {
      throw CreationImpossibleProjectNotFound;
    }

    const newId = randomUUID(); // Sqlite does not have uuid support, hence we cook our own
    return await new Promise<string>((res, rej) => {
      this.#db.run(
        'INSERT INTO time_entry (id, time_from, time_to, project_id, break_duration_minutes, description) VALUES (?, ?, ?, ?, ?, ?)',
        [
          newId,
          entryData.from,
          entryData.to,
          entryData.projectId,
          entryData.breakDurationMinutes,
          entryData.description,
        ],
        (err) => {
          if (err) {
            rej(err);
          } else {
            res(newId);
          }
        },
      );
    });
  }

  public async patchEntry(entryId: string, patchData: PatchEntry) {
    return await new Promise<void>((res, rej) => {
      this.#db.run(
        'UPDATE time_entry SET time_from = COALESCE(?, time_from), time_to = COALESCE(?, time_to), break_duration_minutes = COASLESCE(?, break_duration_minutes), description = COALESCE(?, description) WHERE id = ?',
        [
          patchData.from,
          patchData.to,
          patchData.breakDurationMinutes,
          patchData.description,
          entryId,
        ],
        function (err) {
          if (err) {
            rej(err);
            return;
          }
          if (this.changes == 0) {
            rej(UpdateFailedIdNotFound);
            return;
          }
          res();
        },
      );
    });
  }

  constructor() {}

  async onModuleInit() {
    this.#db = new Database('./db.sqlite');

    const umzug = new Umzug({
      logger: console,
      migrations: {
        glob: './migrations/*.sql',
        resolve: (params) => {
          const sql = readFileSync(params.path!, 'utf-8');

          const up: MigrationFn = () => {
            return new Promise<void>((res, rej) => {
              this.#db.exec(sql, (err) => {
                if (err) {
                  rej(err);
                } else {
                  res();
                }
              });
            });
          };

          return {
            name: basename(params.path!),
            up: up,
          };
        },
      },
    });

    try {
      const migrations = await umzug.up();
      console.log(migrations.map((e) => e.name));
    } catch (err) {
      console.error('failed migrations: ', err);
      exit(1);
    }
  }
  onModuleDestroy() {
    this.#db.close();
  }
}
