export interface Municipio {
  id: number;
  nome: string;
  estado: string;
}

export interface ImaRecord {
  id?: number;
  municipio_db_id?: number;
  municipio: string;
  balneario: string;
  ponto_coleta: string;
  localizacao: string;
  data_coleta: string; // YYYY-MM-DD
  hora: string;
  vento: string;
  mare: string;
  chuva: string;
  agua_temp: string;
  ar_temp: string;
  ecoli: string;
  condicao: string;
  ano_referencia?: number;
}
