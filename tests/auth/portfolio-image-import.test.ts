import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getPortfolioImportImageErrorMessage,
  isPortfolioImportImageSuccess,
  pickPortfolioImportImage,
} from '../../src/subPages/valuation-tool/image-import.js'

test('pickPortfolioImportImage returns first chosen file with uploaded name', () => {
  const result = pickPortfolioImportImage({
    tempFilePaths: ['/tmp/holding-1.png', '/tmp/holding-2.png'],
    tempFiles: [
      { name: 'holding-1.png' },
      { name: 'holding-2.png' },
    ],
  })

  assert.deepEqual(result, {
    filePath: '/tmp/holding-1.png',
    fileName: 'holding-1.png',
  })
})

test('pickPortfolioImportImage falls back to default file name when chooseImage omits name', () => {
  const result = pickPortfolioImportImage({
    tempFilePaths: ['/tmp/holding-1.png'],
    tempFiles: [{}],
  })

  assert.deepEqual(result, {
    filePath: '/tmp/holding-1.png',
    fileName: '持仓截图-1.png',
  })
})

test('portfolio image import treats code 0 as successful response', () => {
  assert.equal(isPortfolioImportImageSuccess({ code: 0 }), true)
  assert.equal(isPortfolioImportImageSuccess({ code: 200 }), false)
})

test('portfolio image import prefers backend message when building error text', () => {
  assert.equal(
    getPortfolioImportImageErrorMessage({ message: '图片内容无法识别' }),
    '图片内容无法识别',
  )
  assert.equal(
    getPortfolioImportImageErrorMessage({ msg: '截图为空' }),
    '截图为空',
  )
  assert.equal(
    getPortfolioImportImageErrorMessage({}),
    '截图上传失败，请重新上传后再试。',
  )
})
