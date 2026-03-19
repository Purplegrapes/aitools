import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const projectRoot = process.cwd()
const srcRoot = path.join(projectRoot, 'src')
const ignoredDirNames = new Set([
  'api/mock',
  'uni_modules',
])
const targetExtensions = new Set(['.ts', '.js', '.mjs', '.vue'])

const directMethodSendPattern = /\b[A-Za-z_$][\w$]*\([^()\n]*\)\.send\(/g

const violations = []

walkDirectory(srcRoot)

if (violations.length) {
  console.error('\n[alova-check] Found request usage that violates project conventions:\n')
  for (const violation of violations) {
    console.error(`- ${violation.file}:${violation.line}`)
    console.error(`  ${violation.message}`)
  }
  console.error('\nSee docs/alova-guidelines.md for the expected patterns.\n')
  process.exit(1)
}

process.exit(0)

function walkDirectory(directoryPath) {
  const directoryEntries = fs.readdirSync(directoryPath, { withFileTypes: true })

  for (const entry of directoryEntries) {
    if (entry.name.startsWith('.'))
      continue

    const entryPath = path.join(directoryPath, entry.name)
    if (entry.isDirectory()) {
      const relativeDirPath = path.relative(srcRoot, entryPath).replaceAll('\\', '/')
      if (ignoredDirNames.has(entry.name) || ignoredDirNames.has(relativeDirPath))
        continue
      walkDirectory(entryPath)
      continue
    }

    if (!targetExtensions.has(path.extname(entry.name)))
      continue

    inspectFile(entryPath)
  }
}

function inspectFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const relativeFilePath = path.relative(projectRoot, filePath)

  for (const match of content.matchAll(directMethodSendPattern)) {
    const line = getLineNumber(content, match.index ?? 0)
    violations.push({
      file: relativeFilePath,
      line,
      message: 'Do not call `.send()` on a freshly created alova Method directly. Wrap the Method in `useRequest` and trigger the returned `send` instead.',
    })
  }

  inspectDeleteUsage(content, relativeFilePath)
}

function getLineNumber(content, index) {
  return content.slice(0, index).split('\n').length
}

function inspectDeleteUsage(content, relativeFilePath) {
  const lines = content.split('\n')

  for (let index = 0; index < lines.length; index += 1) {
    const currentLine = lines[index]
    if (!currentLine.includes('alovaInstance.Delete'))
      continue

    const windowContent = lines.slice(index, index + 4).join('\n')
    if (!windowContent.includes('headers'))
      continue
    if (windowContent.includes('undefined,') || windowContent.includes('null,'))
      continue

    violations.push({
      file: relativeFilePath,
      line: index + 1,
      message: 'Do not pass request config as the second argument of `alovaInstance.Delete`. Use `Delete(url, data, config)` so headers land in the request config.',
    })
  }
}
