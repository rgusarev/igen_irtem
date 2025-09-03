words = [el.split('~') for el in open('words.txt', encoding="utf-8").read().split('\n')]
with open("words_prep.txt", 'w', encoding='utf-8') as f:
    f.write("var words = [\n")
    for w_eng, w_hun in words:
        f.write(f'    ["{w_eng}", "{w_hun}"],\n')
    f.write("];")
