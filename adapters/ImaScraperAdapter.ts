import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { ImaRecord } from '@/types';

export class ImaScraperAdapter {
  private static IMA_URL = 'https://balneabilidade.ima.sc.gov.br/relatorio/historico';

  /**
   * Traz os dados brutos e os limpa como uma lista de ImaRecord prontos para integração.
   */
  async fetchAndParseYear(year: number): Promise<ImaRecord[]> {
    console.log(`[Adapter IMA] Solicitando relatórios para o ano ${year}...`);
    
    const html = await this.fetchImaHtml(year);
    return this.parseHtml(html);
  }

  private async fetchImaHtml(year: number): Promise<string> {
    const params = new URLSearchParams({
      municipioID: '0',
      localID: '0',
      ano: String(year),
      redirect: 'true',
    });

    const response = await fetch(ImaScraperAdapter.IMA_URL, {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (compatible; inDicaPraia/2.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Falha ao acessar serviço externo do IMA: ${response.statusText}`);
    }

    return await response.text();
  }

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

  private extractValue(text: string): string {
    return text.includes(':') ? text.split(':').slice(1).join(':').trim() : text.trim();
  }

  private formatDate(dateStr: string): string {
    const [d, m, y] = dateStr.split('/');
    return `${y}-${m}-${d}`;
  }
}
