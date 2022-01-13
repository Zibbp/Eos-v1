import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { Video } from './entities/video.entity';
import { VideosRepository } from './videos.repository';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { ChannelsService } from 'src/channels/channels.service';
import { Channel } from 'diagnostics_channel';

@Injectable()
export class VideosService {
  private logger = new Logger('VideosService');
  constructor(
    private videosRepository: VideosRepository,
    private channelsService: ChannelsService,
  ) {}

  async create(createVideoDto: CreateVideoDto) {
    try {
      const channel = await this.channelsService.findOneById(
        createVideoDto.channel,
      );

      const tempVideo = { ...createVideoDto };

      const video = await this.videosRepository.create({
        ...tempVideo,
        channel: channel,
      });
      await this.videosRepository.save(video);
      return 'hi';
    } catch (error) {
      if (error && error.code === '23505') {
        this.logger.verbose(`${createVideoDto.friendlyId} video exists`);
        throw new ConflictException(
          `${createVideoDto.friendlyId} video exists`,
        );
      } else if (error && error.response.statusCode === 404) {
        throw new NotFoundException(
          `Channel with supplied id ${createVideoDto.channel} is not found`,
        );
      } else {
        throw new InternalServerErrorException(
          'Error occured while attempting to insert video.',
        );
      }
    }
  }

  async findAll(options: IPaginationOptions): Promise<Pagination<Video>> {
    try {
      const queryBuilder = this.videosRepository.createQueryBuilder('video');
      queryBuilder
        .leftJoinAndSelect('video.channel', 'channel')
        .orderBy('video.uploadDate', 'DESC');

      return paginate<Video>(queryBuilder, options);
    } catch (error) {
      this.logger.error('Error fetching video', error);
      throw new InternalServerErrorException('Error fetching video.');
    }
  }

  async findAllByChannel(
    options: IPaginationOptions,
    channel: string,
  ): Promise<Pagination<Video>> {
    try {
      const queryBuilder = this.videosRepository.createQueryBuilder('video');
      queryBuilder
        .where('video.channel = :channel', { channel })
        .orderBy('video.uploadDate', 'DESC');

      return paginate<Video>(queryBuilder, options);
    } catch (error) {
      this.logger.error('Error fetching video', error);
      throw new InternalServerErrorException('Error fetching video.');
    }
  }

  async getAllVideoIds() {
    try {
      const videoIds = await this.videosRepository.find({
        select: ['friendlyId'],
      });
      return videoIds;
    } catch (error) {
      this.logger.log('Error fetching all video ids', error);
      throw new InternalServerErrorException('Error fetching all video ids');
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} video`;
  }

  update(id: number, updateVideoDto: UpdateVideoDto) {
    return `This action updates a #${id} video`;
  }

  remove(id: number) {
    return `This action removes a #${id} video`;
  }
}
