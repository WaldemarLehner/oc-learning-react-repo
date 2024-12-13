import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { DatabaseService, UpdateFailedIdNotFound } from './database.service';
import { z } from 'zod';
import { NewEntry, NewEntryZod, PatchEntry, PatchEntryZod } from './model';
import {
  endOfDay,
  formatRFC3339,
  getUnixTime,
  parseISO,
  startOfDay,
} from 'date-fns';
@Controller()
export class AppController {
  constructor(private readonly dbService: DatabaseService) {}

  @Get('/entries')
  public async getAllEntries() {
    return await this.dbService.getAll();
  }

  @Get('/projects')
  public async getAllProjects() {
    return await this.dbService.getAllProjects();
  }

  @Get('/projects/:id')
  public async getProjectById(@Param('id') id: string) {
    if (!z.string().uuid().safeParse(id).success) {
      throw new HttpException(
        {
          message: 'id must be a uuid4 string',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const response = await this.dbService.getProjectById(id);
    if (response === undefined) {
      throw new HttpException(
        {
          message: 'no item found with provided id',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return response;
  }

  @Get('/entries/:id')
  public async getEntryById(@Param('id') id: string) {
    if (!z.string().uuid().safeParse(id).success) {
      throw new HttpException(
        {
          message: 'id must be a uuid4 string',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const response = await this.dbService.getEntryById(id);
    if (response === undefined) {
      throw new HttpException(
        {
          message: 'no item found with provided id',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return response;
  }

  @Get('/days/:ts')
  public async getEntriesByDay(@Param('ts') ts: string) {
    const tsResult = z.string().datetime({ offset: true }).safeParse(ts);
    if (!tsResult.success) {
      throw new HttpException(
        {
          message: 'ts arg must be a valid RFC3339 Compliant String',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const from = formatRFC3339(startOfDay(parseISO(ts)));
    const to = formatRFC3339(endOfDay(parseISO(ts)));

    return await this.getEntriesBetween(from, to);
  }

  @Get('/entries-between/:ts1/:ts2')
  public async getEntriesBetween(
    @Param('ts1') ts1: string,
    @Param('ts2') ts2: string,
  ) {
    const tsResult1 = z.string().datetime({ offset: true }).safeParse(ts1);
    if (!tsResult1.success) {
      throw new HttpException(
        {
          message: 'ts1 arg must be a valid RFC3339 Compliant String',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const tsResult2 = z.string().datetime({ offset: true }).safeParse(ts2);
    if (!tsResult2.success) {
      throw new HttpException(
        {
          message: 'ts2 arg must be a valid RFC3339 Compliant String',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    this.validateEntryTimes(ts1, ts2);

    return await this.dbService.getEntriesInRange(ts1, ts2);
  }

  @Post('/entries')
  public async createNewEntry(@Body() body: any) {
    const bodyResult = NewEntryZod.safeParse(body);
    if (!bodyResult.success) {
      throw new HttpException(
        {
          message: 'payload is not valid. see detail for more',
          detail: bodyResult.error.errors,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    this.validateEntryTimes(bodyResult.data.from, bodyResult.data.to);
    const entries = await this.getEntriesBetween(
      bodyResult.data.from,
      bodyResult.data.to,
    );

    if (entries.length > 0) {
      throw new HttpException(
        {
          message: 'At least another entry in time. See conflicts field',
          conflicts: entries,
        },
        HttpStatus.CONFLICT,
      );
    }

    const id = await this.dbService.createEntry(bodyResult.data);
    return await this.getEntryById(id);
  }

  @Patch('/entries/:id')
  public async modifyEntry(@Param('id') id: string, @Body() body: PatchEntry) {
    const bodyResult = PatchEntryZod.safeParse(body);
    if (!bodyResult.success) {
      throw new HttpException(
        {
          message: 'payload is not valid. see detail for more',
          detail: bodyResult.error.errors,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const presentEntry = await this.getEntryById(id);
    // Check for validity by patching the result here first and seeing if the times are correct
    if (body.from) {
      presentEntry.from = body.from;
    }
    if (body.to) {
      presentEntry.to = body.to;
    }
    this.validateEntryTimes(presentEntry.from, presentEntry.to);

    try {
      await this.dbService.patchEntry(id, body);
    } catch (err) {
      if (err === UpdateFailedIdNotFound) {
        throw new HttpException(
          {
            message: 'entry was not found after fetching',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
    return await this.getEntryById(id);
  }

  @Delete('/entries/:id')
  public deleteEntry(@Param('id') id: number) {
    if (!z.string().uuid().safeParse(id).success) {
      throw new HttpException(
        {
          message: 'id must be a uuid4 string',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private validateEntryTimes(fromStr: string, toStr: string) {
    const from = getUnixTime(fromStr);
    const to = getUnixTime(toStr);

    if (from === to) {
      throw new HttpException(
        { message: 'Time event cannot start and end at the same time' },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (from > to) {
      throw new HttpException(
        { message: 'Time event cannot start after it has ended' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
