const fontkit = require('fontkit')
const path = require('path')

// 從命令列參數獲取字體檔案名稱
const fontFileName = process.argv[2]

if (!fontFileName) {
  console.error('請提供字體檔案名稱')
  console.log('使用方式: node checkFontName.js <字體檔案名稱>')
  console.log('例如: node checkFontName.js ChongXiSmallSeal.ttf')
  process.exit(1)
}

// 指定字體檔案的路徑
const fontPath = path.join(__dirname, 'public', 'fonts', fontFileName)

try {
  const font = fontkit.openSync(fontPath)
  console.log('Font Full Name:', font.fullName)
  console.log('PostScript Name:', font.postscriptName)
  console.log('Family Name:', font.familyName)
  console.log('Subfamily Name:', font.subfamilyName)
} catch (error) {
  console.error('Error reading font:', error)
}
