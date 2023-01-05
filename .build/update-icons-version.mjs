import minimist from 'minimist'
import cp from 'child_process'
import fs from 'fs'
import { join, resolve } from 'path'
import { HOME_DIR, ICONS_SRC_DIR } from './helpers.mjs'

const p = JSON.parse(fs.readFileSync(resolve(HOME_DIR, 'package.json'), 'utf-8'))

const argv = minimist(process.argv.slice(2))
const version = argv['latest-version'] || `${p.version}`,
    newVersion = argv['new-version'] || `${p.version}`

const setVersions = function(version, files) {
  for (const i in files) {
    const file = files[i],
        filePath = join(ICONS_SRC_DIR, `${file}.svg`)

    if (fs.existsSync(filePath)) {
      let svgFile = fs.readFileSync(filePath).toString()

      if (!svgFile.match(/version: ([0-9.]+)/i)) {
        svgFile = svgFile.replace(/---\n<svg>/i, function(m) {
          return `version: "${version}"\n${m}`
        })

        fs.writeFileSync(filePath, svgFile)
      } else {
        console.log(`File ${file} already has version`)
      }

    } else {
      console.log(`File ${file} doesn't exists`)
    }
  }
}

if (version) {
  cp.exec(`grep -RiL "version: " ${ICONS_SRC_DIR}/*.svg`, function(err, ret) {
    let newIcons = []

    ret.replace(/src\/_icons\/([a-z0-9-]+)\.svg/g, function(m, fileName) {
      newIcons.push(fileName)
    })

    if (newIcons.length) {
      setVersions(newVersion.replace(/\.0$/, ''), newIcons)
    }
  })
}
