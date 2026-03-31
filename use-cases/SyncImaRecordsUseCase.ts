import { ImaScraperAdapter } from '@/adapters/ImaScraperAdapter';
import { MunicipioRepository } from '@/repositories/MunicipioRepository';
import { BathingRepository } from '@/repositories/BathingRepository';

export class SyncImaRecordsUseCase {
  private adapter: ImaScraperAdapter;
  private municipioRepo: MunicipioRepository;
  private bathingRepo: BathingRepository;

  constructor() {
    this.adapter = new ImaScraperAdapter();
    this.municipioRepo = new MunicipioRepository();
    this.bathingRepo = new BathingRepository();
  }

  async execute(year: number) {
    if (!year || isNaN(year)) {
      throw new Error('Ano inválido fornecido para sincronização.');
    }

    console.log(`[Use Case] Iniciando SyncImaRecords para o ano ${year}...`);

    try {
      // 1. Adapter resolve a captura externa isoladamente (Gateway/Adapter)
      const rawRecords = await this.adapter.fetchAndParseYear(year);

      if (rawRecords.length === 0) {
        return { success: false, message: 'Nenhum registro encontrado via fonte externa.' };
      }

      // 2. Extrai nomes de municípios únicos
      const municipioNames = Array.from(new Set(rawRecords.map(r => r.municipio)));

      // 3. Garante e mapeia municípios (Repository Pattern SQL limpo)
      await this.municipioRepo.ensureExists(municipioNames);
      const municipioMap = await this.municipioRepo.getMapByNames(municipioNames);

      // 4. Salva o Histórico de Balneabilidade usando o mapeamento (Data Access)
      const insertedCount = await this.bathingRepo.insertInBatches(rawRecords, municipioMap, year);

      return {
        success: true,
        year,
        processed: rawRecords.length,
        inserted: insertedCount,
        ignored: rawRecords.length - insertedCount,
      };
    } catch (error: any) {
      console.error(`[Use Case] Falha crítica de negócio na sincronização: ${error.message}`);
      throw error;
    }
  }
}
