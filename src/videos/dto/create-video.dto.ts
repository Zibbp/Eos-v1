import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateVideoDto {
    @IsString()
    friendlyId: string;

    @IsString()
    channel: string;

    @IsString()
    title: string

    @IsString()
    @IsOptional()
    description: string

    @IsString()
    rootPath: string

    @IsString()
    @IsOptional()
    infoPath: string

    @IsString()
    videoPath: string

    @IsString()
    thumbnailPath: string

    @IsString()
    @IsOptional()
    subtitlesPath: string

    @IsString()
    @IsOptional()
    generatedSubtitlesPath: string

    @IsString()
    @IsOptional()
    uploader: string

    @IsNumber()
    duration: number

    @IsNumber()
    viewCount: number

    @IsString()
    uploadDate: Date

    @IsNumber()
    @IsOptional()
    likeCount: number

    @IsNumber()
    @IsOptional()
    dislikeCount: number

    @IsString()
    @IsOptional()
    resolution: string

    @IsNumber()
    @IsOptional()
    fps: number

    @IsString()
    @IsOptional()
    vcodec: string

    @IsString()
    @IsOptional()
    acodec: string

    @IsNumber()
    @IsOptional()
    abr: number

    @IsString()
    @IsOptional()
    format: string

    @IsNumber()
    @IsOptional()
    commentCount: number
}
