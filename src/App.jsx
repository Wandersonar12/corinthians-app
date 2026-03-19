import { useState, useEffect, useRef, useCallback } from "react";
import LIVE_DATA from "./data";

// ── CONFIG ───────────────────────────────────────────────
const APP_NAME = "Wanderson - Corinthians";

async function askAssistant(messages) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      system: `Você é o assistente pessoal de futebol de Wanderson, especializado no Corinthians.
Responda sempre em português do Brasil. Seja entusiasta e use emojis ⚽🖤🤍.
Você conhece os dados atuais: o Corinthians está em 8º no Brasileirão 2026 com 8 pontos (2V 2E 2D).
Técnico: Dorival Júnior. Artilheiros 2026: Yuri Alberto (3), Gabriel Paulista (2), Breno Bidon (2), André (2).
Memphis Depay marcou 1 gol em 2026 (vs Santos, 15/03). Próximo jogo: Chapecoense x Corinthians, 19/03 às 21h30 na Arena Condá.`,
      messages: messages.map(m => ({ role: m.role, content: m.content }))
    })
  });
  const d = await res.json();
  return d.content?.[0]?.text || "Erro ao conectar.";
}

// ── DADOS REAIS ──────────────────────────────────────────

const NEWS = [
  { source:"Meu Timão",       color:"#1a7a3a", time:"18/03 · 19:01", url:"https://www.meutimao.com.br/noticias-do-corinthians/529208/", title:"Atacante do Corinthians tem a melhor marca de finalizações pelo Brasileirão desde 2020" },
  { source:"Meu Timão",       color:"#1a7a3a", time:"18/03 · 18:16", url:"https://www.meutimao.com.br/noticias-do-corinthians/529198/", title:"Corinthians desembarca em Santa Catarina com 24 jogadores para enfrentar a Chapecoense" },
  { source:"Tudo Timão",      color:"#c8a84b", time:"18/03 · 17:48", url:"https://www.tudotimao.com.br/", title:"Dorival confirma quando Lingard irá estrear pelo Corinthians" },
  { source:"Meu Timão",       color:"#1a7a3a", time:"18/03 · 17:31", url:"https://www.meutimao.com.br/noticias-do-corinthians/529188/", title:"Corinthians confirma lesão ligamentar de André e estiramento em Bidon como desfalques" },
  { source:"Lance!",          color:"#FF6B00", time:"18/03 · 17:08", url:"https://www.lance.com.br/corinthians/", title:"Neo Química Arena recebe instalação do sistema de impedimento semiautomático" },
  { source:"Meu Timão",       color:"#1a7a3a", time:"18/03 · 15:39", url:"https://www.meutimao.com.br/noticias-do-corinthians/529178/", title:"Corinthians define representantes para sorteio da Libertadores 2026" },
  { source:"Meu Timão",       color:"#1a7a3a", time:"18/03 · 15:34", url:"https://www.meutimao.com.br/noticias-do-corinthians/529168/", title:"Dupla é desfalque do Corinthians para enfrentar a Chapecoense; saiba o motivo" },
  { source:"Meu Timão",       color:"#1a7a3a", time:"18/03 · 14:58", url:"https://www.meutimao.com.br/noticias-do-corinthians/529158/", title:"Yuri Alberto confirma retorno e relembra momento artilheiro diante da Chapecoense" },
  { source:"Meu Timão",       color:"#1a7a3a", time:"18/03 · 14:42", url:"https://www.meutimao.com.br/noticias-do-corinthians/529148/", title:"Corinthians encerra preparação para Chapecoense; veja provável escalação de Dorival" },
  { source:"Meu Timão",       color:"#1a7a3a", time:"18/03 · 14:31", url:"https://www.meutimao.com.br/noticias-do-corinthians/529138/", title:"Entenda o significado da comemoração de Memphis Depay no gol contra o Santos" },
  { source:"Tudo Timão",      color:"#c8a84b", time:"18/03 · 13:22", url:"https://www.tudotimao.com.br/", title:"Alisson revela bastidores de negociação frustrada com o Corinthians" },
  { source:"Bolavip",         color:"#0055A5", time:"18/03 · 12:26", url:"https://br.bolavip.com/corinthians/", title:"Corinthians avalia investida por Arthur Cabral, atacante em destaque do Botafogo" },
  { source:"Tudo Timão",      color:"#c8a84b", time:"18/03 · 11:23", url:"https://www.tudotimao.com.br/", title:"Time do Brasileirão prepara proposta por Pedro Raul do Corinthians" },
  { source:"Meu Timão",       color:"#1a7a3a", time:"18/03 · 10:28", url:"https://www.meutimao.com.br/noticias-do-corinthians/529118/", title:"Comissão de Ética do Corinthians projeta nova data para oitiva de Andrés Sanchez" },
  { source:"Meu Timão",       color:"#1a7a3a", time:"18/03 · 09:31", url:"https://www.meutimao.com.br/noticias-do-corinthians/529108/", title:"Corinthians estuda encerrar gratuitidade de ingressos para conselheiros e assessores" },
  { source:"Meu Timão",       color:"#1a7a3a", time:"18/03 · 08:30", url:"https://www.meutimao.com.br/noticias-do-corinthians/529098/", title:"Funcionárias do Corinthians denunciam casos de assédio no PSJ e Arena; clube deve afastar acusados" },
  { source:"Tudo Timão",      color:"#c8a84b", time:"17/03 · 22:31", url:"https://www.tudotimao.com.br/", title:"Memphis ultrapassa ídolo e entra no top-3 de artilheiros do Corinthians no Brasileirão da década" },
  { source:"Meu Timão",       color:"#1a7a3a", time:"17/03 · 21:32", url:"https://www.meutimao.com.br/noticias-do-corinthians/529088/", title:"Torcedor completa mil jogos do Corinthians em estádios e recebe homenagem do clube" },
  { source:"Meu Timão",       color:"#1a7a3a", time:"17/03 · 20:31", url:"https://www.meutimao.com.br/noticias-do-corinthians/529078/", title:"Atacante do Corinthians atinge sua maior minutagem em quase quatro meses" },
  { source:"Meu Timão",       color:"#1a7a3a", time:"17/03 · 19:30", url:"https://www.meutimao.com.br/noticias-do-corinthians/529068/", title:"Torcida do Corinthians esgota ingressos de visitante para duelo contra a Chapecoense" },
  { source:"Lance!",          color:"#FF6B00", time:"17/03 · 18:31", url:"https://www.lance.com.br/corinthians/", title:"Com baixa, Dorival comanda treino de olho na Chapecoense" },
  { source:"Lance!",          color:"#FF6B00", time:"17/03 · 04:00", url:"https://www.lance.com.br/corinthians/", title:"Kaio César agrada Dorival e pode ganhar sequência no Corinthians" },
  { source:"Lance!",          color:"#FF6B00", time:"16/03 · 17:08", url:"https://www.lance.com.br/corinthians/", title:"Hugo Souza fora da Copa? Ancelotti explica ausência do goleiro do Corinthians na Seleção" },
  { source:"Gazeta Esportiva", color:"#E5820A", time:"16/03 · 18:00", url:"https://www.gazetaesportiva.com/times/corinthians/", title:"Corinthians demonstra interesse na contratação de Arthur Cabral, atacante do Botafogo" },
  { source:"Gazeta Esportiva", color:"#E5820A", time:"15/03 · 22:00", url:"https://www.gazetaesportiva.com/times/corinthians/", title:"Dorival avalia empate: 'Merecíamos vencer' — Timão há 5 jogos sem vitória no Brasileirão" },
  { source:"Gazeta Esportiva", color:"#E5820A", time:"15/03 · 20:30", url:"https://www.gazetaesportiva.com/times/corinthians/", title:"Memphis marca 1º gol em 2026, Gabigol empata e Corinthians fica no 1x1 com Santos na Vila" },
  { source:"Site Oficial",    color:"#c8a84b", time:"15/03 · 18:00", url:"https://www.corinthians.com.br/home/", title:"Na Vila Belmiro, Timão e Santos ficam no empate pelo Brasileirão 2026" },
  { source:"Bolavip",         color:"#0055A5", time:"15/03 · 17:30", url:"https://br.bolavip.com/corinthians/", title:"Memphis Depay lamenta empate: 'Tomamos o gol muito rápido, não foi suficiente'" },
];


const UPCOMING = [
  { id:1, date:"2026-03-19T21:30:00", status:"NS", home:"Chapecoense", homeId:0, away:"Corinthians", awayId:131, comp:"Brasileirão 2026", round:"Rodada 7", venue:"Arena Condá, Chapecó-SC" },
  { id:2, date:"2026-03-22T20:30:00", status:"NS", home:"Corinthians", homeId:131, away:"Flamengo", awayId:127, comp:"Brasileirão 2026", round:"Rodada 8", venue:"Neo Química Arena, São Paulo-SP" },
  { id:3, date:"2026-04-01T17:00:00", status:"NS", home:"Fluminense", homeId:211, away:"Corinthians", awayId:131, comp:"Brasileirão 2026", round:"Rodada 9", venue:"Maracanã, Rio de Janeiro-RJ" },
  { id:4, date:"2026-04-04T21:30:00", status:"NS", home:"Corinthians", homeId:131, away:"Internacional", awayId:119, comp:"Brasileirão 2026", round:"Rodada 10", venue:"Neo Química Arena, São Paulo-SP" },
  { id:5, date:"2026-04-11T20:30:00", status:"NS", home:"Corinthians", homeId:131, away:"Palmeiras", awayId:121, comp:"Brasileirão 2026", round:"Rodada 11", venue:"Neo Química Arena, São Paulo-SP" },
  { id:6, date:"2026-04-18T16:00:00", status:"NS", home:"Vitória", homeId:1, away:"Corinthians", awayId:131, comp:"Brasileirão 2026", round:"Rodada 12", venue:"Estádio Manoel Barradas, Salvador-BA" },
];

const RESULTS = [
  { id:10, date:"2026-03-15T16:00:00", status:"FT", home:"Santos", homeId:118, away:"Corinthians", awayId:131, homeScore:1, awayScore:1,
    comp:"Brasileirão 2026", round:"Rodada 6", venue:"Vila Belmiro, Santos-SP",
    stats:{
      homePoss:52, awayPoss:48, homeShots:14, awayShots:11, homeShotsOn:5, awayShotsOn:4,
      homeFouls:10, awayFouls:12, homeCorners:6, awayCorners:4, homeYellow:4, awayYellow:2,
      homeRed:1, awayRed:0,
      events:[
        {min:17, type:"goal",  team:"away", player:"Memphis Depay",   assist:"Kaio César",     detail:"Contra-ataque, drible e finalização no canto"},
        {min:19, type:"goal",  team:"home", player:"Gabriel Barbosa", assist:"Neymar",          detail:"Erro de Gabriel Paulista na saída de bola"},
        {min:32, type:"card",  team:"home", player:"Álvaro Barreal",  assist:"",               detail:"Cartão Amarelo"},
        {min:44, type:"card",  team:"away", player:"Kaio César",      assist:"",               detail:"Cartão Amarelo"},
        {min:57, type:"card",  team:"home", player:"Rollheiser",      assist:"",               detail:"Cartão Amarelo"},
        {min:62, type:"card",  team:"away", player:"Gustavo Henrique",assist:"",               detail:"Cartão Amarelo"},
        {min:71, type:"card",  team:"home", player:"Rony",            assist:"",               detail:"Cartão Amarelo"},
        {min:75, type:"card",  team:"home", player:"Luan Peres",      assist:"",               detail:"2º Amarelo — Expulsão"},
      ],
      lineupHome:"Gabriel Brazão; Zé Ivaldo, Frías e Luan Peres; Oliva, Bontempo, G.Henrique, Rony e Barreal; Neymar e Gabigol. T: Gastón Liendo",
      lineupAway:"Hugo Souza; Matheuzinho, Gabriel Paulista, G.Henrique e Bidu; Raniele, André e Carrillo; Breno Bidon; Memphis e Kaio César. T: Dorival Júnior",
    }
  },
  { id:11, date:"2026-03-11T21:30:00", status:"FT", home:"Corinthians", homeId:131, away:"Coritiba", awayId:181, homeScore:0, awayScore:2,
    comp:"Brasileirão 2026", round:"Rodada 5", venue:"Neo Química Arena, São Paulo-SP",
    stats:{
      homePoss:55, awayPoss:45, homeShots:13, awayShots:9, homeShotsOn:3, awayShotsOn:5,
      homeFouls:12, awayFouls:14, homeCorners:7, awayCorners:3, homeYellow:2, awayYellow:3,
      homeRed:0, awayRed:0,
      events:[
        {min:38, type:"goal", team:"away", player:"Léo Gamalho",  assist:"Natanael", detail:"Cabeçada após cruzamento"},
        {min:82, type:"goal", team:"away", player:"Robson",       assist:"",         detail:"Contra-ataque finalizado"},
      ],
    }
  },
  { id:12, date:"2026-03-08T16:00:00", status:"FT", home:"Corinthians", homeId:131, away:"Bahia", awayId:157, homeScore:1, awayScore:2,
    comp:"Brasileirão 2026", round:"Rodada 4", venue:"Neo Química Arena, São Paulo-SP",
    stats:{
      homePoss:46, awayPoss:54, homeShots:10, awayShots:15, homeShotsOn:3, awayShotsOn:7,
      homeFouls:13, awayFouls:11, homeCorners:4, awayCorners:6, homeYellow:2, awayYellow:2,
      homeRed:0, awayRed:0,
      events:[
        {min:25, type:"goal", team:"away", player:"Everaldo",     assist:"Cauly",        detail:"Finalização dentro da área"},
        {min:54, type:"goal", team:"home", player:"Breno Bidon",  assist:"Rodrigo Garro",detail:"Chute de longa distância"},
        {min:77, type:"goal", team:"away", player:"Biel",         assist:"",             detail:"Contra-ataque"},
      ],
    }
  },
  { id:13, date:"2026-02-28T20:30:00", status:"FT", home:"Novorizontino", homeId:799, away:"Corinthians", awayId:131, homeScore:1, awayScore:0,
    comp:"Paulistão 2026", round:"Semifinal", venue:"Jorge Ismael de Biasi, Novo Horizonte-SP",
    stats:{
      homePoss:43, awayPoss:57, homeShots:9, awayShots:16, homeShotsOn:3, awayShotsOn:5,
      homeFouls:14, awayFouls:12, homeCorners:3, awayCorners:8, homeYellow:2, awayYellow:1,
      homeRed:0, awayRed:0,
      events:[
        {min:61, type:"goal", team:"home", player:"Waguininho", assist:"", detail:"Gol contra eliminatório"},
      ],
    }
  },
  { id:14, date:"2026-02-25T20:00:00", status:"FT", home:"Cruzeiro", homeId:128, away:"Corinthians", awayId:131, homeScore:1, awayScore:1,
    comp:"Brasileirão 2026", round:"Rodada 3", venue:"Mineirão, Belo Horizonte-MG",
    stats:{
      homePoss:50, awayPoss:50, homeShots:12, awayShots:11, homeShotsOn:4, awayShotsOn:3,
      homeFouls:11, awayFouls:13, homeCorners:5, awayCorners:4, homeYellow:1, awayYellow:2,
      homeRed:0, awayRed:0,
      events:[
        {min:35, type:"goal", team:"home", player:"Kaio Jorge",  assist:"",             detail:"Cabeçada em escanteio"},
        {min:69, type:"goal", team:"away", player:"André",       assist:"Memphis Depay", detail:"Finalização dentro da área"},
      ],
    }
  },
  { id:15, date:"2026-02-22T20:30:00", status:"FT", home:"Portuguesa", homeId:802, away:"Corinthians", awayId:131, homeScore:1, awayScore:1,
    comp:"Paulistão 2026", round:"Quartas de Final", venue:"Canindé, São Paulo-SP",
    stats:{
      homePoss:40, awayPoss:60, homeShots:8, awayShots:18, homeShotsOn:2, awayShotsOn:6,
      homeFouls:15, awayFouls:9, homeCorners:2, awayCorners:9, homeYellow:3, awayYellow:1,
      homeRed:0, awayRed:0,
      events:[
        {min:23, type:"goal", team:"home", player:"Ítalo",    assist:"",         detail:"Chute colocado"},
        {min:71, type:"goal", team:"away", player:"Vitinho",  assist:"Matheuzinho",detail:"Passe em profundidade e finalização"},
      ],
    }
  },
  { id:16, date:"2026-02-19T19:30:00", status:"FT", home:"Athletico-PR", homeId:126, away:"Corinthians", awayId:131, homeScore:0, awayScore:1,
    comp:"Brasileirão 2026", round:"Rodada 2", venue:"Arena da Baixada, Curitiba-PR",
    stats:{
      homePoss:47, awayPoss:53, homeShots:11, awayShots:13, homeShotsOn:3, awayShotsOn:4,
      homeFouls:15, awayFouls:10, homeCorners:4, awayCorners:5, homeYellow:2, awayYellow:2,
      homeRed:0, awayRed:0,
      events:[
        {min:53, type:"goal", team:"away", player:"Yuri Alberto", assist:"André Carrillo", detail:"Passe em profundidade e chute cruzado"},
      ],
    }
  },
  { id:17, date:"2026-02-15T20:30:00", status:"FT", home:"São Bernardo", homeId:900, away:"Corinthians", awayId:131, homeScore:0, awayScore:1,
    comp:"Paulistão 2026", round:"Fase de Liga", venue:"Primeiro de Maio, São Bernardo-SP",
    stats:{
      homePoss:37, awayPoss:63, homeShots:6, awayShots:19, homeShotsOn:1, awayShotsOn:5,
      homeFouls:12, awayFouls:9, homeCorners:2, awayCorners:10, homeYellow:2, awayYellow:1,
      homeRed:0, awayRed:0,
      events:[
        {min:42, type:"goal", team:"away", player:"Yuri Alberto", assist:"Rodrigo Garro", detail:"Dri e finalização no canto"},
      ],
    }
  },
  { id:18, date:"2026-02-12T20:00:00", status:"FT", home:"Corinthians", homeId:131, away:"RB Bragantino", awayId:145, homeScore:1, awayScore:3,
    comp:"Brasileirão 2026", round:"Rodada 1", venue:"Neo Química Arena, São Paulo-SP",
    stats:{
      homePoss:44, awayPoss:56, homeShots:10, awayShots:17, homeShotsOn:3, awayShotsOn:9,
      homeFouls:12, awayFouls:13, homeCorners:3, awayCorners:7, homeYellow:1, awayYellow:2,
      homeRed:0, awayRed:0,
      events:[
        {min:19, type:"goal", team:"away", player:"Eduardo Sasha", assist:"",         detail:"Chute de primeira na área"},
        {min:44, type:"goal", team:"away", player:"Jhon Jhon",     assist:"",         detail:"Finalização de longa distância"},
        {min:60, type:"goal", team:"home", player:"Gabriel Paulista",assist:"Garro",  detail:"Cabeçada em escanteio"},
        {min:84, type:"goal", team:"away", player:"Helinho",        assist:"",        detail:"Contra-ataque"},
      ],
    }
  },
  { id:19, date:"2026-01-25T16:00:00", status:"FT", home:"Flamengo", homeId:127, away:"Corinthians", awayId:131, homeScore:0, awayScore:2,
    comp:"Supercopa Rei 2026", round:"Final", venue:"Maracanã, Rio de Janeiro-RJ",
    stats:{
      homePoss:58, awayPoss:42, homeShots:15, awayShots:9, homeShotsOn:4, awayShotsOn:5,
      homeFouls:13, awayFouls:15, homeCorners:8, awayCorners:3, homeYellow:2, awayYellow:3,
      homeRed:0, awayRed:0,
      events:[
        {min:36, type:"goal", team:"away", player:"Yuri Alberto",    assist:"Memphis Depay", detail:"Contra-ataque com assistência perfeita"},
        {min:76, type:"goal", team:"away", player:"Gabriel Paulista", assist:"Raniele",      detail:"Cabeçada em escanteio"},
      ],
    }
  },
];


const SQUAD = {
  Goleiros: [
    { num:1,  name:"Hugo Souza",        pos:"GL",     age:24, nat:"🇧🇷", apps:8,  goals:0, assists:0 },
    { num:32, name:"Matheus Donelli",   pos:"GL",     age:21, nat:"🇧🇷", apps:0,  goals:0, assists:0 },
    { num:40, name:"Felipe Longo",      pos:"GL",     age:18, nat:"🇧🇷", apps:1,  goals:0, assists:0 },
    { num:51, name:"Kauê Camargo",      pos:"GL",     age:20, nat:"🇧🇷", apps:0,  goals:0, assists:0 },
  ],
  Zagueiros: [
    { num:3,  name:"Gabriel Paulista",  pos:"ZAG",    age:35, nat:"🇧🇷", apps:9,  goals:2, assists:0 },
    { num:5,  name:"André Ramalho",     pos:"ZAG",    age:31, nat:"🇧🇷", apps:6,  goals:1, assists:0 },
    { num:13, name:"Gustavo Henrique",  pos:"ZAG",    age:30, nat:"🇧🇷", apps:9,  goals:1, assists:0 },
    { num:25, name:"Cacá",              pos:"ZAG",    age:24, nat:"🇧🇷", apps:1,  goals:0, assists:0 },
    { num:47, name:"João Pedro",        pos:"ZAG",    age:22, nat:"🇧🇷", apps:0,  goals:0, assists:0 },
    { num:59, name:"Jacaré",            pos:"ZAG",    age:19, nat:"🇧🇷", apps:0,  goals:0, assists:0 },
  ],
  Laterais: [
    { num:2,  name:"Matheuzinho",       pos:"LD",     age:23, nat:"🇧🇷", apps:9,  goals:0, assists:0 },
    { num:20, name:"Pedro Milans",      pos:"LD",     age:23, nat:"🇺🇾", apps:2,  goals:0, assists:0 },
    { num:21, name:"Matheus Bidu",      pos:"LE",     age:24, nat:"🇧🇷", apps:9,  goals:1, assists:0 },
    { num:26, name:"Angileri",          pos:"LE",     age:31, nat:"🇦🇷", apps:1,  goals:0, assists:0 },
    { num:46, name:"Hugo",              pos:"LE",     age:26, nat:"🇧🇷", apps:3,  goals:0, assists:0 },
  ],
  "Meio-campo": [
    { num:7,  name:"Breno Bidon",       pos:"VOL",    age:20, nat:"🇧🇷", apps:8,  goals:2, assists:0 },
    { num:8,  name:"Rodrigo Garro",     pos:"MEI",    age:28, nat:"🇦🇷", apps:7,  goals:0, assists:2 },
    { num:14, name:"Raniele",           pos:"VOL",    age:29, nat:"🇧🇷", apps:8,  goals:0, assists:0 },
    { num:19, name:"André Carrillo",    pos:"MEI",    age:34, nat:"🇵🇪", apps:12, goals:0, assists:0 },
    { num:23, name:"Matheus Pereira",   pos:"MEI",    age:27, nat:"🇧🇷", apps:7,  goals:0, assists:0 },
    { num:29, name:"Allan",             pos:"VOL",    age:28, nat:"🇧🇷", apps:2,  goals:0, assists:0 },
    { num:35, name:"Charles",           pos:"VOL",    age:29, nat:"🇧🇷", apps:6,  goals:0, assists:0 },
    { num:48, name:"Guilherme Amorim",  pos:"MEI",    age:18, nat:"🇧🇷", apps:0,  goals:0, assists:0 },
    { num:49, name:"André",             pos:"VOL",    age:19, nat:"🇧🇷", apps:8,  goals:2, assists:0 },
    { num:52, name:"Labyad",            pos:"MEI/AT", age:32, nat:"🇲🇦", apps:3,  goals:0, assists:0 },
    { num:54, name:"Luiz Gustavo",      pos:"VOL",    age:20, nat:"🇧🇷", apps:1,  goals:0, assists:0 },
    { num:61, name:"Dieguinho",         pos:"PE",     age:18, nat:"🇧🇷", apps:5,  goals:1, assists:1 },
    { num:70, name:"José Martínez",     pos:"VOL",    age:31, nat:"🇻🇪", apps:12, goals:0, assists:1 },
    { num:77, name:"Jesse Lingard",     pos:"MEI/AT", age:33, nat:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", apps:2,  goals:0, assists:0 },
  ],
  Atacantes: [
    { num:9,  name:"Yuri Alberto",      pos:"CA",     age:25, nat:"🇧🇷", apps:9,  goals:3, assists:0 },
    { num:10, name:"Memphis Depay",     pos:"CA",     age:31, nat:"🇳🇱", apps:6,  goals:1, assists:1 },
    { num:11, name:"Vitinho",           pos:"PE",     age:32, nat:"🇧🇷", apps:9,  goals:1, assists:0 },
    { num:18, name:"Pedro Raul",        pos:"CA",     age:29, nat:"🇧🇷", apps:8,  goals:0, assists:1 },
    { num:31, name:"Kayke",             pos:"PE",     age:21, nat:"🇧🇷", apps:5,  goals:1, assists:1 },
    { num:56, name:"Gui Negão",         pos:"CA",     age:18, nat:"🇧🇷", apps:6,  goals:1, assists:0 },
  ],
};

const STANDINGS = {
  "Brasileirão 2026": [
    {pos:1,team:"São Paulo",pts:16,g:6,w:5,d:1,l:0,gf:14,ga:5,gd:"+9"},
    {pos:2,team:"Palmeiras",pts:13,g:6,w:4,d:1,l:1,gf:9,ga:4,gd:"+5"},
    {pos:3,team:"Fluminense",pts:13,g:6,w:4,d:1,l:1,gf:12,ga:7,gd:"+5"},
    {pos:4,team:"Bahia",pts:11,g:6,w:3,d:2,l:1,gf:7,ga:4,gd:"+3"},
    {pos:5,team:"Flamengo",pts:10,g:6,w:3,d:1,l:2,gf:11,ga:6,gd:"+5"},
    {pos:6,team:"Coritiba",pts:10,g:6,w:3,d:1,l:2,gf:6,ga:5,gd:"+1"},
    {pos:7,team:"Grêmio",pts:8,g:6,w:2,d:2,l:2,gf:6,ga:7,gd:"-1"},
    {pos:8,team:"Corinthians",pts:8,g:6,w:2,d:2,l:2,gf:6,ga:7,gd:"-1"},
    {pos:9,team:"Vitória",pts:7,g:6,w:2,d:1,l:3,gf:6,ga:7,gd:"-1"},
    {pos:10,team:"RB Bragantino",pts:7,g:6,w:2,d:1,l:3,gf:6,ga:8,gd:"-2"},
    {pos:11,team:"Athletico-PR",pts:7,g:6,w:2,d:1,l:3,gf:6,ga:9,gd:"-3"},
    {pos:12,team:"Chapecoense",pts:7,g:6,w:2,d:1,l:3,gf:5,ga:7,gd:"-2"},
    {pos:13,team:"Mirassol",pts:6,g:6,w:1,d:3,l:2,gf:5,ga:7,gd:"-2"},
    {pos:14,team:"Santos",pts:6,g:6,w:1,d:3,l:2,gf:6,ga:9,gd:"-3"},
    {pos:15,team:"Atlético-MG",pts:4,g:6,w:1,d:1,l:4,gf:5,ga:10,gd:"-5"},
    {pos:16,team:"Vasco",pts:4,g:6,w:1,d:1,l:4,gf:7,ga:11,gd:"-4"},
    {pos:17,team:"Cruzeiro",pts:3,g:6,w:0,d:3,l:3,gf:7,ga:11,gd:"-4"},
    {pos:18,team:"Botafogo",pts:2,g:6,w:0,d:2,l:4,gf:2,ga:10,gd:"-8"},
    {pos:19,team:"Remo",pts:2,g:6,w:0,d:2,l:4,gf:3,ga:9,gd:"-6"},
    {pos:20,team:"Internacional",pts:2,g:6,w:0,d:2,l:4,gf:3,ga:10,gd:"-7"},
  ]
};

const HIGHLIGHTS = [
  { id:"santos1x1",    title:"Santos 1x1 Corinthians | Brasileirão R6 | Golaço de Memphis Depay", date:"15/03/2026", opponent:"Santos",       url:"https://www.meutimao.com.br/videos-do-corinthians/" },
  { id:"cor0x2cori",   title:"Corinthians 0x2 Coritiba | Brasileirão R5 | Melhores Momentos",     date:"11/03/2026", opponent:"Coritiba",      url:"https://www.meutimao.com.br/videos-do-corinthians/" },
  { id:"cor1x2bahia",  title:"Corinthians 1x2 Bahia | Brasileirão R4 | Melhores Momentos",        date:"08/03/2026", opponent:"Bahia",         url:"https://www.meutimao.com.br/videos-do-corinthians/" },
  { id:"portuguesa",   title:"Portuguesa 1x1 Corinthians | Quartas Paulistão 2026 | Gol de Vitinho",date:"22/02/2026",opponent:"Portuguesa",   url:"https://www.meutimao.com.br/videos-do-corinthians/" },
  { id:"athletico",    title:"Athletico-PR 0x1 Corinthians | Brasileirão R2 | Gol de Yuri Alberto", date:"19/02/2026",opponent:"Athletico-PR", url:"https://www.meutimao.com.br/videos-do-corinthians/" },
  { id:"sbernardo",    title:"São Bernardo 0x1 Corinthians | Paulistão 2026 | Gol de Yuri Alberto", date:"15/02/2026",opponent:"São Bernardo", url:"https://www.meutimao.com.br/videos-do-corinthians/" },
  { id:"flamengo",     title:"Flamengo 0x2 Corinthians | Supercopa Rei 2026 | CAMPEÃO!",           date:"25/01/2026", opponent:"Flamengo",     url:"https://www.meutimao.com.br/videos-do-corinthians/" },
];


// ── HELPERS ──────────────────────────────────────────────
function fmtDate(iso){const d=new Date(iso);return`${d.getDate().toString().padStart(2,"0")}/${(d.getMonth()+1).toString().padStart(2,"0")}/${d.getFullYear()}`}
function fmtTime(iso){const d=new Date(iso);return`${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`}
function isCori(id){return id===131}

// ── CSS ───────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Open+Sans:wght@400;500;600&display=swap');
:root{--bg:#080808;--bg2:#111;--bg3:#1a1a1a;--border:#252525;--text:#f0f0f0;--sub:#777;--muted:#444;--gold:#c8a84b;--red:#cc0000;}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:var(--bg);color:var(--text);font-family:'Open Sans',sans-serif;min-height:100vh}
::-webkit-scrollbar{width:3px;height:3px}::-webkit-scrollbar-thumb{background:var(--gold)}
.topnav{position:sticky;top:0;z-index:100;background:var(--bg);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 14px;height:58px;gap:0}
.nav-logo{width:40px;height:40px;margin-right:16px;flex-shrink:0}
.nav-tabs{display:flex;gap:0;overflow-x:auto;flex:1;scrollbar-width:none}
.nav-tabs::-webkit-scrollbar{display:none}
.nt{font-family:'Montserrat',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:0 14px;height:58px;display:flex;align-items:center;border:none;background:transparent;color:var(--sub);cursor:pointer;border-bottom:3px solid transparent;margin-bottom:-1px;white-space:nowrap;transition:all .2s}
.nt:hover{color:var(--text)}.nt.on{color:var(--gold);border-bottom-color:var(--gold)}
.live-pill{margin-left:auto;display:flex;align-items:center;gap:5px;background:var(--red);color:#fff;border:none;cursor:pointer;font-family:'Montserrat',sans-serif;font-size:.65rem;font-weight:800;letter-spacing:2px;padding:5px 10px;border-radius:3px;flex-shrink:0;animation:pulse 2s infinite}
.ldot{width:6px;height:6px;background:#fff;border-radius:50%;animation:blink 1s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.8}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.1}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.page{padding:0 14px 80px;max-width:900px;margin:0 auto;animation:fadeIn .25s ease}
.ph{padding:20px 0 14px}.pt{font-family:'Montserrat',sans-serif;font-size:1.8rem;font-weight:900;text-transform:uppercase;line-height:1.1;margin-bottom:5px}
.ps{font-size:.68rem;color:var(--sub);letter-spacing:2px;text-transform:uppercase}
.gc{background:var(--bg2);border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:10px;transition:border-color .2s}
.gc:hover{border-color:var(--muted)}
.gc-hdr{display:flex;align-items:center;justify-content:space-between;padding:8px 14px;border-bottom:1px solid var(--border);background:rgba(255,255,255,.02)}
.gc-comp{font-size:.67rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--gold);display:flex;align-items:center;gap:6px}
.gc-dt{font-size:.67rem;color:var(--sub)}
.gc-body{padding:14px;display:flex;align-items:center;gap:8px}
.gc-team{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px}
.tbadge{width:44px;height:44px;border-radius:50%;background:var(--bg3);border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;font-family:'Montserrat',sans-serif;font-size:.72rem;font-weight:800;color:var(--text);letter-spacing:.5px}
.tbadge.cb{border-color:var(--gold);color:var(--gold)}
.tname{font-family:'Montserrat',sans-serif;font-size:.8rem;font-weight:800;text-transform:uppercase;text-align:center;letter-spacing:.3px}
.tname.cn{color:#fff}
.gc-mid{text-align:center;min-width:76px}
.score{font-family:'Montserrat',sans-serif;font-size:1.8rem;font-weight:900;color:#fff;letter-spacing:2px;line-height:1}
.vs{font-family:'Montserrat',sans-serif;font-size:.82rem;font-weight:700;color:var(--muted);letter-spacing:2px}
.gc-time{font-size:.68rem;color:var(--gold);font-weight:700;letter-spacing:1px;margin-top:3px}
.gc-venue{padding:0 14px 10px;font-size:.65rem;color:var(--sub);display:flex;align-items:center;gap:4px}
.filter-row{display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap}
.fb{background:transparent;border:1px solid var(--border);color:var(--sub);padding:5px 15px;border-radius:20px;font-family:'Montserrat',sans-serif;font-size:.7rem;font-weight:700;cursor:pointer;transition:all .2s;letter-spacing:.5px}
.fb:hover{border-color:var(--gold);color:var(--gold)}.fb.on{background:var(--gold);color:#000;border-color:var(--gold)}
.news-list{display:flex;flex-direction:column;gap:8px}
.ni{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:13px 14px;display:flex;gap:10px;cursor:pointer;transition:all .2s;text-decoration:none}
.ni:hover{border-color:var(--muted);background:var(--bg3)}
.ndot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:5px}
.ncont{flex:1;min-width:0}
.nsrc{font-size:.6rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:3px;font-family:'Montserrat',sans-serif}
.ntitle{font-size:.88rem;font-weight:600;color:var(--text);line-height:1.4;margin-bottom:3px}
.ntime{font-size:.63rem;color:var(--sub)}
.hl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px}
.hlc{background:var(--bg2);border:1px solid var(--border);border-radius:10px;overflow:hidden;cursor:pointer;transition:all .2s;text-decoration:none;display:block}
.hlc:hover{border-color:var(--gold);transform:translateY(-2px)}
.hl-thumb{width:100%;aspect-ratio:16/9;background:linear-gradient(135deg,#1a1a1a,#0a0a0a);position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden}
.hl-score{font-family:'Montserrat',sans-serif;font-size:1.5rem;font-weight:900;color:var(--gold);letter-spacing:2px}
.hl-play{position:absolute;width:44px;height:44px;border-radius:50%;background:rgba(200,168,75,.9);display:flex;align-items:center;justify-content:center;font-size:1.1rem;padding-left:3px}
.hl-info{padding:10px 12px}
.hl-title{font-size:.8rem;font-weight:600;line-height:1.4;margin-bottom:3px;color:var(--text)}
.hl-meta{font-size:.63rem;color:var(--sub)}
.pos-group{margin-bottom:18px}
.plbl{font-family:'Montserrat',sans-serif;font-size:.62rem;font-weight:800;letter-spacing:3px;color:var(--gold);text-transform:uppercase;padding-bottom:5px;border-bottom:1px solid var(--border);margin-bottom:8px}
.sq-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(136px,1fr));gap:8px}
.pc{background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center;transition:all .2s}
.pc:hover{border-color:var(--gold);transform:translateY(-2px)}
.pnum{font-family:'Montserrat',sans-serif;font-size:1.75rem;font-weight:900;color:var(--gold);line-height:1;margin-bottom:2px}
.pname{font-family:'Montserrat',sans-serif;font-weight:700;font-size:.78rem;margin-bottom:2px;line-height:1.2}
.pinfo{font-size:.6rem;color:var(--sub);text-transform:uppercase;letter-spacing:.5px}
.pst{margin-top:7px;display:flex;justify-content:space-around;border-top:1px solid var(--border);padding-top:7px}
.psi{text-align:center}.psv{font-family:'Montserrat',sans-serif;font-size:.95rem;font-weight:800;color:var(--gold);line-height:1}
.psl{font-size:.53rem;color:var(--sub);text-transform:uppercase;letter-spacing:.5px}
.ctabs{display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap}
.ct{background:transparent;border:1px solid var(--border);color:var(--sub);padding:5px 14px;border-radius:20px;font-family:'Montserrat',sans-serif;font-size:.7rem;font-weight:700;cursor:pointer;transition:all .2s;letter-spacing:.5px}
.ct.on{background:var(--gold);color:#000;border-color:var(--gold)}
.tbl-wrap{background:var(--bg2);border:1px solid var(--border);border-radius:10px;overflow:hidden;overflow-x:auto}
.tbl{width:100%;border-collapse:collapse;font-size:.8rem}
.tbl th{font-family:'Montserrat',sans-serif;font-weight:800;font-size:.58rem;letter-spacing:2px;text-transform:uppercase;color:var(--gold);padding:10px 10px;text-align:left;border-bottom:1px solid var(--border);white-space:nowrap}
.tbl td{padding:7px 10px;border-bottom:1px solid #131313;white-space:nowrap}
.tbl tr:last-child td{border-bottom:none}
.tbl tr:hover td{background:rgba(255,255,255,.02)}
.tbl tr.hi td{background:rgba(200,168,75,.06)}
.tbl tr.hi td:first-child{border-left:3px solid var(--gold)}
.posn{font-family:'Montserrat',sans-serif;font-weight:700;color:var(--sub);font-size:.72rem}
.tnm{font-weight:600}.pts{font-family:'Montserrat',sans-serif;font-size:.9rem;font-weight:900;color:var(--gold)}
.chat-wrap{display:flex;flex-direction:column;gap:8px;min-height:280px;max-height:420px;overflow-y:auto;padding:12px;background:var(--bg2);border-radius:10px;margin-bottom:10px}
.msg{max-width:85%;padding:9px 13px;border-radius:8px;font-size:.84rem;line-height:1.5;white-space:pre-wrap}
.msg.user{background:var(--gold);color:#000;font-weight:600;align-self:flex-end}
.msg.assistant{background:var(--bg3);color:var(--text);align-self:flex-start;border-left:3px solid var(--gold)}
.msg.loading{background:var(--bg3);color:var(--sub);align-self:flex-start;font-style:italic}
.ci-row{display:flex;gap:8px}
.ci{flex:1;background:var(--bg2);border:1px solid var(--border);color:var(--text);padding:10px 13px;border-radius:8px;font-family:'Open Sans',sans-serif;font-size:.84rem;outline:none;transition:border-color .2s}
.ci:focus{border-color:var(--gold)}.ci::placeholder{color:var(--sub)}
.send{background:var(--gold);color:#000;border:none;padding:10px 18px;border-radius:8px;font-family:'Montserrat',sans-serif;font-weight:800;font-size:.73rem;cursor:pointer;transition:background .2s;letter-spacing:.5px}
.send:hover{background:#e4c96a}.send:disabled{opacity:.5;cursor:not-allowed}
.chips{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px}
.chip{background:transparent;border:1px solid var(--border);color:var(--sub);padding:4px 11px;border-radius:16px;font-size:.7rem;cursor:pointer;transition:all .2s}
.chip:hover{border-color:var(--gold);color:var(--gold)}
.squad-src{font-size:.62rem;color:var(--sub);text-align:right;margin-bottom:8px}
.modal-overlay{position:fixed;top:0!important;left:0!important;right:0!important;bottom:0!important;width:100vw!important;height:100vh!important;background:rgba(0,0,0,.93);z-index:99999!important;display:flex;align-items:flex-end;justify-content:center;padding:0;touch-action:none;isolation:isolate}
.modal-box{background:#111;border:1px solid #333;border-top:3px solid var(--gold);border-radius:14px 14px 0 0;width:100%;max-width:600px;height:85vh;overflow-y:auto;padding-bottom:40px;-webkit-overflow-scrolling:touch;position:relative;z-index:100000}
.modal-hdr{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--border);position:sticky;top:0;background:var(--bg2);z-index:1}
.modal-title{font-family:'Montserrat',sans-serif;font-weight:900;font-size:.9rem;text-transform:uppercase;letter-spacing:1px}
.modal-close{background:none;border:1px solid var(--border);color:var(--sub);width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:.9rem;display:flex;align-items:center;justify-content:center}
.modal-score{text-align:center;padding:16px;border-bottom:1px solid var(--border)}
.modal-score-teams{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8px;margin-bottom:6px}
.mst-name{font-family:'Montserrat',sans-serif;font-weight:900;font-size:.95rem;text-transform:uppercase}
.mst-name.l{text-align:right}.mst-name.r{text-align:left}
.mst-name.cori{color:#fff}
.modal-scoreline{font-family:'Montserrat',sans-serif;font-size:2.2rem;font-weight:900;letter-spacing:4px;color:#fff}
.modal-venue{font-size:.65rem;color:var(--sub)}
.modal-section{padding:12px 16px}
.modal-section-title{font-family:'Montserrat',sans-serif;font-size:.65rem;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:var(--gold);margin-bottom:10px}
.ev-item{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;background:var(--bg3);margin-bottom:6px;border-left:3px solid var(--gold)}
.ev-min{font-family:'Montserrat',sans-serif;font-size:.85rem;font-weight:900;color:var(--gold);min-width:28px}
.ev-ico{font-size:1rem;min-width:18px}
.ev-txt{font-size:.82rem;font-weight:600;flex:1}
.ev-team{font-size:.6rem;color:var(--sub);text-align:right}
.stat-row-m{display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;margin-bottom:8px}
.sv-l{font-family:'Montserrat',sans-serif;font-weight:800;font-size:.85rem;text-align:right}
.sv-r{font-family:'Montserrat',sans-serif;font-weight:800;font-size:.85rem;text-align:left}
.slbl-m{font-size:.6rem;text-align:center;color:var(--sub);letter-spacing:1px;text-transform:uppercase;white-space:nowrap}
.bar-row{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;gap:2px;height:3px;margin-top:-4px;margin-bottom:4px}
.bar-l{background:var(--border);overflow:hidden;display:flex;justify-content:flex-end}
.bar-r{background:var(--border);overflow:hidden}
.fill-l{background:var(--gold);height:100%}.fill-r{background:var(--muted);height:100%}
.gc.clickable{cursor:pointer}

@media(max-width:560px){.sq-grid{grid-template-columns:repeat(auto-fill,minmax(118px,1fr))}.hl-grid{grid-template-columns:1fr}.score{font-size:1.5rem}}
`;

function Crest({s=40}) {
  return (
    <div style={{
      width:s, height:s, borderRadius:"50%",
      background:"#0a0a0a", border:"2px solid #c8a84b",
      display:"flex", alignItems:"center", justifyContent:"center",
      flexShrink:0,
    }}>
      <span style={{
        fontFamily:"serif", fontWeight:"bold",
        fontSize: s*0.28+"px",
        color:"#c8a84b", letterSpacing:"0.5px",
        userSelect:"none",
      }}>SCCP</span>
    </div>
  );
}


function GameCard({g}) {
  const [expanded, setExpanded] = useState(false);
  const isDone = g.status === "FT";
  const ch = isCori(g.homeId), ca = isCori(g.awayId);
  const hasStats = isDone && g.stats;
  const st = g.stats;

  const toN = v => v == null ? 0 : parseFloat(String(v).replace("%","")) || 0;

  return (
    <div className="gc" style={{marginBottom:10}}>
      {/* Card header */}
      <div className="gc-hdr">
        <div className="gc-comp">🏆 {g.comp}{g.round ? ` · ${g.round}` : ""}</div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {hasStats && (
            <button onClick={()=>setExpanded(e=>!e)} style={{background:"none",border:"none",color:"var(--gold)",fontFamily:"'Montserrat',sans-serif",fontSize:".62rem",fontWeight:800,letterSpacing:"1px",cursor:"pointer",padding:"2px 6px"}}>
              {expanded ? "FECHAR ✕" : "STATS ›"}
            </button>
          )}
          <div className="gc-dt">📅 {fmtDate(g.date)}</div>
        </div>
      </div>

      {/* Scoreline */}
      <div className="gc-body">
        <div className="gc-team">
          <div className={`tbadge${ch?" cb":""}`}>{g.home.substring(0,3).toUpperCase()}</div>
          <div className={`tname${ch?" cn":""}`}>{g.home}</div>
        </div>
        <div className="gc-mid">
          {isDone ? <div className="score">{g.homeScore} - {g.awayScore}</div> : <div className="vs">VS</div>}
          <div className="gc-time">{isDone ? "Encerrado" : fmtTime(g.date)}</div>
        </div>
        <div className="gc-team">
          <div className={`tbadge${ca?" cb":""}`}>{g.away.substring(0,3).toUpperCase()}</div>
          <div className={`tname${ca?" cn":""}`}>{g.away}</div>
        </div>
      </div>

      {g.venue && <div className="gc-venue">📍 {g.venue}</div>}

      {/* Inline stats panel */}
      {expanded && st && (
        <div style={{borderTop:"1px solid #2a2a2a",padding:"14px 14px 6px"}}>

          {/* Events */}
          {st.events?.length > 0 && (
            <div style={{marginBottom:14}}>
              <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:".62rem",fontWeight:800,letterSpacing:"3px",color:"var(--gold)",textTransform:"uppercase",marginBottom:8}}>Gols & Eventos</div>
              {st.events.map((ev,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 8px",borderRadius:6,background:"#1a1a1a",marginBottom:5,borderLeft:`3px solid ${ev.type==="goal"?"#c8a84b":ev.detail?.includes("Expulsão")?"#cc0000":"#eab308"}`}}>
                  <span style={{fontFamily:"'Montserrat',sans-serif",fontWeight:900,color:"var(--gold)",fontSize:".85rem",minWidth:28}}>{ev.min}'</span>
                  <span style={{fontSize:"1rem",minWidth:18}}>{ev.type==="goal"?"⚽":ev.detail?.includes("Expulsão")?"🟥":"🟨"}</span>
                  <span style={{flex:1,fontSize:".82rem",fontWeight:600}}>
                    {ev.player}
                    {ev.assist ? <span style={{color:"#666",fontWeight:400,fontSize:".74rem"}}> ({ev.assist})</span> : null}
                  </span>
                  <span style={{fontSize:".6rem",color:"#666",textAlign:"right"}}>{ev.team==="home"?g.home:g.away}</span>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          <div>
            <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:".62rem",fontWeight:800,letterSpacing:"3px",color:"var(--gold)",textTransform:"uppercase",marginBottom:8}}>Estatísticas</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:6,marginBottom:8}}>
              <div style={{fontFamily:"'Montserrat',sans-serif",fontWeight:900,fontSize:".8rem",textAlign:"right",color:ch?"#c8a84b":"#f0f0f0"}}>{g.home}</div>
              <div style={{fontSize:".55rem",color:"#666",alignSelf:"center"}}>vs</div>
              <div style={{fontFamily:"'Montserrat',sans-serif",fontWeight:900,fontSize:".8rem",textAlign:"left",color:ca?"#c8a84b":"#888"}}>{g.away}</div>
            </div>
            {[
              ["Posse de bola", st.homePoss+"%", st.awayPoss+"%", st.homePoss, st.awayPoss],
              ["Chutes totais",  st.homeShots,    st.awayShots,    st.homeShots, st.awayShots],
              ["Chutes no gol",  st.homeShotsOn,  st.awayShotsOn,  st.homeShotsOn, st.awayShotsOn],
              ["Escanteios",     st.homeCorners,  st.awayCorners,  st.homeCorners, st.awayCorners],
              ["Faltas",         st.homeFouls,    st.awayFouls,    st.homeFouls, st.awayFouls],
              ["Cartões amarelos",st.homeYellow,  st.awayYellow,   st.homeYellow, st.awayYellow],
              ["Cartões vermelhos",st.homeRed||0, st.awayRed||0,   st.homeRed||0, st.awayRed||0],
            ].map(([lbl,lv,rv,ln,rn])=>{
              const tot = (toN(ln)+toN(rn)) || 1;
              return (
                <div key={lbl} style={{marginBottom:7}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:6,alignItems:"center",marginBottom:2}}>
                    <div style={{fontFamily:"'Montserrat',sans-serif",fontWeight:800,fontSize:".82rem",textAlign:"right"}}>{lv}</div>
                    <div style={{fontSize:".58rem",textAlign:"center",color:"#666",letterSpacing:"1px",textTransform:"uppercase",whiteSpace:"nowrap"}}>{lbl}</div>
                    <div style={{fontFamily:"'Montserrat',sans-serif",fontWeight:800,fontSize:".82rem",textAlign:"left"}}>{rv}</div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:2,height:3}}>
                    <div style={{background:"#2a2a2a",borderRadius:2,overflow:"hidden",display:"flex",justifyContent:"flex-end"}}>
                      <div style={{background:"#c8a84b",height:"100%",width:`${(toN(ln)/tot)*100}%`,borderRadius:2}}/>
                    </div>
                    <div style={{background:"#2a2a2a",borderRadius:2,overflow:"hidden"}}>
                      <div style={{background:"#444",height:"100%",width:`${(toN(rn)/tot)*100}%`,borderRadius:2}}/>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


function App() {
  const [tab, setTab] = useState("noticias");
  const [gFilter, setGFilter] = useState("results");
  const [standComp] = useState("Brasileirão 2026");
  const [chat, setChat] = useState([{role:"assistant",content:`Olá, Wanderson! 🖤⚽\n\nSou seu assistente do Corinthians. Próximo jogo: Chapecoense x Timão amanhã (19/03) às 21h30 na Arena Condá!\n\nPergunte qualquer coisa sobre o Timão.`}]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Use live data if available, fallback to static
  const liveNews = LIVE_DATA?.news?.length ? LIVE_DATA.news : NEWS;
  const liveUpcoming = LIVE_DATA?.upcoming?.length ? LIVE_DATA.upcoming.map(g => ({...g, status: g.status || 'NS'})) : UPCOMING;
  const liveResults = LIVE_DATA?.results?.length ? LIVE_DATA.results : RESULTS;
  const liveStandings = LIVE_DATA?.standings?.length ? LIVE_DATA.standings : null;
  const lastUpdated = LIVE_DATA?.updatedAt ? new Date(LIVE_DATA.updatedAt).toLocaleString('pt-BR', {day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}) : null;

  const displayGames = gFilter==="results" ? liveResults : gFilter==="upcoming" ? liveUpcoming : [...liveResults,...liveUpcoming];

  const sendChat = useCallback(async (msg) => {
    if(!msg.trim()) return;
    const userMsg = {role:"user",content:msg};
    const newHist = [...chat, userMsg];
    setChat([...newHist,{role:"assistant",content:"✍️ Digitando...",loading:true}]);
    setChatInput(""); setChatLoading(true);
    try {
      const reply = await askAssistant(newHist);
      setChat([...newHist,{role:"assistant",content:reply}]);
    } catch {
      setChat([...newHist,{role:"assistant",content:"Erro ao conectar. Tente novamente! 🖤"}]);
    }
    setChatLoading(false);
  }, [chat]);

  const TABS = [["noticias","Notícias"],["jogos","Jogos"],["tabela","Tabela"],["elenco","Elenco"],["momentos","Momentos"]];

  return (
    <>
      <style>{CSS}</style>
      <nav className="topnav">
        <Crest s={40}/>
        <div className="nav-tabs">
          {TABS.map(([id,lbl])=>(
            <button key={id} className={`nt${tab===id?" on":""}`} onClick={()=>setTab(id)}>{lbl}</button>
          ))}
        </div>
      </nav>

      {tab==="noticias" && (
        <div className="page">
          <div className="ph">
            <div className="pt">Notícias do<br/>Corinthians</div>
            
          </div>
          <div className="news-list">
            {liveNews.map((n,i)=>(
              <a key={i} className="ni" href={n.url} target="_blank" rel="noopener noreferrer">
                <div className="ndot" style={{background:n.color}}/>
                <div className="ncont">
                  <div className="nsrc" style={{color:n.color}}>{n.source}</div>
                  <div className="ntitle">{n.title}</div>
                  <div className="ntime">{n.time}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {tab==="jogos" && (
        <div className="page">
          <div className="ph"><div className="pt">Jogos</div><div className="ps">Agenda e resultados · Brasileirão 2026</div></div>
          <div className="filter-row">
            {[["results","Resultados"],["upcoming","Próximos"],["all","Todos"]].map(([id,lbl])=>(
              <button key={id} className={`fb${gFilter===id?" on":""}`} onClick={()=>setGFilter(id)}>{lbl}</button>
            ))}
          </div>
          {displayGames.map(g=><GameCard key={g.id} g={g}/>)}
        </div>
      )}

      {tab==="tabela" && (
        <div className="page">
          <div className="ph"><div className="pt">Classificação</div><div className="ps">Posição do Timão · Após 6ª rodada</div></div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>#</th><th>Clube</th><th>PTS</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th></tr></thead>
              <tbody>
                {STANDINGS[standComp].map(r=>(
                  <tr key={r.pos} className={r.team==="Corinthians"?"hi":""}>
                    <td><span className="posn">{r.pos}</span></td>
                    <td><span className="tnm">{r.team==="Corinthians"?"🖤 "+r.team:r.team}</span></td>
                    <td><span className="pts">{r.pts}</span></td>
                    <td>{r.g}</td><td>{r.w}</td><td>{r.d}</td><td>{r.l}</td><td>{r.gf}</td><td>{r.ga}</td><td>{r.gd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab==="elenco" && (
        <div className="page">
          <div className="ph"><div className="pt">Elenco 2026</div><div className="ps">Plantel profissional · Técnico: Dorival Júnior</div></div>
          <div className="squad-src">Fonte: Transfermarkt / ESPN · 18/03/2026</div>
          {Object.entries(SQUAD).map(([pos,players])=>(
            <div key={pos} className="pos-group">
              <div className="plbl">{pos}</div>
              <div className="sq-grid">
                {players.map(p=>(
                  <div key={p.num} className="pc">
                    <div className="pnum">{p.num}</div>
                    <div className="pname">{p.name}</div>
                    <div className="pinfo">{p.nat} · {p.pos} · {p.age}a</div>
                    <div className="pst">
                      <div className="psi"><div className="psv">{p.apps}</div><div className="psl">Jogos</div></div>
                      <div className="psi"><div className="psv">{p.goals}</div><div className="psl">Gols</div></div>
                      <div className="psi"><div className="psv">{p.assists}</div><div className="psl">Assist</div></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==="momentos" && (
        <div className="page">
          <div className="ph"><div className="pt">Melhores<br/>Momentos</div><div className="ps">Gols e lances · Temporada 2026</div></div>
          <div className="hl-grid">
            {HIGHLIGHTS.map((h,i)=>(
              <a key={i} className="hlc" href={h.url} target="_blank" rel="noopener noreferrer">
                <div className="hl-thumb">
                  <div className="hl-score">⚽</div>
                  <div className="hl-play">▶</div>
                </div>
                <div className="hl-info">
                  <div className="hl-title">{h.title}</div>
                  <div className="hl-meta">🗓 {h.date} · vs {h.opponent}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {tab==="assistente" && (
        <div className="page">
          <div className="ph"><div className="pt">Assistente</div><div className="ps">Wanderson · Corinthians · Pergunte tudo</div></div>
          <div className="chips">
            {["Próximo jogo","Artilheiros 2026","Escalação vs Chapecoense","Memphis Depay","Yuri Alberto","Títulos do Corinthians","Dorival Júnior"].map(q=>(
              <button key={q} className="chip" onClick={()=>sendChat(q)}>{q}</button>
            ))}
          </div>
          <div className="chat-wrap">
            {chat.map((m,i)=>(
              <div key={i} className={`msg ${m.loading?"loading":m.role}`}>{m.content}</div>
            ))}
          </div>
          <div className="ci-row">
            <input className="ci" value={chatInput} onChange={e=>setChatInput(e.target.value)}
              placeholder="Pergunte sobre o Timão..." disabled={chatLoading}
              onKeyDown={e=>e.key==="Enter"&&!chatLoading&&sendChat(chatInput)}/>
            <button className="send" onClick={()=>sendChat(chatInput)} disabled={chatLoading||!chatInput.trim()}>ENVIAR</button>
          </div>
        </div>
      )}
    </>
  );
}
