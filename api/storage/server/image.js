const fs = require('fs');
const path = require('path');
const FileType = require('file-type');
const exifr = require('exifr');
const sharp = require('sharp');

const VALID_IMAGE_FORMATS = new Set(['jpg', 'jpeg', 'png']);
const metaToExtract = ['ImageWidth', 'ImageHeight', 'Orientation', 'CreateDate', 'Make', 'Model'];
const THUMBNAIL_HEIGHT = 360;

class ImageFormatError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ImageFormatError';
    }
}

async function checkImageFormat(imgPath) {
  const formatinfo = await FileType.fromFile(imgPath);
  return VALID_IMAGE_FORMATS.has(formatinfo.ext);
}

async function extractImageMeta(imgPath) {
  console.log(`Extract meta info of ${imgPath}`);

  if (!checkImageFormat(imgPath)) {
    throw new ImageFormatError(`File ${imgPath} is not supported`);
  }

  let imagegps = await exifr.gps(imgPath);
  imagegps.latitude = Math.round(imagegps.latitude * 10 ** 6) / 10 ** 6;
  imagegps.longitude = Math.round(imagegps.longitude * 10 ** 6) / 10 ** 6;
  const imagemeta = Object.assign(imagegps, await exifr.parse(imgPath, metaToExtract));
  return imagemeta;
}

async function createThumbnail(imgBuffer, thumbnailPath) {
  const thumbnailDirectory = path.dirname(thumbnailPath);
  const thumbnailName = path.basename(thumbnailPath);
  fs.mkdirSync(thumbnailDirectory, { recursive: true });
  console.log(`Create thumbnail image for ${thumbnailName}`);

  // For facilitating display in the front-end, we fix the height of the thumbnail
  // image to be 360, and use an auto-scale strategy to preserve the aspect ratio.
  sharp(imgBuffer)
    .resize(null, THUMBNAIL_HEIGHT)
    .toFormat('jpg')
    .toFile(thumbnailPath, (error, info) => {
      if (error) { 
        throw new Error(`Unable to create thumbnail image of ${thumbnailName}: ` + error.message);
      }
      console.log(`Thumbnail of size ${info.size >> 10} KB is created!`);
    })
}

module.exports = { extractImageMeta, createThumbnail };