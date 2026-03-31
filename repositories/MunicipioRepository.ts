import pool from '@/lib/db';
import { Municipio } from '@/types';

export class MunicipioRepository {
  /**
   * Garante que uma lista de municípios exista na tabela. (Insert Ignore)
   */
  async ensureExists(names: string[]): Promise<void> {
    if (!pool || names.length === 0) return;
    
    // Desduplicar
    const uniqueNames = Array.from(new Set(names));
    
    for (const name of uniqueNames) {
      await pool.execute(
        'INSERT IGNORE INTO municipios (nome, estado) VALUES (?, ?)', 
        [name, 'SC']
      );
    }
  }

  /**
   * Busca um map de { nome -> id } para associação rápida durante insert em lote.
   */
  async getMapByNames(names: string[]): Promise<Map<string, number>> {
    if (!pool || names.length === 0) return new Map();

    const uniqueNames = Array.from(new Set(names));
    const placeholders = uniqueNames.map(() => '?').join(',');
    
    const [rows]: any = await pool.execute(
      `SELECT id, nome FROM municipios WHERE nome IN (${placeholders})`, 
      uniqueNames
    );

    const map = new Map<string, number>();
    rows.forEach((m: Municipio) => map.set(m.nome, m.id));
    return map;
  }
}
