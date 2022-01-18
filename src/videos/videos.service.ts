import {
  BadRequestException,
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
import { Channel } from 'src/channels/entities/channel.entity';
import * as fs from 'fs';

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
      return video;
    } catch (error) {
      this.logger.verbose(`Error inserting video`, error);
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
        .leftJoinAndSelect('video.channel', 'channel')
        .orderBy('video.uploadDate', 'DESC');

      return paginate<Video>(queryBuilder, options);
    } catch (error) {
      this.logger.error('Error fetching video', error);
      throw new InternalServerErrorException('Error fetching video.');
    }
  }

  async findAllBySearch(
    options: IPaginationOptions,
    search: string,
  ): Promise<Pagination<Video>> {
    try {
      const queryBuilder = this.videosRepository.createQueryBuilder('video');
      queryBuilder
        .where('title ILIKE :searchTerm', {
          searchTerm: `%${search}%`,
        })
        .leftJoinAndSelect('video.channel', 'channel');

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

  async findOne(id: string) {
    try {
      const video = await this.videosRepository.findOneOrFail({
        where: { friendlyId: id },
        relations: ['channel'],
      });
      return video;
    } catch (error) {
      throw new NotFoundException(`Video not found with supplied id ${id}`);
    }
  }

  update(id: number, updateVideoDto: UpdateVideoDto) {
    return `This action updates a #${id} video`;
  }

  remove(id: number) {
    return `This action removes a #${id} video`;
  }

  async getComments(id: string, limit: string) {
    const video = await this.findOne(id);
    if (video.commentCount == 0 || video.commentCount == null) {
      throw new BadRequestException('No comments were found on this video');
    }
    try {
      const rawInfo = fs.readFileSync(`/mnt/videos/${video.infoPath}`);
      const videoInfo = await JSON.parse(rawInfo.toString());
      const rawComments = videoInfo.comments;
      const comments: string[] = [];

      // Sort comments by the parent or child
      const sortByParent = await rawComments.sort(function (a, b) {
        if (a.parent == 'root') return -1;
        if (a.parent != 'root') return 1;
      });

      // create a new comment array with one root and multiple children
      for await (const comment of sortByParent) {
        if (comment.parent != 'root') {
          const result = comments.findIndex(function (parentComment) {
            // @ts-ignore
            return parentComment.id === comment.parent;
          });
          // @ts-ignore
          if (!comments[result].replies) {
            // @ts-ignore
            comments[result].replies = [];
          }
          // @ts-ignore
          comments[result].replies.push(comment);
        } else {
          comments.push(comment);
        }
      }

      // Sort comments by highest like count
      const sortByLikes = sortByParent.sort(function (a, b) {
        if (a.like_count > b.like_count) return -1;
        if (a.like_count < b.like_count) return 1;
        return 0;
      });

      return sortByLikes.slice(0, limit);
    } catch (error) {
      this.logger.error('Error getting comments', error);
      throw new InternalServerErrorException('Error getting comments');
    }
  }
  async getAllComments(id: string) {
    const video = await this.findOne(id);
    if (video.commentCount == 0 || video.commentCount == null) {
      throw new BadRequestException('No comments were found on this video');
    }
    try {
      const rawInfo = fs.readFileSync(`/mnt/videos/${video.infoPath}`);
      const videoInfo = await JSON.parse(rawInfo.toString());
      const rawComments = videoInfo.comments;
      const comments: string[] = [];

      // Sort comments by the parent or child
      const sortByParent = await rawComments.sort(function (a, b) {
        if (a.parent == 'root') return -1;
        if (a.parent != 'root') return 1;
      });

      // create a new comment array with one root and multiple children
      for await (const comment of sortByParent) {
        if (comment.parent != 'root') {
          const result = comments.findIndex(function (parentComment) {
            // @ts-ignore
            return parentComment.id === comment.parent;
          });
          // @ts-ignore
          if (!comments[result].replies) {
            // @ts-ignore
            comments[result].replies = [];
          }
          // @ts-ignore
          comments[result].replies.push(comment);
        } else {
          comments.push(comment);
        }
      }

      // Sort comments by highest like count
      const sortByLikes = sortByParent.sort(function (a, b) {
        if (a.like_count > b.like_count) return -1;
        if (a.like_count < b.like_count) return 1;
        return 0;
      });

      return sortByLikes;
    } catch (error) {
      this.logger.error('Error getting comments', error);
      throw new InternalServerErrorException('Error getting comments');
    }
  }

  async findRandomVideos(
    options: IPaginationOptions,
  ): Promise<Pagination<Video>> {
    try {
      const queryBuilder = this.videosRepository.createQueryBuilder('video');
      queryBuilder
        .leftJoinAndSelect('video.channel', 'channel')
        .orderBy('RANDOM()')
        .limit(50);

      return paginate<Video>(queryBuilder, options);
    } catch (error) {
      this.logger.error('Error fetching videos', error);
      throw new InternalServerErrorException('Error fetching videos.');
    }
  }
}
