import re

content = open('src/components/Kanban.tsx', encoding='utf-8').read()

start = content.find('<XPBar')
end = content.find('<div className="w-full rounded-2xl border border-zinc-700 bg-zinc-900/80 p-6 shadow-2xl">')

if start != -1 and end != -1:
    new_content = content[:start] + content[end:]
    open('src/components/Kanban.tsx', 'w', encoding='utf-8').write(new_content)
    print("Trimmed successfully")
else:
    print(f"Failed. Start: {start}, End: {end}")