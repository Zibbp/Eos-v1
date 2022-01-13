import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { ChannelsService } from 'src/channels/channels.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelsRepository } from 'src/channels/channels.repository';
import { VideosRepository } from 'src/videos/videos.repository';
import { VideosService } from 'src/videos/videos.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChannelsRepository, VideosRepository])],
  controllers: [FilesController],
  providers: [FilesService, ChannelsService, VideosService],
})
export class FilesModule {}
