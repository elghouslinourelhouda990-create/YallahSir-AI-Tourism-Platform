import sys

content = open('script.js', 'r', encoding='utf8').read()

content = content.replace(r"'Vivez l'ambiance au stade':", r'"Vivez l\'ambiance au stade":')
content = content.replace(r"'Vivez l'ambiance':", r'"Vivez l\'ambiance":')

open('script.js', 'w', encoding='utf8').write(content)
print("Fixed script.js")
