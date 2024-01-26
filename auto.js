const fs = require('fs/promises')
const path = require('path')

;(async () => {
  const files = await fs.readdir('./docs')
  const dirs = {}
  for (const file of files) {
    try {
      const files = await fs.readdir(`./docs/${file}`)
      dirs[file] = files
        .filter((file) => !file.startsWith('_') && file !== 'README.md')
        .sort((a, b) =>
          a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
        )
    } catch (error) {}
  }

  // nav & sidebar
  let navStr = ''
  let sidebarStr = ''
  Object.entries(dirs).forEach(async ([dir, files]) => {
    navStr += createUrl(dir, dir, '/') + '\n'
    sidebarStr = files
      .map((file) => createUrl(file, path.join(dir, file)))
      .join('\n')
    await fs.writeFile(`./docs/${dir}/_sidebar.md`, sidebarStr)

    // create README if not exist
    try {
      await fs.access(path.join('docs', dir, 'README.md'))
    } catch (error) {
      await fs.writeFile(path.join('docs', dir, 'README.md'), dir)
    }
  })
  await fs.writeFile('./docs/_navbar.md', navStr)
  await fs.writeFile('./docs/_sidebar.md', navStr)
})()

function createUrl(name, url, extra = '') {
  name = name.replace(/\.md/, '')
  return `* [${name}](/${encodeURI(url)}${extra})`
}
