const mapa = [
  ["svgs/acre.svg", 0, 206.84, "Norte"],
  ["svgs/amapa.svg", 322.38, 13.88, "Norte"],
  ["svgs/amazonas.svg", 3.55, 50.65, "Norte"],
  ["svgs/para.svg", 252.3, 44.51, "Norte"],
  ["svgs/rondonia.svg", 120.53, 221.54, "Norte"],
  ["svgs/roraima.svg", 154.48, 0, "Norte"],
  ["svgs/tocantins.svg", 391.25, 174.1, "Norte"],

  ["svgs/alagoas.svg", 600.27, 235.64, "Nordeste"],
  ["svgs/bahia.svg", 460.85, 230.66, "Nordeste"],
  ["svgs/ceara.svg", 546.95, 134.34, "Nordeste"],
  ["svgs/maranhao.svg", 423.95, 105.35, "Nordeste"],
  ["svgs/paraiba.svg", 592.32, 188.52, "Nordeste"],
  ["svgs/pernambuco.svg", 547.71, 209.39, "Nordeste"],
  ["svgs/piaui.svg", 470.42, 133.68, "Nordeste"],
  ["svgs/rio_grande_do_norte.svg", 593.94, 168.52, "Nordeste"],
  ["svgs/sergipe.svg", 600.01, 247.39, "Nordeste"],

  ["svgs/distrito_federal.svg", 431.81, 349.26, "Centro-Oeste"],
  ["svgs/goias.svg", 348.63, 296.22, "Centro-Oeste"],
  ["svgs/mato_grosso.svg", 208.12, 210.54, "Centro-Oeste"],
  ["svgs/mato_grosso_do_sul.svg", 265.97, 378.93, "Centro-Oeste"],

  ["svgs/espirito_santo.svg", 539.08, 390.77, "Sudeste"],
  ["svgs/minas_gerais.svg", 385.88, 327.67, "Sudeste"],
  ["svgs/rio_de_janeiro.svg", 489.23, 442.1, "Sudeste"],
  ["svgs/sao_paulo.svg", 349.79, 424.76, "Sudeste"],

  ["svgs/parana.svg", 325.52, 473.61, "Sul"],
  ["svgs/rio_grande_do_sul.svg", 275.41, 557.02, "Sul"],
  ["svgs/santa_catarina.svg", 338.55, 536.44, "Sul"]
];

const mapaSvg = document.querySelector("#mapa");
const loadingEl = document.querySelector(".loading"); 
const popUp = document.querySelector(".popUp");
const content = document.querySelector(".content");
const GIST_ID = 'c695194f270beb73384b82b9efc7ee90';
const GIST_URL = `https://gist.githubusercontent.com/Bebel132/${GIST_ID}/raw/mapa-api.json`;
let loading = false;
let mapaDados = null;
let API_URL = '';

async function carregaDados() {
  try {
    loading = true;
    loadingEl.style.display = "flex"; // mostra o loading
    mapaSvg.style.display = "none";
    popUp.style.display = "none";

    try {
        API_URL = await fetch(`${GIST_URL}?t=${Date.now()}`).then(res => res.json()).then(data => data.api_url+"");
    } catch (error) {
        console.error('Erro ao carregar API URL:', error);
        // Fallback para desenvolvimento
        API_URL = 'http://localhost:5000';
    }

    const response = await fetch(API_URL+'/estados/');
    //const response = await fetch('http://127.0.0.1:10000/estados');
    mapaDados = await response.json();

  } catch (err) {
    console.error("Erro ao carregar dados:", err);
  } finally {
    loading = false;
  }

  loadingEl.style.display = "none";
  mapaSvg.style.display = "block";
  popUp.style.display = "block";
}


const lookup = {};
mapa.forEach(([url, x, y, regiao,]) => {
  const nome = url.match(/svgs\/(.*)\.svg/)[1];
  lookup[nome.toLowerCase()] = { url, x, y, regiao };
});


carregaDados().then(() => {
  mapaDados.forEach(async d => {
    const key = d.estado
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_");

    if (lookup[key]) {
      d.url = lookup[key].url;
      d.x = lookup[key].x;
      d.y = lookup[key].y;
      d.regiao = lookup[key].regiao
    } else {
      console.warn("Não encontrado:", key);
    }

    const res = await fetch(d.url);
    const svgText = await res.text();
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, "image/svg+xml").documentElement;

    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.id = d.url.replace("svgs/", "").replace(".svg", "");
    g.classList.add(d.regiao)
    g.setAttribute("transform", `translate(${d.x}, ${d.y})`);

    svgDoc.querySelectorAll("path").forEach(path => {
      g.appendChild(path);
    });

    g.addEventListener("mouseenter", () => {
      g.querySelectorAll("path").forEach(path => {
        if(path.classList != 'ativo') {
          path.classList.add("hover")
        }
      });
    });

    g.addEventListener("mouseleave", () => {
      g.querySelectorAll("path").forEach(path => path.classList.remove("hover"));
    });

    g.addEventListener("click", () => {
      popUp.style.visibility = "visible"

      document.querySelectorAll(".ativo").forEach(a => {
        a.classList.remove("ativo");
      });

      popUp.children[1].textContent = d.estado;
      popUp.children[3].textContent = d.area.toLocaleString('pt-br') + "km²";
      popUp.children[5].textContent = d.pessoas.toLocaleString('pt-br') + " pessoas";
      popUp.children[7].textContent = `${d.porcentagem}, isto é ${parseInt((parseFloat(d.porcentagem.replace('%', ''))*d.pessoas)/100).toLocaleString('pt-br')} pessoas tem acesso a internet`;
      popUp.children[9].textContent = d.densidade + " pessoas por km²";

      g.querySelectorAll("path").forEach(path => {path.classList.add("ativo")});
    });

    mapaSvg.appendChild(g);
  });
});
