import requests
from bs4 import BeautifulSoup

headers = {
    "User-Agent": "Infografico Acesso a Internet no Brasil (https://github.com/Bebel132; contato: emanuel2005batista@gmail.com)"
}

# porcentagem de internet
pagina1 = requests.get('https://pt.wikipedia.org/wiki/Lista_de_unidades_federativas_do_Brasil_por_acesso_%C3%A0_Internet', headers=headers)
dados_pagina = BeautifulSoup(pagina1.content, 'html.parser')

tabela = dados_pagina.find("table", class_="wikitable")
linhas = tabela.find_all("tr")[1:]

tabela_dados = []

for linha in linhas:    
    td = linha.find_all("td")
    if(td[1].get_text(strip=True) != 'Brasil'):
        dado = {
            'estado': td[1].get_text(strip=True),
            'porcentagem': td[2].get_text(strip=True)
        }

    tabela_dados.append(dado)
    

# area do brasil
pagina2 = requests.get('https://pt.wikipedia.org/wiki/Lista_de_unidades_federativas_do_Brasil_por_%C3%A1rea', headers=headers)
dados_pagina = BeautifulSoup(pagina2.content, 'html.parser')

tabela = dados_pagina.find("table", class_="wikitable")
linhas = tabela.find_all("tr")[1:-1]

for linha in linhas:
    td = linha.find_all("td")
    
    for tabela_linha in tabela_dados:
        if tabela_linha['estado'] == td[1].get_text(strip=True):
            tabela_linha['area'] = td[2].get_text(strip=True).replace('\xa0', '.')