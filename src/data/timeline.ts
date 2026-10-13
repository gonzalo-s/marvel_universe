import type { TimelineData } from '../types/timeline';

// TMDB-ready: import once with a server-side token to populate IDs and poster URLs.
// Themes are curated display choices. No API secrets or invented image URLs.
export const timeline = {
  "rows": [
    {
      "id": 0,
      "name": "Historia principal",
      "description": "Continuidad principal. Incluye los eventos terrestres y cósmicos; regiones diferentes no implican universos separados."
    },
    {
      "id": 1,
      "name": "Rama de Loki",
      "description": "Recorrido alternativo originado por el escape de Loki en Nueva York."
    },
    {
      "id": 2,
      "name": "TVA",
      "description": "Recorrido fuera del tiempo. El año 2012 es solo un ancla visual junto al escape de Loki."
    },
    {
      "id": 3,
      "name": "1970 · contexto visitado",
      "description": "Contexto del pasado visitado en Endgame. La fila no afirma una bifurcación o un universo independiente."
    },
    {
      "id": 4,
      "name": "2013 · contexto visitado",
      "description": "Contexto de Asgard visitado en Endgame. La fila no afirma una bifurcación o un universo independiente."
    },
    {
      "id": 5,
      "name": "2014 · contexto visitado",
      "description": "Incluye Morag y Vormir en el contexto visitado en Endgame; no se representan como universos independientes."
    },
    {
      "id": 6,
      "name": "2012 · intervención de los viajeros",
      "description": "Contexto visitado en Endgame, antes del escape de Loki. No es por sí mismo una bifurcación confirmada; esa relación se representa en la conexión branch."
    },
    {
      "id": 7,
      "name": "Continuidad de Deadpool",
      "description": "Contexto alternativo de Deadpool & Wolverine. No deriva de la fila principal; sus viajes también pasan por ámbitos fuera del tiempo."
    },
    {
      "id": 8,
      "name": "Universo de los Fantastic Four",
      "description": "Mundo retrofuturista independiente, ambientado en la década de 1960. No es una rama originada por Captain America ni por otra película de la fila principal."
    }
  ],
  "nodes": [
    {
      "id": "capture",
      "kind": "event",
      "title": "Loki es capturado en Nueva York",
      "description": "Punto de referencia del pasado compartido; desde aquí el mapa compara el recorrido principal y la intervención mostrada en Endgame.",
      "workId": "avengers",
      "releaseYear": 2012,
      "position": {
        "year": 2012,
        "order": 100,
        "row": 0
      },
      "connections": [
        {
          "targetId": "avengers-reunion",
          "type": "sequence",
          "label": "Recorrido principal; no implica causalidad ni que las historias no se superpongan."
        }
      ],
      "theme": {
        "primary": "#58B879",
        "accent": "#DCC06C"
      }
    },
    {
      "id": "dark-world",
      "kind": "event",
      "title": "Loki: The Dark World",
      "description": "Continúa la historia de Loki tras Nueva York. El contexto de Asgard se vuelve a visitar en Endgame; compartir un contexto no es una transición entre estos dos nodos.",
      "workId": "thor-dark-world",
      "releaseYear": 2013,
      "position": {
        "year": 2013,
        "order": 100,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-iron-man-3",
          "type": "sequence",
          "label": "Recorrido principal; no implica causalidad ni que las historias no se superpongan."
        }
      ],
      "theme": {
        "primary": "#58B879",
        "accent": "#DCC06C"
      }
    },
    {
      "id": "ragnarok",
      "kind": "event",
      "title": "Loki: Ragnarok",
      "description": "Loki participa en la salida de Asgard y viaja con los supervivientes.",
      "workId": "thor-ragnarok",
      "releaseYear": 2017,
      "position": {
        "year": 2017,
        "order": 100,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-ant-man-wasp",
          "type": "sequence",
          "label": "Recorrido principal; no implica causalidad ni que las historias no se superpongan."
        }
      ],
      "theme": {
        "primary": "#58B879",
        "accent": "#DCC06C"
      }
    },
    {
      "id": "main-death",
      "kind": "event",
      "title": "Loki muere ante Thanos",
      "description": "El Loki principal muere durante el ataque inicial de Infinity War.",
      "workId": "infinity-war",
      "releaseYear": 2018,
      "position": {
        "year": 2018,
        "order": 200,
        "row": 0
      },
      "connections": [
        {
          "targetId": "gamora-death",
          "type": "sequence",
          "label": "Recorrido principal; no implica causalidad ni que las historias no se superpongan."
        }
      ],
      "theme": {
        "primary": "#58B879",
        "accent": "#DCC06C"
      }
    },
    {
      "id": "departure",
      "kind": "event",
      "title": "Endgame: partida desde 2023",
      "description": "Los Avengers emprenden la misión temporal; un equipo visita Nueva York en 2012.",
      "workId": "endgame",
      "releaseYear": 2019,
      "position": {
        "year": 2023,
        "order": 200,
        "row": 0
      },
      "connections": [
        {
          "targetId": "stones-ready",
          "type": "sequence",
          "label": "Recorrido principal; no implica causalidad ni que las historias no se superpongan."
        },
        {
          "targetId": "intervention",
          "type": "transition",
          "label": "Viaje temporal · 2023 → 2012"
        },
        {
          "targetId": "asgard-2013",
          "type": "transition",
          "label": "Viaje temporal · 2023 → 2013"
        },
        {
          "targetId": "morag-2014",
          "type": "transition",
          "label": "Viaje temporal · 2023 → 2014"
        },
        {
          "targetId": "vormir-2014",
          "type": "transition",
          "label": "Viaje temporal · 2023 → 2014"
        }
      ]
    },
    {
      "id": "intervention",
      "kind": "event",
      "title": "Los viajeros intervienen en 2012",
      "description": "Los viajeros de 2023 intervienen en Nueva York y la misión del Teseracto sale mal. Este nodo representa la intervención; el escape de Loki marca la bifurcación posterior.",
      "workId": "endgame",
      "releaseYear": 2019,
      "position": {
        "year": 2012,
        "order": 200,
        "row": 6
      },
      "connections": [
        {
          "targetId": "escape",
          "type": "branch",
          "label": "La intervención permite el escape de Loki y origina el recorrido alternativo."
        },
        {
          "targetId": "camp-1970",
          "type": "transition",
          "label": "Viaje temporal · 2012 → 1970"
        }
      ]
    },
    {
      "id": "escape",
      "kind": "event",
      "title": "Loki toma el Tesseract y escapa",
      "description": "Punto de divergencia que la TVA atribuye a la huida de Loki. También representado en: Loki.",
      "workId": "endgame",
      "releaseYear": 2019,
      "position": {
        "year": 2012,
        "order": 300,
        "row": 1
      },
      "connections": [
        {
          "targetId": "gobi",
          "type": "transition",
          "label": "Traslado espacial · Portal del Tesseract"
        }
      ],
      "theme": {
        "primary": "#58B879",
        "accent": "#DCC06C"
      }
    },
    {
      "id": "gobi",
      "kind": "event",
      "title": "Loki llega al desierto de Gobi",
      "description": "El Tesseract lo lleva a otra ubicación, no a otro año.",
      "workId": "loki-s1",
      "releaseYear": 2021,
      "position": {
        "year": 2012,
        "order": 400,
        "row": 1
      },
      "connections": [
        {
          "targetId": "arrest",
          "type": "sequence",
          "label": "Continuación narrativa · Arresto"
        }
      ],
      "theme": {
        "primary": "#58B879",
        "accent": "#DCC06C"
      }
    },
    {
      "id": "arrest",
      "kind": "event",
      "title": "La TVA detiene a Loki",
      "description": "Hunter B-15 y su equipo arrestan a la variante.",
      "workId": "loki-s1",
      "releaseYear": 2021,
      "position": {
        "year": 2012,
        "order": 500,
        "row": 1
      },
      "connections": [
        {
          "targetId": "reset",
          "type": "sequence",
          "label": "Precedencia temporal · La TVA interviene sobre la rama"
        },
        {
          "targetId": "tva-arrival",
          "type": "transition",
          "label": "Traslado fuera del tiempo · Traslado por la TVA"
        }
      ],
      "theme": {
        "primary": "#58B879",
        "accent": "#DCC06C"
      }
    },
    {
      "id": "reset",
      "kind": "event",
      "title": "La TVA resetea la rama",
      "description": "El equipo interviene sobre la rama. Este caso termina aquí su representación de esa línea.",
      "workId": "loki-s1",
      "releaseYear": 2021,
      "position": {
        "year": 2012,
        "order": 600,
        "row": 1
      },
      "connections": [],
      "theme": {
        "primary": "#58B879",
        "accent": "#DCC06C"
      }
    },
    {
      "id": "tva-arrival",
      "kind": "event",
      "title": "La variante llega a la TVA",
      "description": "Loki queda fuera del calendario terrestre. El mapa no fija su llegada respecto de los años de la línea principal. Fuera del calendario: position.year=2012 se usa solamente para ubicar este evento junto a su origen narrativo.",
      "workId": "loki-s1",
      "releaseYear": 2021,
      "position": {
        "year": 2012,
        "order": 600,
        "row": 2
      },
      "connections": [],
      "theme": {
        "primary": "#58B879",
        "accent": "#DCC06C"
      }
    },
    {
      "id": "film-event-first-avenger",
      "kind": "work",
      "title": "Captain America: The First Avenger",
      "description": "Steve recibe el suero y combate a HYDRA durante la guerra. Fecha aproximada de la historia: 1943–1945. position.year=1943 es una referencia visual, no una fecha exacta.",
      "workId": "first-avenger",
      "releaseYear": 2011,
      "position": {
        "year": 1943,
        "order": 100,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-captain-marvel",
          "type": "sequence",
          "label": "Orden de lectura dentro de esta continuidad; no implica causalidad ni que sus historias no se superpongan."
        }
      ],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#285EA8",
        "accent": "#E04C4C"
      }
    },
    {
      "id": "film-event-captain-marvel",
      "kind": "work",
      "title": "Captain Marvel",
      "description": "Carol descubre su pasado y enfrenta el conflicto Kree/Skrull.",
      "workId": "captain-marvel",
      "releaseYear": 2019,
      "position": {
        "year": 1995,
        "order": 100,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-iron-man",
          "type": "sequence",
          "label": "Orden de lectura dentro de esta continuidad; no implica causalidad ni que sus historias no se superpongan."
        }
      ],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#D7443E",
        "accent": "#F4C95D"
      }
    },
    {
      "id": "film-event-iron-man",
      "kind": "work",
      "title": "Iron Man",
      "description": "Tony construye su armadura y revela su identidad. Fecha aproximada de la historia: 2008–2010. position.year=2008 es una referencia visual, no una fecha exacta.",
      "workId": "iron-man",
      "releaseYear": 2008,
      "position": {
        "year": 2008,
        "order": 100,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-iron-man-2",
          "type": "sequence",
          "label": "Orden de lectura dentro de esta continuidad; no implica causalidad ni que sus historias no se superpongan."
        }
      ],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#C83C35",
        "accent": "#E8BC58"
      }
    },
    {
      "id": "film-event-iron-man-2",
      "kind": "work",
      "title": "Iron Man 2",
      "description": "Tony enfrenta a Vanko durante la etapa conocida como Fury’s Big Week. Fecha aproximada de la historia: 2010–2011. position.year=2010 es una referencia visual, no una fecha exacta.",
      "workId": "iron-man-2",
      "releaseYear": 2010,
      "position": {
        "year": 2010,
        "order": 100,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-incredible-hulk",
          "type": "sequence",
          "label": "Orden de lectura dentro de la misma continuidad; las historias se superponen durante Fury’s Big Week."
        }
      ],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#C83C35",
        "accent": "#E8BC58"
      }
    },
    {
      "id": "film-event-incredible-hulk",
      "kind": "work",
      "title": "The Incredible Hulk",
      "description": "Bruce enfrenta a Abomination; su historia se superpone con Iron Man 2 y Thor. Fecha aproximada de la historia: 2010–2011. position.year=2010 es una referencia visual, no una fecha exacta.",
      "workId": "incredible-hulk",
      "releaseYear": 2008,
      "position": {
        "year": 2010,
        "order": 200,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-thor",
          "type": "sequence",
          "label": "Orden de lectura dentro de la misma continuidad; las historias se superponen durante Fury’s Big Week."
        }
      ],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#66BC55",
        "accent": "#A97AD8"
      }
    },
    {
      "id": "film-event-thor",
      "kind": "work",
      "title": "Thor",
      "description": "Thor es desterrado a la Tierra. Fecha aproximada de la historia: 2010–2011. position.year=2010 es una referencia visual, no una fecha exacta.",
      "workId": "thor",
      "releaseYear": 2011,
      "position": {
        "year": 2010,
        "order": 300,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-avengers",
          "type": "sequence",
          "label": "Orden de lectura dentro de esta continuidad; no implica causalidad ni que sus historias no se superpongan."
        },
        {
          "targetId": "capture",
          "type": "sequence",
          "label": "Recorrido principal; no implica causalidad ni que las historias no se superpongan."
        }
      ],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#66B8EC",
        "accent": "#E3D9CD"
      }
    },
    {
      "id": "film-event-iron-man-3",
      "kind": "work",
      "title": "Iron Man 3",
      "description": "Tony enfrenta a Killian tras la batalla de Nueva York; la fecha ha variado entre cronologías. Fecha aproximada de la historia: 2012–2013. position.year=2013 es una referencia visual, no una fecha exacta. El ancla visual se ubica después de Thor: The Dark World para respetar el orden de recorrido de Marvel/Disney+.",
      "workId": "iron-man-3",
      "releaseYear": 2013,
      "position": {
        "year": 2013,
        "order": 300,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-winter-soldier",
          "type": "sequence",
          "label": "Orden de lectura dentro de esta continuidad; no implica causalidad ni que sus historias no se superpongan."
        }
      ],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#C83C35",
        "accent": "#E8BC58"
      }
    },
    {
      "id": "film-event-winter-soldier",
      "kind": "work",
      "title": "Captain America: The Winter Soldier",
      "description": "Steve y Natasha descubren la infiltración de HYDRA en S.H.I.E.L.D.",
      "workId": "winter-soldier",
      "releaseYear": 2014,
      "position": {
        "year": 2014,
        "order": 100,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-guardians",
          "type": "sequence",
          "label": "Orden de lectura dentro de esta continuidad; no implica causalidad ni que sus historias no se superpongan."
        }
      ],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#4D83BC",
        "accent": "#BCC9D6"
      }
    },
    {
      "id": "film-event-guardians",
      "kind": "work",
      "title": "Guardians of the Galaxy",
      "description": "Se forma el equipo y se disputa la Gema del Poder. El contexto de Morag se vuelve a visitar en Endgame; esa comparación no es un viaje del equipo de Guardians hacia los viajeros.",
      "workId": "guardians",
      "releaseYear": 2014,
      "position": {
        "year": 2014,
        "order": 400,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-guardians-2",
          "type": "sequence",
          "label": "Orden de lectura dentro de esta continuidad; no implica causalidad ni que sus historias no se superpongan."
        }
      ],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#9858CD",
        "accent": "#EDB958"
      }
    },
    {
      "id": "film-event-guardians-2",
      "kind": "work",
      "title": "Guardians of the Galaxy Vol. 2",
      "description": "El equipo enfrenta a Ego poco después de su formación.",
      "workId": "guardians-2",
      "releaseYear": 2017,
      "position": {
        "year": 2014,
        "order": 600,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-age-ultron",
          "type": "sequence",
          "label": "Orden de lectura dentro de esta continuidad; no implica causalidad ni que sus historias no se superpongan."
        }
      ],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#DE6198",
        "accent": "#65D5E6"
      }
    },
    {
      "id": "film-event-age-ultron",
      "kind": "work",
      "title": "Avengers: Age of Ultron",
      "description": "Los Avengers combaten a Ultron y aparece Vision.",
      "workId": "age-ultron",
      "releaseYear": 2015,
      "position": {
        "year": 2015,
        "order": 100,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-ant-man",
          "type": "sequence",
          "label": "Orden de lectura dentro de esta continuidad; no implica causalidad ni que sus historias no se superpongan."
        }
      ],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#CD4848",
        "accent": "#BCC6D0"
      }
    },
    {
      "id": "film-event-ant-man",
      "kind": "work",
      "title": "Ant-Man",
      "description": "Scott aprende a usar el traje de Ant-Man.",
      "workId": "ant-man",
      "releaseYear": 2015,
      "position": {
        "year": 2015,
        "order": 200,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-civil-war",
          "type": "sequence",
          "label": "Orden de lectura dentro de esta continuidad; no implica causalidad ni que sus historias no se superpongan."
        }
      ],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#D74545",
        "accent": "#B9C3D1"
      }
    },
    {
      "id": "film-event-civil-war",
      "kind": "work",
      "title": "Captain America: Civil War",
      "description": "Los Acuerdos de Sokovia y el conflicto por Bucky dividen al equipo.",
      "workId": "civil-war",
      "releaseYear": 2016,
      "position": {
        "year": 2016,
        "order": 100,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-black-widow",
          "type": "sequence",
          "label": "Orden de lectura dentro de esta continuidad; no implica causalidad ni que sus historias no se superpongan."
        }
      ],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#557FA9",
        "accent": "#D85A57"
      }
    },
    {
      "id": "film-event-black-widow",
      "kind": "work",
      "title": "Black Widow",
      "description": "Natasha enfrenta a la Red Room después de Civil War. El poscrédito posterior a Endgame queda fuera de este resumen.",
      "workId": "black-widow",
      "releaseYear": 2021,
      "position": {
        "year": 2016,
        "order": 200,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-black-panther",
          "type": "sequence",
          "label": "Orden de lectura dentro de esta continuidad; no implica causalidad ni que sus historias no se superpongan."
        }
      ],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#D44B46",
        "accent": "#D4DCE5"
      }
    },
    {
      "id": "film-event-black-panther",
      "kind": "work",
      "title": "Black Panther",
      "description": "T’Challa enfrenta a Killmonger tras los sucesos de Civil War.",
      "workId": "black-panther",
      "releaseYear": 2018,
      "position": {
        "year": 2016,
        "order": 300,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-homecoming",
          "type": "sequence",
          "label": "Orden de lectura dentro de esta continuidad; no implica causalidad ni que sus historias no se superpongan."
        }
      ],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#A16AE0",
        "accent": "#C4C9D2"
      }
    },
    {
      "id": "film-event-homecoming",
      "kind": "work",
      "title": "Spider-Man: Homecoming",
      "description": "Peter enfrenta a Vulture después de participar en Civil War.",
      "workId": "homecoming",
      "releaseYear": 2017,
      "position": {
        "year": 2016,
        "order": 400,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-doctor-strange",
          "type": "sequence",
          "label": "Orden de lectura dentro de esta continuidad; no implica causalidad ni que sus historias no se superpongan."
        }
      ],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#E04E45",
        "accent": "#5E9FE2"
      }
    },
    {
      "id": "film-event-doctor-strange",
      "kind": "work",
      "title": "Doctor Strange",
      "description": "Stephen se forma como hechicero; su historia abarca un período prolongado. Fecha aproximada de la historia: 2016–2017. position.year=2016 es una referencia visual, no una fecha exacta.",
      "workId": "doctor-strange",
      "releaseYear": 2016,
      "position": {
        "year": 2016,
        "order": 500,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-thor-ragnarok",
          "type": "sequence",
          "label": "Orden de lectura dentro de esta continuidad; no implica causalidad ni que sus historias no se superpongan."
        },
        {
          "targetId": "ragnarok",
          "type": "sequence",
          "label": "Recorrido principal; no implica causalidad ni que las historias no se superpongan."
        }
      ],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#D77448",
        "accent": "#6ABEB1"
      }
    },
    {
      "id": "film-event-ant-man-wasp",
      "kind": "work",
      "title": "Ant-Man and the Wasp",
      "description": "Scott y Hope rescatan a Janet antes del chasquido.",
      "workId": "ant-man-wasp",
      "releaseYear": 2018,
      "position": {
        "year": 2018,
        "order": 100,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-infinity-war",
          "type": "sequence",
          "label": "Orden de lectura dentro de esta continuidad; no implica causalidad ni que sus historias no se superpongan."
        },
        {
          "targetId": "main-death",
          "type": "sequence",
          "label": "Recorrido principal; no implica causalidad ni que las historias no se superpongan."
        }
      ],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#D84A47",
        "accent": "#EDC552"
      }
    },
    {
      "id": "film-event-far-from-home",
      "kind": "work",
      "title": "Spider-Man: Far From Home",
      "description": "Peter enfrenta a Mysterio después de Endgame.",
      "workId": "far-from-home",
      "releaseYear": 2019,
      "position": {
        "year": 2024,
        "order": 200,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-eternals",
          "type": "sequence",
          "label": "Orden de lectura dentro de esta continuidad; no implica causalidad ni que sus historias no se superpongan."
        }
      ],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#DF504B",
        "accent": "#61A8E5"
      }
    },
    {
      "id": "avengers-reunion",
      "kind": "event",
      "title": "Avengers se reúnen",
      "description": "La batalla y captura de Loki cierran la invasión.",
      "workId": "avengers",
      "releaseYear": 2012,
      "position": {
        "year": 2012,
        "order": 300,
        "row": 0
      },
      "connections": [
        {
          "targetId": "dark-world",
          "type": "sequence",
          "label": "Recorrido principal; no implica causalidad ni que las historias no se superpongan."
        }
      ]
    },
    {
      "id": "gamora-death",
      "kind": "event",
      "title": "Thanos sacrifica a Gamora",
      "description": "La Gamora principal muere en Vormir.",
      "workId": "infinity-war",
      "releaseYear": 2018,
      "position": {
        "year": 2018,
        "order": 300,
        "row": 0
      },
      "connections": [
        {
          "targetId": "snap",
          "type": "sequence",
          "label": "Recorrido principal; no implica causalidad ni que las historias no se superpongan."
        }
      ]
    },
    {
      "id": "snap",
      "kind": "event",
      "title": "Chasquido de Thanos",
      "description": "La mitad de los seres vivos desaparece. El chasquido coincide con el acontecimiento que deja a Scott atrapado; se representa mediante la descripción y el recorrido principal, sin una transición adicional.",
      "workId": "infinity-war",
      "releaseYear": 2018,
      "position": {
        "year": 2018,
        "order": 400,
        "row": 0
      },
      "connections": [
        {
          "targetId": "scott-trapped",
          "type": "sequence",
          "label": "Orden de presentación de eventos concurrentes: el chasquido deja a Scott atrapado. No afirma que sean dos momentos separados."
        }
      ]
    },
    {
      "id": "scott-trapped",
      "kind": "event",
      "title": "Scott queda en el Reino Cuántico",
      "description": "Los demás desaparecen durante el chasquido; Scott queda atrapado.",
      "workId": "ant-man-wasp",
      "releaseYear": 2018,
      "position": {
        "year": 2018,
        "order": 500,
        "row": 0
      },
      "connections": [
        {
          "targetId": "thanos-killed",
          "type": "sequence",
          "label": "Recorrido principal; no implica causalidad ni que las historias no se superpongan."
        }
      ]
    },
    {
      "id": "thanos-killed",
      "kind": "event",
      "title": "Thanos muere en 2018",
      "description": "Thor mata al Thanos que ya destruyó las gemas.",
      "workId": "endgame",
      "releaseYear": 2019,
      "position": {
        "year": 2018,
        "order": 600,
        "row": 0
      },
      "connections": [
        {
          "targetId": "scott-return",
          "type": "sequence",
          "label": "Recorrido principal; no implica causalidad ni que las historias no se superpongan."
        }
      ]
    },
    {
      "id": "scott-return",
      "kind": "event",
      "title": "Scott regresa en 2023",
      "description": "Su regreso permite proponer la misión temporal.",
      "workId": "endgame",
      "releaseYear": 2019,
      "position": {
        "year": 2023,
        "order": 100,
        "row": 0
      },
      "connections": [
        {
          "targetId": "departure",
          "type": "sequence",
          "label": "Scott regresa y propone la misión temporal; después el equipo parte hacia el pasado."
        }
      ]
    },
    {
      "id": "stones-ready",
      "kind": "event",
      "title": "Las gemas llegan a 2023",
      "description": "Los viajeros supervivientes reúnen las gemas recuperadas.",
      "workId": "endgame",
      "releaseYear": 2019,
      "position": {
        "year": 2023,
        "order": 300,
        "row": 0
      },
      "connections": [
        {
          "targetId": "hulk-snap",
          "type": "sequence",
          "label": "Recorrido principal; no implica causalidad ni que las historias no se superpongan."
        }
      ]
    },
    {
      "id": "hulk-snap",
      "kind": "event",
      "title": "Hulk recupera a los desaparecidos",
      "description": "Bruce revierte las desapariciones sin borrar los cinco años transcurridos.",
      "workId": "endgame",
      "releaseYear": 2019,
      "position": {
        "year": 2023,
        "order": 400,
        "row": 0
      },
      "connections": [
        {
          "targetId": "thanos-arrival",
          "type": "sequence",
          "label": "Recorrido principal; no implica causalidad ni que las historias no se superpongan."
        }
      ],
      "theme": {
        "primary": "#66BC55",
        "accent": "#A97AD8"
      }
    },
    {
      "id": "thanos-arrival",
      "kind": "event",
      "title": "Thanos de 2014 llega a 2023",
      "description": "La versión de 2014 llega con su ejército; no resucita al Thanos muerto.",
      "workId": "endgame",
      "releaseYear": 2019,
      "position": {
        "year": 2023,
        "order": 500,
        "row": 0
      },
      "connections": [
        {
          "targetId": "final-battle",
          "type": "sequence",
          "label": "Recorrido principal; no implica causalidad ni que las historias no se superpongan."
        }
      ]
    },
    {
      "id": "final-battle",
      "kind": "event",
      "title": "Batalla final de Endgame",
      "description": "Los héroes enfrentan al ejército de la versión de Thanos de 2014.",
      "workId": "endgame",
      "releaseYear": 2019,
      "position": {
        "year": 2023,
        "order": 600,
        "row": 0
      },
      "connections": [
        {
          "targetId": "tony-sacrifice",
          "type": "sequence",
          "label": "Recorrido principal; no implica causalidad ni que las historias no se superpongan."
        }
      ]
    },
    {
      "id": "tony-sacrifice",
      "kind": "event",
      "title": "Tony se sacrifica",
      "description": "Tony elimina a Thanos de 2014 y su ejército.",
      "workId": "endgame",
      "releaseYear": 2019,
      "position": {
        "year": 2023,
        "order": 700,
        "row": 0
      },
      "connections": [
        {
          "targetId": "return-mission",
          "type": "sequence",
          "label": "Recorrido principal; no implica causalidad ni que las historias no se superpongan."
        }
      ]
    },
    {
      "id": "return-mission",
      "kind": "event",
      "title": "Steve parte para devolver las gemas",
      "description": "Se muestra su partida; las entregas individuales quedan fuera de pantalla. Su vida con Peggy no se ubica en una rama confirmada en este archivo.",
      "workId": "endgame",
      "releaseYear": 2019,
      "position": {
        "year": 2023,
        "order": 800,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-far-from-home",
          "type": "sequence",
          "label": "Recorrido principal; no implica causalidad ni que las historias no se superpongan."
        }
      ]
    },
    {
      "id": "camp-1970",
      "kind": "event",
      "title": "Camp Lehigh, 1970",
      "description": "Tony y Steve recuperan el Tesseract y partículas Pym.",
      "workId": "endgame",
      "releaseYear": 2019,
      "position": {
        "year": 1970,
        "order": 100,
        "row": 3
      },
      "connections": [
        {
          "targetId": "stones-ready",
          "type": "transition",
          "label": "Viaje temporal · 1970 → 2023"
        }
      ]
    },
    {
      "id": "asgard-2013",
      "kind": "event",
      "title": "Asgard, 2013",
      "description": "Thor y Rocket recuperan la Gema de la Realidad y Mjolnir.",
      "workId": "endgame",
      "releaseYear": 2019,
      "position": {
        "year": 2013,
        "order": 200,
        "row": 4
      },
      "connections": [
        {
          "targetId": "stones-ready",
          "type": "transition",
          "label": "Viaje temporal · 2013 → 2023"
        }
      ]
    },
    {
      "id": "morag-2014",
      "kind": "event",
      "title": "Morag, 2014",
      "description": "Rhodey y Nebula recuperan la Gema del Poder antes de Quill.",
      "workId": "endgame",
      "releaseYear": 2019,
      "position": {
        "year": 2014,
        "order": 200,
        "row": 5
      },
      "connections": [
        {
          "targetId": "stones-ready",
          "type": "transition",
          "label": "Viaje temporal · Rhodey vuelve con la gema"
        },
        {
          "targetId": "thanos-discovers",
          "type": "sequence",
          "label": "Relación causal · Enlace entre las Nebulas"
        }
      ]
    },
    {
      "id": "vormir-2014",
      "kind": "event",
      "title": "Vormir, 2014",
      "description": "Natasha y Clint buscan la Gema del Alma.",
      "workId": "endgame",
      "releaseYear": 2019,
      "position": {
        "year": 2014,
        "order": 300,
        "row": 5
      },
      "connections": [
        {
          "targetId": "natasha-sacrifice",
          "type": "sequence",
          "label": "Continuación narrativa · Gema del Alma"
        }
      ]
    },
    {
      "id": "natasha-sacrifice",
      "kind": "event",
      "title": "Natasha se sacrifica",
      "description": "Clint obtiene la Gema del Alma.",
      "workId": "endgame",
      "releaseYear": 2019,
      "position": {
        "year": 2014,
        "order": 500,
        "row": 5
      },
      "connections": [
        {
          "targetId": "stones-ready",
          "type": "transition",
          "label": "Viaje temporal · Clint regresa; Natasha no"
        }
      ]
    },
    {
      "id": "thanos-discovers",
      "kind": "event",
      "title": "Thanos de 2014 descubre la misión",
      "description": "Los implantes de Nebula revelan el futuro a la versión de Thanos de 2014.",
      "workId": "endgame",
      "releaseYear": 2019,
      "position": {
        "year": 2014,
        "order": 700,
        "row": 5
      },
      "connections": [
        {
          "targetId": "thanos-departs",
          "type": "sequence",
          "label": "Continuación narrativa · Plan de Thanos"
        }
      ]
    },
    {
      "id": "thanos-departs",
      "kind": "event",
      "title": "Thanos de 2014 parte hacia 2023",
      "description": "Su ejército se traslada al presente de los viajeros.",
      "workId": "endgame",
      "releaseYear": 2019,
      "position": {
        "year": 2014,
        "order": 800,
        "row": 5
      },
      "connections": [
        {
          "targetId": "thanos-arrival",
          "type": "transition",
          "label": "Viaje temporal · 2014 → 2023"
        }
      ]
    },
    {
      "id": "film-event-avengers",
      "kind": "work",
      "title": "The Avengers",
      "description": "Los Avengers se reúnen para enfrentar la invasión de Nueva York. Resumen de la película; sus eventos específicos se conservan por separado.",
      "workId": "avengers",
      "releaseYear": 2012,
      "position": {
        "year": 2012,
        "order": 90,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-thor-dark-world",
          "type": "sequence",
          "label": "Orden de lectura dentro de esta continuidad; no implica causalidad ni que sus historias no se superpongan."
        },
        {
          "targetId": "capture",
          "type": "sequence",
          "label": "Explorar un evento de esta película; el nodo work resume la obra y no es un acontecimiento adicional."
        }
      ],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#438BCB",
        "accent": "#F1C85B"
      }
    },
    {
      "id": "film-event-thor-dark-world",
      "kind": "work",
      "title": "Thor: The Dark World",
      "description": "Thor y sus aliados enfrentan a Malekith y la amenaza del Éter. Incluye el recorrido de Loki, representado también como evento.",
      "workId": "thor-dark-world",
      "releaseYear": 2013,
      "position": {
        "year": 2013,
        "order": 90,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-iron-man-3",
          "type": "sequence",
          "label": "Orden de lectura dentro de esta continuidad; no implica causalidad ni que sus historias no se superpongan."
        },
        {
          "targetId": "dark-world",
          "type": "sequence",
          "label": "Explorar un evento de esta película; el nodo work resume la obra y no es un acontecimiento adicional."
        }
      ],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#536E9F",
        "accent": "#D8A052"
      }
    },
    {
      "id": "film-event-thor-ragnarok",
      "kind": "work",
      "title": "Thor: Ragnarok",
      "description": "Thor enfrenta a Hela y busca salvar al pueblo de Asgard. El segmento centrado en Loki se conserva como evento.",
      "workId": "thor-ragnarok",
      "releaseYear": 2017,
      "position": {
        "year": 2017,
        "order": 90,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-ant-man-wasp",
          "type": "sequence",
          "label": "Orden de lectura dentro de esta continuidad; no implica causalidad ni que sus historias no se superpongan."
        },
        {
          "targetId": "ragnarok",
          "type": "sequence",
          "label": "Explorar un evento de esta película; el nodo work resume la obra y no es un acontecimiento adicional."
        }
      ],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#23CDBD",
        "accent": "#F7C44A"
      }
    },
    {
      "id": "film-event-infinity-war",
      "kind": "work",
      "title": "Avengers: Infinity War",
      "description": "Thanos reúne las Gemas del Infinito. La película incluye historias concurrentes y el chasquido; sus eventos se muestran por separado.",
      "workId": "infinity-war",
      "releaseYear": 2018,
      "position": {
        "year": 2018,
        "order": 190,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-endgame",
          "type": "sequence",
          "label": "Orden de lectura dentro de esta continuidad; no implica causalidad ni que sus historias no se superpongan."
        },
        {
          "targetId": "main-death",
          "type": "sequence",
          "label": "Explorar un evento de esta película; el nodo work resume la obra y no es un acontecimiento adicional."
        }
      ],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#9A69CD",
        "accent": "#E9B957"
      }
    },
    {
      "id": "film-event-endgame",
      "kind": "work",
      "title": "Avengers: Endgame",
      "description": "Los Avengers buscan revertir el chasquido mediante viajes temporales. La historia comienza en 2018 y su tramo principal sucede en 2023; este es el ancla visual del resumen.",
      "workId": "endgame",
      "releaseYear": 2019,
      "position": {
        "year": 2023,
        "order": 90,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-shang-chi",
          "type": "sequence",
          "label": "Orden de lectura dentro de esta continuidad; no implica causalidad ni que sus historias no se superpongan."
        },
        {
          "targetId": "scott-return",
          "type": "sequence",
          "label": "Explorar un evento de esta película; el nodo work resume la obra y no es un acontecimiento adicional."
        }
      ],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#8E6DD1",
        "accent": "#E9C87A"
      }
    },
    {
      "id": "film-event-shang-chi",
      "kind": "work",
      "title": "Shang-Chi and the Legend of the Ten Rings",
      "description": "Shang-Chi enfrenta el legado de su padre y los Diez Anillos. Ancla visual de la historia principal después de Endgame; no es el año de estreno.",
      "workId": "shang-chi",
      "releaseYear": 2021,
      "position": {
        "year": 2024,
        "order": 100,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-far-from-home",
          "type": "sequence",
          "label": "Orden de lectura dentro de esta continuidad; no implica causalidad ni que sus historias no se superpongan."
        }
      ],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#D85543",
        "accent": "#EBC35C"
      }
    },
    {
      "id": "film-event-eternals",
      "kind": "work",
      "title": "Eternals",
      "description": "Los Eternos enfrentan la Emergencia. La película contiene episodios de miles de años; 2024 es la referencia visual de su tramo contemporáneo, no de todos sus eventos.",
      "workId": "eternals",
      "releaseYear": 2021,
      "position": {
        "year": 2024,
        "order": 300,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-no-way-home",
          "type": "sequence",
          "label": "Orden de lectura dentro de esta continuidad; no implica causalidad ni que sus historias no se superpongan."
        }
      ],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#D8B978",
        "accent": "#A9C9CF"
      }
    },
    {
      "id": "film-event-no-way-home",
      "kind": "work",
      "title": "Spider-Man: No Way Home",
      "description": "Peter pide ayuda a Doctor Strange y enfrenta visitantes de otros universos. Continúa desde Far From Home; el resumen permanece en la fila del mundo de Peter.",
      "workId": "no-way-home",
      "releaseYear": 2021,
      "position": {
        "year": 2024,
        "order": 400,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-multiverse-madness",
          "type": "sequence",
          "label": "Orden de lectura dentro de esta continuidad; no implica causalidad ni que sus historias no se superpongan."
        }
      ],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#DC504A",
        "accent": "#E8B45D"
      }
    },
    {
      "id": "film-event-multiverse-madness",
      "kind": "work",
      "title": "Doctor Strange in the Multiverse of Madness",
      "description": "Doctor Strange y América Chávez recorren otros universos. 2024 funciona como ancla del relato principal; el resumen no convierte todos esos universos en una sola continuidad.",
      "workId": "multiverse-madness",
      "releaseYear": 2022,
      "position": {
        "year": 2024,
        "order": 600,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-wakanda-forever",
          "type": "sequence",
          "label": "Orden de lectura dentro de esta continuidad; no implica causalidad ni que sus historias no se superpongan."
        }
      ],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#D04E56",
        "accent": "#B18BDD"
      }
    },
    {
      "id": "film-event-love-thunder",
      "kind": "work",
      "title": "Thor: Love and Thunder",
      "description": "Thor y Jane Foster enfrentan a Gorr. Ancla visual aproximada de la historia principal; el orden entre historias contemporáneas es editorial.",
      "workId": "love-thunder",
      "releaseYear": 2022,
      "position": {
        "year": 2025,
        "order": 200,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-quantumania",
          "type": "sequence",
          "label": "Orden de lectura dentro de esta continuidad; no implica causalidad ni que sus historias no se superpongan."
        }
      ],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#E876A6",
        "accent": "#81CBF3"
      }
    },
    {
      "id": "film-event-wakanda-forever",
      "kind": "work",
      "title": "Black Panther: Wakanda Forever",
      "description": "Wakanda afronta la pérdida de T’Challa y el conflicto con Talokan. Ancla visual aproximada; incluye un período de duelo que no se representa como una única fecha exacta.",
      "workId": "wakanda-forever",
      "releaseYear": 2022,
      "position": {
        "year": 2025,
        "order": 100,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-love-thunder",
          "type": "sequence",
          "label": "Orden de lectura dentro de esta continuidad; no implica causalidad ni que sus historias no se superpongan."
        }
      ],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#9865D1",
        "accent": "#5DC2CC"
      }
    },
    {
      "id": "film-event-quantumania",
      "kind": "work",
      "title": "Ant-Man and the Wasp: Quantumania",
      "description": "Scott y su familia son llevados al Reino Cuántico. 2026 es una referencia del contexto de partida; no asigna un calendario terrestre a todo el Reino Cuántico.",
      "workId": "quantumania",
      "releaseYear": 2023,
      "position": {
        "year": 2026,
        "order": 100,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-guardians-3",
          "type": "sequence",
          "label": "Orden de lectura dentro de esta continuidad; no implica causalidad ni que sus historias no se superpongan."
        }
      ],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#9B5BDC",
        "accent": "#63D4D9"
      }
    },
    {
      "id": "film-event-guardians-3",
      "kind": "work",
      "title": "Guardians of the Galaxy Vol. 3",
      "description": "Los Guardians buscan salvar a Rocket y enfrentan al Alto Evolucionador. Ancla visual aproximada de su presente; los recuerdos de Rocket pertenecen a otros momentos.",
      "workId": "guardians-3",
      "releaseYear": 2023,
      "position": {
        "year": 2026,
        "order": 200,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-the-marvels",
          "type": "sequence",
          "label": "Orden de lectura dentro de esta continuidad; no implica causalidad ni que sus historias no se superpongan."
        }
      ],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#DF9760",
        "accent": "#A96FE2"
      }
    },
    {
      "id": "film-event-the-marvels",
      "kind": "work",
      "title": "The Marvels",
      "description": "Carol Danvers, Monica Rambeau y Kamala Khan deben colaborar al quedar entrelazados sus poderes. Ancla visual aproximada; su colocación no demuestra separación estricta respecto de otras historias.",
      "workId": "the-marvels",
      "releaseYear": 2023,
      "position": {
        "year": 2026,
        "order": 300,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-brave-new-world",
          "type": "sequence",
          "label": "Orden de lectura dentro de esta continuidad; no implica causalidad ni que sus historias no se superpongan."
        }
      ],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#C84F65",
        "accent": "#85B4E7"
      }
    },
    {
      "id": "film-event-deadpool-wolverine",
      "kind": "work",
      "title": "Deadpool & Wolverine",
      "description": "Wade busca salvar su mundo con la ayuda de una variante de Wolverine. El contexto inicial pertenece a otra continuidad; la película visita la TVA y el Vacío. 2024 ancla el contexto inicial y no todos los viajes.",
      "workId": "deadpool-wolverine",
      "releaseYear": 2024,
      "position": {
        "year": 2024,
        "order": 500,
        "row": 7
      },
      "connections": [],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#CD4545",
        "accent": "#F1CA4F"
      }
    },
    {
      "id": "film-event-brave-new-world",
      "kind": "work",
      "title": "Captain America: Brave New World",
      "description": "Sam Wilson enfrenta una crisis política y al Red Hulk. Ancla visual aproximada de 2027; referencias entre fuentes sitúan el relato alrededor de 2026–2027.",
      "workId": "brave-new-world",
      "releaseYear": 2025,
      "position": {
        "year": 2027,
        "order": 100,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-thunderbolts",
          "type": "sequence",
          "label": "Orden de lectura dentro de esta continuidad; no implica causalidad ni que sus historias no se superpongan."
        }
      ],
      "tmdb": {
        "mediaType": "movie"
      },
      "theme": {
        "primary": "#4F88B9",
        "accent": "#D65A53"
      }
    },
    {
      "id": "film-event-thunderbolts",
      "kind": "work",
      "title": "Thunderbolts*",
      "description": "Un grupo de agentes y antihéroes enfrenta una amenaza ligada a Sentry. Ancla visual aproximada posterior a Brave New World; el epílogo y los créditos no se comprimen en una fecha exacta.",
      "workId": "thunderbolts",
      "releaseYear": 2025,
      "position": {
        "year": 2027,
        "order": 200,
        "row": 0
      },
      "connections": [
        {
          "targetId": "film-event-brand-new-day",
          "type": "sequence",
          "label": "Orden de lectura dentro de esta continuidad; no implica causalidad ni que sus historias no se superpongan."
        }
      ],
      "tmdb": {
        "mediaType": "movie",
        "id": 986056
      },
      "theme": {
        "primary": "#E0C35E",
        "accent": "#9DACB7"
      }
    },
    {
      "id": "film-event-fantastic-four-first-steps",
      "kind": "work",
      "title": "The Fantastic Four: First Steps",
      "description": "Los Fantastic Four enfrentan a Galactus en un mundo retrofuturista de la década de 1960, independiente de la continuidad principal. 1964 es un ancla visual de esa década, no una fecha exacta afirmada para todas las escenas.",
      "workId": "fantastic-four-first-steps",
      "releaseYear": 2025,
      "position": {
        "year": 1964,
        "order": 100,
        "row": 8
      },
      "connections": [],
      "tmdb": {
        "mediaType": "movie",
        "id": 617126
      },
      "theme": {
        "primary": "#63B8DB",
        "accent": "#F5B881"
      }
    },
    {
      "id": "film-event-brand-new-day",
      "kind": "work",
      "title": "Spider-Man: Brand New Day",
      "description": "Peter continúa su vida como Spider-Man después del hechizo que hizo olvidar su identidad. La sinopsis oficial sitúa el relato cuatro años después de No Way Home; 2028 es el ancla inferida a partir de 2024.",
      "workId": "brand-new-day",
      "releaseYear": 2026,
      "position": {
        "year": 2028,
        "order": 100,
        "row": 0
      },
      "connections": [],
      "tmdb": {
        "mediaType": "movie",
        "id": 969681
      },
      "theme": {
        "primary": "#DA4D48",
        "accent": "#60A3D8"
      }
    }
  ]
} satisfies TimelineData;
