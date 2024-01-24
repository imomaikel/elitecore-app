import { ReadableStream } from 'stream/web';
import { finished } from 'stream/promises';
import fs, { mkdirSync } from 'fs';
import { Readable } from 'stream';
import path from 'path';

type TDownloadAttachment = {
  id: string;
  url: string;
  name: string;
  ticketLogPath: string;
};
export const _downloadAttachment = async ({ id, ticketLogPath, url, name }: TDownloadAttachment) => {
  if (!fs.existsSync(ticketLogPath)) mkdirSync(ticketLogPath, { recursive: true });
  const ext = name.substring(name.lastIndexOf('.'));
  const filePath = path.resolve(ticketLogPath, `${id}${ext}`);

  const { body } = await fetch(url);
  const stream = fs.createWriteStream(filePath);
  if (body === null) return false;

  await finished(Readable.fromWeb(body as ReadableStream).pipe(stream));

  const publicUrl = filePath.substring(filePath.indexOf('/attachments'));

  return publicUrl;
};
