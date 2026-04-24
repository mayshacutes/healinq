import os

file_path = r'd:\SEM 4\PWEBPRAK\HealinQ\healinq\app\(main)\profile\page.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines[:588])