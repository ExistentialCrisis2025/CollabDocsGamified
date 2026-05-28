import re
content = open('src/components/Kanban.tsx', encoding='utf-8').read()
start = content.find('<XPBar')
end = content.find('<div className="w-full rounded-2xl border ')
if start != -1 and end != -1:
    new_content = content[:start] + content[end:]
    # Now let's fix some theme colors
    new_content = new_content.replace('min-h-screen w-full bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-800', 'w-full')
    new_content = new_content.replace('border-zinc-700', 'border-slate-200 dark:border-slate-700')
    new_content = new_content.replace('bg-zinc-800', 'bg-white dark:bg-slate-800')
    new_content = new_content.replace('bg-zinc-900', 'bg-slate-50 dark:bg-slate-900')
    new_content = new_content.replace('text-white', 'text-slate-800 dark:text-slate-100')
    new_content = new_content.replace('bg-zinc-900/80', 'bg-white/80 dark:bg-slate-900/80')
    new_content = new_content.replace('text-zinc-400', 'text-slate-500 dark:text-slate-400')
    
    open('src/components/Kanban.tsx', 'w', encoding='utf-8').write(new_content)
    print("Kanban updated")
