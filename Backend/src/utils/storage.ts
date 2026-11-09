import path from 'path';

export function getUploadsDirectory(): string {
    return path.resolve(
        process.env.UPLOADS_DIR || path.join(process.cwd(), 'src', 'assets', 'images')
    );
}
