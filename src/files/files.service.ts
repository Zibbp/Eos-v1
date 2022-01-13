import { Injectable, Logger } from '@nestjs/common';
import { dir } from 'console';
import * as fs from 'fs';
import { ChannelsService } from 'src/channels/channels.service';
import { CreateChannelDto } from 'src/channels/dto/create-channel.dto';
import { CreateVideoDto } from 'src/videos/dto/create-video.dto';
import { VideosService } from 'src/videos/videos.service';

// Basic array of channels objects
let channels = [];
// Array of channel objects + all videos found under the channel's directory
let channelVideoMap = [];
// Array of all video ids in the db
let dbVideoIds = [];

@Injectable()
export class FilesService {
  private logger = new Logger('FilesService');
  constructor(
    private channelsService: ChannelsService,
    private videosService: VideosService,
  ) {}

  async processChannels() {
    this.logger.log('[IMPORT] - Gathering Channels');
    const channelDirs = fs.readdirSync('/mnt/videos', { withFileTypes: true });
    for await (const cDir of channelDirs) {
      if (cDir.isDirectory()) {
        const channelNameFromDir = cDir.name.replace(/_/g, ' ');
        // Check if channel is in database
        try {
          const channel = await this.channelsService.findOneByName(
            channelNameFromDir,
          );

          const newChannelObject = {
            name: channel.name,
            dirName: cDir.name,
            id: channel.id,
            videoCount: channel['videoCount'],
          };
          channels.push(newChannelObject);
        } catch (error) {
          if (error.status === 404) {
            this.logger.log(
              `${channelNameFromDir} channel not found. Creating now.`,
            );
            const createChannelDto: CreateChannelDto = {
              name: channelNameFromDir,
              profileImagePath: `/mnt/videos/${cDir.name}/${cDir.name}.jpg`,
            };
            const createChannel = await this.channelsService.create(
              createChannelDto,
            );
            const newChannelObject = {
              name: createChannel.name,
              dirName: cDir.name,
              id: createChannel.id,
              videoCount: createChannel['videoCount'],
            };
            channels.push(newChannelObject);
          } else {
            this.logger.log('Error fetching channel');
          }
        }
        // Channels are either in DB or have been created.
        // All channels are now stored in a temp channels array
      }
    }
  }

  async mapVideos() {
    this.logger.log('[IMPORT] - Gathering Videos');
    // Loop through each channel and get the video folders
    for await (const channel of channels) {
      const videoDirs = fs.readdirSync(`/mnt/videos/${channel.dirName}`, {
        withFileTypes: true,
      });
      const channelVideos = {
        name: channel.name,
        dirName: channel.dirName,
        id: channel.id,
        dbVideoCount: channel.videoCount,
        videoDirsCount: videoDirs.length,
        videoDirs: [],
      };
      for await (const vDir of videoDirs) {
        if (vDir.isDirectory()) {
          // Check if folder is the root channel folder that yt-dlp creates and skip it.
          if (vDir.name == `${channel.dirName}-NA-${channel.dirName}-Videos`) {
          } else {
            channelVideos.videoDirs.push(vDir.name);
          }
        }
      }
      channelVideoMap.push(channelVideos);
    }
  }

  async getAllDbVideoIds() {
    this.logger.log('[IMPORT] - Fetching Database Video IDs');
    try {
      const videoIds = await this.videosService.getAllVideoIds();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      dbVideoIds = videoIds;
    } catch (error) {
      this.logger.log('Error fetching DB video ids.', error);
    }
  }

  async process() {
    this.logger.log('[IMPORT] - Processing Channels and Videos');
    for await (const channel of channelVideoMap) {
      // Check if video count in folder matches database, if so skip it
      if (channel.dbVideoCount === channel.videoDirs.length) {
        this.logger.log(
          `[IMPORT] - Skipping channel ${channel.name} as all videos are imported.`,
        );
      } else {
        this.logger.log(`[IMPORT] - Processing ${channel.name}'s channel.`);
        // Loop through each video folder in channel dir
        for await (const videoDir of channel.videoDirs) {
          // Read all files in the directory
          const rootVidDir = `/mnt/videos/${channel.dirName}/${videoDir}`;
          const filesInVideoDir = fs.readdirSync(rootVidDir);
          // eslint-disable-next-line prefer-const
          let videoObject = {
            friendlyId: null,
            channel: channel.id,
            title: null,
            description: null,
            rootPath: rootVidDir,
            infoPath: null,
            videoPath: null,
            thumbnailPath: null,
            subtitlesPath: null,
            generatedSubtitlesPath: null,
            uploader: null,
            duration: null,
            viewCount: null,
            uploadDate: null,
            likeCount: null,
            dislikeCount: null,
            resolution: null,
            fps: null,
            vcodec: null,
            acodec: null,
            abr: null,
            format: null,
            commentCount: null,
          };
          // Loop through each file and process it
          for await (const fileInDir of filesInVideoDir) {
            // Get file extension
            const fileExt = fileInDir.substring(fileInDir.lastIndexOf('.'));
            // Get info json file
            if (fileExt == '.json' && fileInDir.includes('.info.json')) {
              videoObject.infoPath = `${rootVidDir}/${fileInDir}`;
              const rawInfoData = fs.readFileSync(`${rootVidDir}/${fileInDir}`);
              const videoInfoData = await JSON.parse(rawInfoData.toString());
              // Convert date string into date object
              const dYear = videoInfoData.upload_date.substring(0, 4);
              const dMonth = videoInfoData.upload_date.substring(4, 6);
              const dDay = videoInfoData.upload_date.substring(6, 8);

              (videoObject.friendlyId = videoInfoData.id),
                (videoObject.title = videoInfoData.title),
                (videoObject.description = videoInfoData.description),
                (videoObject.uploader = videoInfoData.uploader),
                (videoObject.duration = videoInfoData.duration),
                (videoObject.viewCount = videoInfoData.view_count),
                (videoObject.uploadDate = new Date(dYear, dMonth - 1, dDay)),
                (videoObject.likeCount = videoInfoData.like_count),
                (videoObject.dislikeCount = videoInfoData.dislike_count),
                (videoObject.resolution = videoInfoData.resolution),
                (videoObject.fps = videoInfoData.fps),
                (videoObject.vcodec = videoInfoData.vcodec),
                (videoObject.acodec = videoInfoData.acodec),
                (videoObject.abr = videoInfoData.abr),
                (videoObject.format = videoInfoData.format),
                (videoObject.commentCount = videoInfoData.comment_count);
            }
            // Get thumbnail path
            if (fileExt == '.webp' || fileExt == '.jpg' || fileExt == '.png') {
              videoObject.thumbnailPath = `${rootVidDir}/${fileInDir}`;
            }
            // Get video path
            if (fileExt == '.mkv' || fileExt == '.mp4' || fileExt == '.webm') {
              // Get video path
              videoObject.videoPath = `${rootVidDir}/${fileInDir}`;
            }
            // Get auto generated subtitles path
            if (fileExt == '.vtt' && fileInDir.includes('.en.vtt')) {
              videoObject.generatedSubtitlesPath = `${rootVidDir}/${fileInDir}`;
            }
            // Get subtitles path
            if (fileExt == '.vtt' && fileInDir.includes('.en-US.vtt')) {
              videoObject.subtitlesPath = `${rootVidDir}/${fileInDir}`;
            }
          }
          const check = dbVideoIds.find(
            (video) => video.friendlyId === videoObject.friendlyId,
          );
          if (!check) {
            try {
              const createVideoDto: CreateVideoDto = videoObject;
              await this.videosService.create(createVideoDto);

              this.logger.log(
                `[IMPORT] - Successfully imported video ${createVideoDto.friendlyId}`,
              );
            } catch (error) {
              this.logger.log(
                `[IMPORT] - Error inserting video in database`,
                error,
              );
            }
          }
        }
      }
    }
  }

  async importVideos() {
    channels = [];
    channelVideoMap = [];
    dbVideoIds = [];
    await this.processChannels();
    await this.mapVideos();
    await this.getAllDbVideoIds();
    await this.process();
  }
}
