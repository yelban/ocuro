from fontTools.ttLib import TTFont

# 讀取字體檔案
font = TTFont('/Users/orz99/Downloads/KingHwa_OldSong-2e.ttf')

# 獲取所有字元
chars = []
for table in font['cmap'].tables:
    for code, name in table.cmap.items():
        try:
            char = chr(code)
            chars.append(char)
        except:
            pass

# 輸出到檔案
with open('kingHwa_chars.txt', 'w', encoding='utf-8') as f:
    f.write(''.join(chars))

# 打印字元總數
print(f'Total characters: {len(chars)}')

