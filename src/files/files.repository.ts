import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { File } from '@prisma/client';

@Injectable()
export class FilesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createFile(filePath: string): Promise<File> {
    return this.prisma.file.create({
      data: {
        path: filePath,
      },
    });
  }

  async findFileById(id: string): Promise<File | null> {
    return this.prisma.file.findUnique({
      where: { id },
    });
  }
}
