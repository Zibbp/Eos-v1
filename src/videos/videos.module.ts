import { Module } from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideosRepository } from './videos.repository';
import { ChannelsService } from 'src/channels/channels.service';
import { ChannelsRepository } from 'src/channels/channels.repository';

@Module({
  imports: [TypeOrmModule.forFeature([VideosRepository, ChannelsRepository])],
  controllers: [VideosController],
  providers: [VideosService, ChannelsService]
})
export class VideosModule { }
