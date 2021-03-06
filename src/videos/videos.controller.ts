import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { Video } from './entities/video.entity';
import { Pagination } from 'nestjs-typeorm-paginate';

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post()
  create(@Body() createVideoDto: CreateVideoDto) {
    return this.videosService.create(createVideoDto);
  }

  @Get()
  findAllByChannel(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
    @Query('channel') channel: string,
    @Query('search') search: string,
  ): Promise<Pagination<Video>> {
    limit = limit > 100 ? 100 : limit;
    if (channel) {
      return this.videosService.findAllByChannel({ page, limit }, channel);
    } else if (search) {
      return this.videosService.findAllBySearch({ page, limit }, search);
    } else {
      return this.videosService.findAll({ page, limit });
    }
  }

  @Get('/random')
  findRandomVideos(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ): Promise<Pagination<Video>> {
    limit = limit > 50 ? 50 : limit;
    return this.videosService.findRandomVideos({ page, limit });
  }

  @Get('/ids')
  getAllVideoIds() {
    return this.videosService.getAllVideoIds();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.videosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVideoDto: UpdateVideoDto) {
    return this.videosService.update(+id, updateVideoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.videosService.remove(+id);
  }

  // Comments
  @Get(':id/comments')
  getComments(@Param('id') id: string, @Query('limit') limit: string) {
    if (!limit) {
      return this.videosService.getAllComments(id);
    } else {
      return this.videosService.getComments(id, limit);
    }
  }
}
