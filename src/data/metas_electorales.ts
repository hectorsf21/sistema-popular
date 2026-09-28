export interface MetaMunicipio {
  municipio: string;
  registroElectoral: number;
  porAlcanzar: number;
}

export interface MetaParroquia {
  municipio: string;
  parroquia: string;
  registroElectoral: number;
  porAlcanzar: number;
}

// 1. MUNICIPIOS (IMAGEN 1)
export const METAS_MUNICIPIOS: MetaMunicipio[] = [
  { municipio: "MP. ESTEROS DE CAMAGUAN", registroElectoral: 20158, porAlcanzar: 8063 },
  { municipio: "MP. ORTIZ", registroElectoral: 17109, porAlcanzar: 6844 },
  { municipio: "MP.JUAN JOSE RONDON", registroElectoral: 25219, porAlcanzar: 10088 },
  { municipio: "MP. SAN JOSE DE GUARIBE", registroElectoral: 8926, porAlcanzar: 3570 },
  { municipio: "MP. JOSÉ FÉLIX RIBAS", registroElectoral: 29982, porAlcanzar: 11993 },
  { municipio: "MP. SANTA MARIA DE IPIRE", registroElectoral: 11671, porAlcanzar: 4668 },
  { municipio: "MP. SAN GERONIMO DE GUAYABAL", registroElectoral: 16545, porAlcanzar: 6618 },
  { municipio: "MP. FRANCISCO DE MIRANDA", registroElectoral: 103133, porAlcanzar: 41253 },
  { municipio: "MP. JULIÁN MELLADO", registroElectoral: 21663, porAlcanzar: 8665 },
  { municipio: "MP. JOSÉ TADEO MONAGAS", registroElectoral: 55256, porAlcanzar: 22102 },
  { municipio: "MP. CHAGUARAMAS", registroElectoral: 11261, porAlcanzar: 4504 },
  { municipio: "MP. LEONARDO INFANTE", registroElectoral: 88631, porAlcanzar: 35452 },
  { municipio: "MP. EL SOCORRO", registroElectoral: 15115, porAlcanzar: 6046 },
  { municipio: "MP. PEDRO ZARAZA", registroElectoral: 44388, porAlcanzar: 17755 },
  { municipio: "MP. JUAN GERMAN ROSCIO N.", registroElectoral: 103010, porAlcanzar: 41204 }
];

// 2. PARROQUIAS (IMAGEN 2 - 39 PARROQUIAS EXACTAS)
export const METAS_PARROQUIAS: MetaParroquia[] = [
  { municipio: "MP. ORTIZ", parroquia: "ORTIZ", registroElectoral: 8226, porAlcanzar: 3290 },
  { municipio: "MP. ESTEROS DE CAMAGUAN", parroquia: "PUERTO MIRANDA", registroElectoral: 3440, porAlcanzar: 1376 },
  { municipio: "MP. JULIÁN MELLADO", parroquia: "SOSA", registroElectoral: 1336, porAlcanzar: 534 },
  { municipio: "MP. ORTIZ", parroquia: "SAN FCO. DE TIZNADOS", registroElectoral: 2329, porAlcanzar: 932 },
  { municipio: "MP. ESTEROS DE CAMAGUAN", parroquia: "UVERITO", registroElectoral: 1723, porAlcanzar: 689 },
  { municipio: "MP. JOSÉ TADEO MONAGAS", parroquia: "LIBERTAD DE ORITUCO", registroElectoral: 666, porAlcanzar: 266 },
  { municipio: "MP. ESTEROS DE CAMAGUAN", parroquia: "CAMAGUAN", registroElectoral: 14995, porAlcanzar: 5998 },
  { municipio: "MP. JOSÉ TADEO MONAGAS", parroquia: "SAN FCO DE MACAIRA", registroElectoral: 2381, porAlcanzar: 952 },
  { municipio: "MP. JUAN JOSÉ RONDÓN", parroquia: "LAS MERCEDES", registroElectoral: 15955, porAlcanzar: 6382 },
  { municipio: "MP. JOSÉ TADEO MONAGAS", parroquia: "LEZAMA", registroElectoral: 3272, porAlcanzar: 1309 },
  { municipio: "MP. JUAN JOSÉ RONDÓN", parroquia: "CABRUTA", registroElectoral: 7673, porAlcanzar: 3069 },
  { municipio: "MP. FRANCISCO DE MIRANDA", parroquia: "EL RASTRO", registroElectoral: 2458, porAlcanzar: 983 },
  { municipio: "MP. JUAN JOSÉ RONDÓN", parroquia: "STA RITA DE MANAPIRE", registroElectoral: 1591, porAlcanzar: 636 },
  { municipio: "MP. SAN JOSÉ DE GUARIBE", parroquia: "SAN JOSE DE GUARIBE", registroElectoral: 8926, porAlcanzar: 3570 },
  { municipio: "MP. JOSÉ FÉLIX RIBAS", parroquia: "TUCUPIDO", registroElectoral: 27216, porAlcanzar: 10886 },
  { municipio: "MP. JOSÉ FÉLIX RIBAS", parroquia: "SAN RAFAEL DE LAYA", registroElectoral: 2766, porAlcanzar: 1106 },
  { municipio: "MP. SANTA MARÍA DE IPIRE", parroquia: "SANTA MARIA DE IPIRE", registroElectoral: 10762, porAlcanzar: 4305 },
  { municipio: "MP. SAN GERONIMO DE GUAYABAL", parroquia: "GUAYABAL", registroElectoral: 11544, porAlcanzar: 4618 },
  { municipio: "MP. FRANCISCO DE MIRANDA", parroquia: "GUARDATINAJAS", registroElectoral: 3609, porAlcanzar: 1444 },
  { municipio: "MP. FRANCISCO DE MIRANDA", parroquia: "CALABOZO", registroElectoral: 95903, porAlcanzar: 38361 },
  { municipio: "MP. CHAGUARAMAS", parroquia: "CHAGUARAMAS", registroElectoral: 11261, porAlcanzar: 4504 },
  { municipio: "MP. JOSÉ TADEO MONAGAS", parroquia: "ALTAGRACIA DE ORITUCO", registroElectoral: 40102, porAlcanzar: 16041 },
  { municipio: "MP. JULIÁN MELLADO", parroquia: "EL SOMBRERO", registroElectoral: 20327, porAlcanzar: 8131 },
  { municipio: "MP. JOSÉ TADEO MONAGAS", parroquia: "SAN RAFAEL DE ORITUCO", registroElectoral: 3396, porAlcanzar: 1358 },
  { municipio: "MP. JUAN GERMAN ROSCIO N.", parroquia: "CANTAGALLO", registroElectoral: 2145, porAlcanzar: 858 },
  { municipio: "MP. SAN GERONIMO DE GUAYABAL", parroquia: "CAZORLA", registroElectoral: 5001, porAlcanzar: 2000 },
  { municipio: "MP. PEDRO ZARAZA", parroquia: "SAN JOSE DE UNARE", registroElectoral: 2061, porAlcanzar: 824 },
  { municipio: "MP. JUAN GERMAN ROSCIO N.", parroquia: "PARAPARA", registroElectoral: 3022, porAlcanzar: 1209 },
  { municipio: "MP. LEONARDO INFANTE", parroquia: "VALLE DE LA PASCUA", registroElectoral: 84930, porAlcanzar: 33972 },
  { municipio: "MP. LEONARDO INFANTE", parroquia: "ESPINO", registroElectoral: 3701, porAlcanzar: 1480 },
  { municipio: "MP. JOSÉ TADEO MONAGAS", parroquia: "SOUBLETTE", registroElectoral: 2308, porAlcanzar: 923 },
  { municipio: "MP. EL SOCORRO", parroquia: "EL SOCORRO", registroElectoral: 15115, porAlcanzar: 6046 },
  { municipio: "MP. ORTIZ", parroquia: "S LORENZO DE TIZNADOS", registroElectoral: 2490, porAlcanzar: 996 },
  { municipio: "MP. JOSÉ TADEO MONAGAS", parroquia: "PASO REAL DE MACAIRA", registroElectoral: 3131, porAlcanzar: 1252 },
  { municipio: "MP. PEDRO ZARAZA", parroquia: "ZARAZA", registroElectoral: 42327, porAlcanzar: 16931 },
  { municipio: "MP. FRANCISCO DE MIRANDA", parroquia: "EL CALVARIO", registroElectoral: 1163, porAlcanzar: 465 },
  { municipio: "MP. JUAN GERMAN ROSCIO N.", parroquia: "SAN JUAN DE LOS MORROS", registroElectoral: 97843, porAlcanzar: 39137 },
  { municipio: "MP. ORTIZ", parroquia: "SAN JOSE DE TIZNADOS", registroElectoral: 4064, porAlcanzar: 1626 },
  { municipio: "MP. SANTA MARÍA DE IPIRE", parroquia: "ALTAMIRA", registroElectoral: 909, porAlcanzar: 364 }
];

export const TOTAL_REGISTRO_ELECTORAL = 572067;
export const TOTAL_POR_ALCANZAR = 228827;