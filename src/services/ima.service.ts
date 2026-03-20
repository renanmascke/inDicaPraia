import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import prisma from '@/lib/prisma';

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
    console.log(`[IMA] Iniciando sincronização para o ano ${year}...`);

    try {
      const html = await this.fetchImaHtml(year);
      const rawRecords = this.parseHtml(html);

      if (rawRecords.length === 0) {
        return { success: false, message: 'Nenhum registro encontrado no IMA.' };
      }

      // 1. Resolver Municípios (Garante que existam no DB)
      const municipioMap = await this.resolveMunicipios(rawRecords);

      // 2. Salvar Histórico em lotes
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

      // Tabela de cabeçalho (Município/Localização)
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

      // Tabela de dados de coleta
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
   * Garante que os municípios existam e retorna um mapa [Nome -> DB ID].
   */
  private async resolveMunicipios(records: ImaRecord[]): Promise<Map<string, number>> {
    const uniqueNames = Array.from(new Set(records.map(r => r.municipio)));
    
    // UPSERT para todos os municípios encontrados
    await Promise.all(
      uniqueNames.map(name => 
        prisma.municipio.upsert({
          where: { nome: name },
          update: {},
          create: { nome: name, estado: 'SC' },
        })
      )
    );

    const allMunicipios = await prisma.municipio.findMany({
      where: { nome: { in: uniqueNames } },
      select: { id: true, nome: true }
    });

    const map = new Map<string, number>();
    allMunicipios.forEach(m => map.set(m.nome, m.id));
    return map;
  }

  /**
   * Salva os registros no banco via Prisma createMany.
   */
  private async saveHistorico(records: ImaRecord[], municipioMap: Map<string, number>, year: number) {
    const data = records.map(r => ({
      municipioDbId: municipioMap.get(r.municipio)!,
      balneario: r.balneario,
      pontoColeta: r.ponto_coleta,
      localizacao: r.localizacao,
      dataColeta: new Date(r.data_coleta),
      hora: r.hora,
      vento: r.vento,
      mare: r.mare,
      chuva: r.chuva,
      aguaTemp: r.agua_temp,
      arTemp: r.ar_temp,
      ecoli: r.ecoli,
      condicao: r.condicao,
      anoReferencia: year,
    }));

    // O Prisma createMany com skipDuplicates é perfeito para esta tarefa incremental
    const result = await prisma.imaHistorico.createMany({
      data,
      skipDuplicates: true,
    });

    return { inserted: result.count };
  }

  private extractValue(text: string): string {
    return text.includes(':') ? text.split(':').slice(1).join(':').trim() : text.trim();
  }

  private formatDate(dateStr: string): string {
    const [d, m, y] = dateStr.split('/');
    return `${y}-${m}-${d}`;
  }
}
