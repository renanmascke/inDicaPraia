import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import pool from '@/lib/db';

export interface ImaRecord {
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
}

export class ImaScraperService {
  private static IMA_URL = 'https://balneabilidade.ima.sc.gov.br/relatorio/historico';

  /**
   * Sincroniza os dados de um ano específico do IMA para o banco de dados.
   */
  async syncYear(year: number) {
    if (!pool) throw new Error('Conexão com o banco de dados não disponível.');

    console.log(`[IMA] Iniciando sincronização para o ano ${year}...`);

    try {
      const html = await this.fetchImaHtml(year);
      const rawRecords = this.parseHtml(html);

      if (rawRecords.length === 0) {
        return { success: false, message: 'Nenhum registro encontrado no IMA.' };
      }

      // 1. Resolver Municípios (Garante que existam no DB)
      const municipioMap = await this.resolveMunicipios(rawRecords);

      // 2. Salvar Histórico em lotes utilizando SQL nativo
      const result = await this.saveHistorico(rawRecords, municipioMap, year);

      return {
        success: true,
        year,
        processed: rawRecords.length,
        inserted: result.inserted,
        ignored: rawRecords.length - result.inserted,
      };
    } catch (error: any) {
      console.error(`[IMA] Erro na sincronização: ${error.message}`);
      throw error;
    }
  }

  /**
   * Faz o POST no site do IMA e retorna o HTML.
   */
  private async fetchImaHtml(year: number): Promise<string> {
    const params = new URLSearchParams({
      municipioID: '0',
      localID: '0',
      ano: String(year),
      redirect: 'true',
    });

    const response = await fetch(ImaScraperService.IMA_URL, {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (compatible; inDicaPraia/2.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Falha ao acessar IMA: ${response.statusText}`);
    }

    return await response.text();
  }

  /**
   * Parseia o HTML bruto para objetos estruturados.
   */
  private parseHtml(html: string): ImaRecord[] {
    const $ = cheerio.load(html);
    const records: ImaRecord[] = [];
    let currentBloco: { municipio: string; balneario: string; ponto_coleta: string; localizacao: string } | null = null;

    $('table').each((_, table) => {
      const $table = $(table);
      const classes = $table.attr('class') || '';
      const style = $table.attr('style') || '';

      if (classes.includes('table') && style.includes('text-align: center')) {
        const labels = $table.find('label');
        if (labels.length >= 4) {
          currentBloco = {
            municipio: this.extractValue($(labels[0]).text()),
            balneario: this.extractValue($(labels[1]).text()),
            ponto_coleta: this.extractValue($(labels[2]).text()),
            localizacao: this.extractValue($(labels[3]).text()),
          };
        }
      }

      if (classes.includes('table-print') && currentBloco) {
        $table.find('tbody tr').each((_, tr) => {
          const cells = $(tr).find('td');
          if (cells.length < 9) return;

          records.push({
            ...currentBloco!,
            data_coleta: this.formatDate($(cells[0]).text().trim()),
            hora: $(cells[1]).text().trim(),
            vento: $(cells[2]).text().trim(),
            mare: $(cells[3]).text().trim(),
            chuva: $(cells[4]).text().trim(),
            agua_temp: $(cells[5]).text().replace(/[ºC°C]/g, '').trim(),
            ar_temp: $(cells[6]).text().replace(/[ºC°C]/g, '').trim(),
            ecoli: $(cells[7]).text().trim(),
            condicao: $(cells[8]).text().trim(),
          });
        });
      }
    });

    return records;
  }

  /**
   * Garante que os municípios existam via SQL nativo.
   */
  private async resolveMunicipios(records: ImaRecord[]): Promise<Map<string, number>> {
    const uniqueNames = Array.from(new Set(records.map(r => r.municipio)));
    
    for (const name of uniqueNames) {
      // Usando INSERT IGNORE para garantir que o município exista sem duplicar
      await pool!.execute('INSERT IGNORE INTO municipios (nome, estado) VALUES (?, ?)', [name, 'SC']);
    }

    const [rows]: any = await pool!.execute('SELECT id, nome FROM municipios WHERE nome IN (' + uniqueNames.map(() => '?').join(',') + ')', uniqueNames);

    const map = new Map<string, number>();
    rows.forEach((m: any) => map.set(m.nome, m.id));
    return map;
  }

  /**
   * Salva os registros no banco via SQL nativo (lote).
   */
  private async saveHistorico(records: ImaRecord[], municipioMap: Map<string, number>, year: number) {
    let insertedCount = 0;
    
    // Processamento em lotes menores para evitar estourar limites de querie SQL
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      const placeholders = batch.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
      const values: any[] = [];

      batch.forEach(r => {
        values.push(
          municipioMap.get(r.municipio)!,
          r.balneario,
          r.ponto_coleta,
          r.localizacao,
          r.data_coleta,
          r.hora,
          r.vento,
          r.mare,
          r.chuva,
          r.agua_temp,
          r.ar_temp,
          r.ecoli,
          r.condicao,
          year
        );
      });

      const sql = `
        INSERT IGNORE INTO ima_historico 
        (municipio_db_id, balneario, ponto_coleta, localizacao, data_coleta, hora, vento, mare, chuva, agua_temp, ar_temp, ecoli, condicao, ano_referencia) 
        VALUES ${placeholders}
      `;

      const [result]: any = await pool!.execute(sql, values);
      insertedCount += result.affectedRows;
    }

    return { inserted: insertedCount };
  }

  private extractValue(text: string): string {
    return text.includes(':') ? text.split(':').slice(1).join(':').trim() : text.trim();
  }

  private formatDate(dateStr: string): string {
    const [d, m, y] = dateStr.split('/');
    return `${y}-${m}-${d}`;
  }
}
