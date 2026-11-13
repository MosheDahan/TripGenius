import path from 'path';

export function getUploadsDirectory(): string {
    return path.resolve(process.cwd(), 'src', 'assets', 'images');
}
