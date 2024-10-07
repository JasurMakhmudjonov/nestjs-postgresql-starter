import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('Upload')
@Controller({ version: '1', path: 'upload' })
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10)) 
  async create(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 10,
          }),
          new FileTypeValidator({
            fileType: '.(png|jpg|svg|heic|webp|pdf|jpeg)',
          }),
        ],
      }),
    )
    files: Array<Express.Multer.File>,
  ) {
    const results = await Promise.all(
      files.map((file) =>
        this.uploadService.create({
          fileName: file.originalname,
          fileType: file.mimetype,
          body: file.buffer,
        }),
      ),
    );
    return { urls: results };
  }
}
