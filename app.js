const Application = require('koa');
const send = require('koa-send');
const path = require('path');
const imagesRoot = path.join(__dirname, 'images');
const cacheRoot = path.join(__dirname, 'cache');
const fs = require('fs-extra');
const app = new Application();
const { exec } = require('mz/child_process');
fs.ensureDirSync(cacheRoot);

app.use(async ctx => {
  let width = +ctx.request.query.w;
  let height = +ctx.request.query.h;

  if (width && (width % 10 != 0 || width > 1000)) {
    ctx.throw(400, 'Invalid width.');
  }
  
  if (height && (height % 10 != 0 || height > 1000)) {
    ctx.throw(400, 'Invalid height.');
  }

  let imageFileName = ctx.request.path.replace(/[^a-z0-9_\-.]/ig, '');
  let imagePath = path.resolve(imagesRoot, imageFileName);

  let exists = await fs.exists(imagePath);

  if (!exists) {
    ctx.throw(404);
  }

  if (width && height) {
    let cacheDir = path.resolve(cacheRoot, ''+ width, '' + height);
    let cachedImagePath = path.resolve(cacheDir, imageFileName);

    if (fs.existsSync(cachedImagePath)) {
      sendImage(ctx, cachedImagePath);
      return;
    }
    
    await fs.ensureDir(cacheDir);

    await exec(`convert ${imagePath} -resize ${width}x${height} ${cachedImagePath}`, {
      stdio: 'inherit',
      encoding: 'utf-8'
    });

    sendImage(ctx, cachedImagePath);
    
  } else {
    sendImage(ctx, imagePath);
  }
});

function sendImage(ctx, file) {
  let ext = path.extname(file).slice(1);
  ctx.type = `image/${ext}`;
  ctx.body = fs.createReadStream(file);
}

module.exports = app;
