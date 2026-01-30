import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as zlib from 'zlib';

@Injectable()
export class CompressionMiddleware implements NestMiddleware {
  private readonly threshold: number;
  private readonly enabled: boolean;

  constructor() {
    this.threshold = parseInt(
      process.env.COMPRESSION_THRESHOLD || '1024',
      10,
    );
    this.enabled = process.env.COMPRESSION_ENABLED !== 'false';
  }

  use(req: Request, res: Response, next: NextFunction) {
    if (!this.enabled) {
      return next();
    }

    const acceptEncoding = req.headers['accept-encoding'] || '';

    if (!acceptEncoding.includes('gzip')) {
      return next();
    }

    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);
    const chunks: Buffer[] = [];

    res.write = ((
      chunk: any,
      encodingOrCallback?: BufferEncoding | ((error?: Error | null) => void),
      callback?: (error?: Error | null) => void,
    ): boolean => {
      if (chunk) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }

      if (typeof encodingOrCallback === 'function') {
        encodingOrCallback();
      } else if (callback) {
        callback();
      }

      return true;
    }) as any;

    res.end = ((
      chunk?: any,
      encodingOrCallback?: BufferEncoding | (() => void),
      callback?: () => void,
    ): Response => {
      if (chunk) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }

      const body = Buffer.concat(chunks);

      // Ne compresse que si la taille dépasse le seuil
      if (body.length < this.threshold) {
        res.write = originalWrite;
        res.end = originalEnd;
        return originalEnd(body);
      }

      zlib.gzip(body, (err, compressed) => {
        if (err) {
          res.write = originalWrite;
          res.end = originalEnd;
          return originalEnd(body);
        }

        res.setHeader('Content-Encoding', 'gzip');
        res.setHeader('Content-Length', compressed.length);
        res.removeHeader('Content-Length');

        res.write = originalWrite;
        res.end = originalEnd;
        originalEnd(compressed);
      });

      return res;
    }) as any;

    next();
  }
}
