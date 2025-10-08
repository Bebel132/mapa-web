const mapa = [
  ["svgs/acre.svg", 0, 206.84],
  ["svgs/alagoas.svg", 600.27, 235.64],
  ["svgs/amapa.svg", 322.38, 13.88],
  ["svgs/amazonas.svg", 3.55, 50.65],
  ["svgs/bahia.svg", 460.85, 230.66],
  ["svgs/ceara.svg", 546.95, 134.34],
  ["svgs/distrito_federal.svg", 431.81, 349.26],
  ["svgs/espirito_santo.svg", 539.08, 390.77],
  ["svgs/goias.svg", 348.63, 296.22],
  ["svgs/maranhao.svg", 423.95, 105.35],
  ["svgs/mato_grosso.svg", 208.12, 210.54],
  ["svgs/mato_grosso_do_sul.svg", 265.97, 378.93],
  ["svgs/minas_gerais.svg", 385.88, 327.67],
  ["svgs/para.svg", 252.3, 44.51],
  ["svgs/paraiba.svg", 592.32, 188.52],
  ["svgs/parana.svg", 325.52, 473.61],
  ["svgs/pernambuco.svg", 547.71, 209.39],
  ["svgs/piaui.svg", 470.42, 133.68],
  ["svgs/rio_de_janeiro.svg", 489.23, 442.1],
  ["svgs/rio_grande_do_norte.svg", 593.94, 168.52],
  ["svgs/rio_grande_do_sul.svg", 275.41, 557.02],
  ["svgs/rondonia.svg", 120.53, 221.54],
  ["svgs/roraima.svg", 154.48, 0],
  ["svgs/santa_catarina.svg", 338.55, 536.44],
  ["svgs/sao_paulo.svg", 349.79, 424.76],
  ["svgs/sergipe.svg", 600.01, 247.39],
  ["svgs/tocantins.svg", 391.25, 174.1]
];

const mapaSvg = document.querySelector("#mapa");
const loadingEl = document.querySelector(".loading"); 
const popUp = document.querySelector(".popUp");
let loading = false;
let mapaDados = null;

async function carregaDados() {
  try {
    loading = true;
    loadingEl.style.display = "flex"; // mostra o loading
    mapaSvg.style.display = "none";
    popUp.style.display = "none";

    const response = await fetch('https://mapa-api.onrender.com/estados/');
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
mapa.forEach(([url, x, y]) => {
  const nome = url.match(/svgs\/(.*)\.svg/)[1];
  lookup[nome.toLowerCase()] = { url, x, y };
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
    } else {
      console.warn("Não encontrado:", key);
    }

    const res = await fetch(d.url);
    const svgText = await res.text();
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, "image/svg+xml").documentElement;

    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.id = d.url.replace("svgs/", "").replace(".svg", "");
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
      popUp.children[3].textContent = d.porcentagem;

      g.querySelectorAll("path").forEach(path => {path.classList.add("ativo")});
    });

    mapaSvg.appendChild(g);
  });
});