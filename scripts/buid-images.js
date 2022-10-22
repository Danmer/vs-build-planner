const { readFileSync, existsSync } = require('fs')
const { execSync } = require('child_process')

const src = `${__dirname}/src`
const dst = `${__dirname}/img`

const sprites = ['characters', 'enemies', 'enemies2', 'enemies3', 'enemiesM', 'items', 'randomazzo', 'UI']

try {
  for (const sprite of sprites) {
    const framesById = getFramesById(sprite)
    for (const id in framesById) {
      const frames = framesById[id]
      for (const frame of frames) {
        const framePath = `${dst}/${sprite}_${frame.filename}`
        if (!existsSync(framePath)) {
          execSync(`magick ${src}/${sprite}.png -crop ${frame.w}x${frame.h}+${frame.x}+${frame.y} ${framePath}`)
        }
      }
      if (frames.length > 1) {
        console.log(`making gif for ${sprite} / ${id}`)
        const maxW = frames.reduce((max, frame) => Math.max(frame.w, max), 0)
        const maxH = frames.reduce((max, frame) => Math.max(frame.h, max), 0)
        // TODO: make sure if gravity and page size work?
        execSync(`magick -loop 0 -dispose previous -delay 20 -gravity South -page ${maxW}x${maxH}+0+0 ${dst}/${sprite}_${id}*.png ${dst}/${sprite}_${id}.gif`)
      }
    }
  }
} catch (error) {
  console.error(error)
}

function getFramesById(sprite) {
  const data = JSON.parse('' + readFileSync(`${src}/${sprite}.json`))
  const texture = data.textures[0]
  const framesById = {}
  for (const frame of texture.frames) {
    // ignore death animations of enemies
    const [filename, id, index] = sprite.includes('enemies') ? frame.filename.match(/(\w+)_i(\d+)\.png/) || [] : frame.filename.match(/(\w+)_(\d\d)\.png/) || frame.filename.match(/([a-zA-Z_]+i?\d?)(\d)\.png/i) || frame.filename.match(/(.+)\.png/) || []
    // const [filename, id, index] = (sprite.includes('enemies') ? frame.filename.match(/(\w+)_i(\d+)\.png/) : frame.filename.match(/(.+)\.png/)) || []
    if (id) {
      const { w, h, x, y } = frame.frame
      framesById[id] = framesById[id] || []
      framesById[id].push({ id, index, filename, w, h, x, y })
    }
  }
  return framesById
}
