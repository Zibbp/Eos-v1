import { Channel } from 'src/channels/entities/channel.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'videos' })
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  friendlyId: string;

  @ManyToOne(() => Channel, (channel) => channel.videos, {
    onDelete: 'CASCADE',
  })
  channel: Channel;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: false })
  rootPath: string;

  @Column({ nullable: true })
  infoPath: string;

  @Column({ nullable: false })
  videoPath: string;

  @Column({ nullable: false })
  thumbnailPath: string;

  @Column({ nullable: true })
  subtitlesPath: string;

  @Column({ nullable: true })
  generatedSubtitlesPath: string;

  @Column({ nullable: true })
  uploader: string;

  @Column({ nullable: false })
  duration: number;

  @Column({ nullable: false })
  viewCount: number;

  @Column({ nullable: false })
  uploadDate: Date;

  @Column({ nullable: true })
  likeCount: number;

  @Column({ nullable: true })
  dislikeCount: number;

  @Column({ nullable: true })
  resolution: string;

  @Column({ nullable: true })
  fps: number;

  @Column({ nullable: true })
  vcodec: string;

  @Column({ nullable: true })
  acodec: string;

  @Column({ nullable: true })
  abr: string;

  @Column({ nullable: true })
  format: string;

  @Column({ nullable: true })
  commentCount: number;

  @Column('text', { array: true, nullable: true, default: '{}' })
  tags: string[];

  @Column('text', { array: true, nullable: true, default: '{}' })
  categories: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
