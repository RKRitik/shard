import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { MultipartFile } from "@fastify/multipart";

async function blobToBuffer(blob: MultipartFile): Promise<Buffer> {
  return Buffer.from(await blob.toBuffer());
}


const s3 = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY || "",
    secretAccessKey: process.env.AWS_SECRET || "",
  },
});

export async function uploadBlobToS3(fileKey: string, blob: MultipartFile) {
  try {
    console.log('uploading blob to s3', fileKey, blob);
    const buffer = await blobToBuffer(blob);
    const bucketName = process.env.AWS_BUCKET_NAME || "";
    const command = await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        Body: buffer,
        ContentType: blob.type,
      })
    );
    console.log('command', command);
    return command;
  } catch (error) {
    console.error('error uploading blob to s3', error);
    return null;
  }
}