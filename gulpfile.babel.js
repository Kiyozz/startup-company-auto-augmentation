import { src, dest, series, watch } from 'gulp'
import babel from 'gulp-babel'
import copy from 'gulp-copy'
import del from 'del'

function copyAssets() {
  return src(['mod.json', 'thumbnail.png', 'locales/*'])
      .pipe(copy('dist/'))
}

export function buildJs() {
  return src('src/start.js')
      .pipe(babel({ comments: false }))
      .pipe(dest('dist'))
}

export function clean() {
  return del('dist/*')
}

export const buildWatch = () => watch(['src/start.js', 'mod.json'], { ignoreInitial: false }, build)
export const build = series(clean, buildJs, copyAssets)