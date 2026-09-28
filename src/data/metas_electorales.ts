export interface MetaMunicipio {
  municipio: string;
  registroElectoral: number;
  porAlcanzar: number;
}

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

export const TOTAL_REGISTRO_ELECTORAL = 572067;
export const TOTAL_POR_ALCANZAR = 228827;