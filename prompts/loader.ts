/**
 * Universal Prompt Loader
 * 
 * Load prompts from:
 * 1. Supabase database (highest priority)
 * 2. Local YAML files (fallback)
 * 
 * Usage:
 * ```typescript
 * import { PromptLoader } from './prompts/loader';
 * 
 * const loader = new PromptLoader()
 *   .withSupabase(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
 * 
 * const prompt = await loader.get('nko_frame');
 * const filled = loader.fill(prompt, { nko_text: 'ߒߞߏ', translation: 'I declare' });
 * ```
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

export interface PromptDefinition {
  id: string;
  name: string;
  description?: string;
  category: string;
  cost_tier: 'text_only' | 'multimodal' | 'live';
  template: string;
  output_schema?: Record<string, unknown>;
  version?: string;
  active?: boolean;
  tags?: string[];
}

export interface PromptFile {
  schema_version: string;
  category: string;
  cost_tier: string;
  prompts: Record<string, PromptDefinition>;
}

export class PromptLoader {
  private supabaseUrl?: string;
  private supabaseKey?: string;
  private cache: Map<string, PromptDefinition> = new Map();
  private yamlDir: string;

  constructor(yamlDir?: string) {
    this.yamlDir = yamlDir || path.join(__dirname, 'nko');
  }

  /**
   * Configure Supabase connection
   */
  withSupabase(url: string, key: string): this {
    this.supabaseUrl = url;
    this.supabaseKey = key;
    return this;
  }

  /**
   * Get a prompt by ID
   */
  async get(id: string): Promise<PromptDefinition | null> {
    // Check cache
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }

    // Try Supabase first
    if (this.supabaseUrl && this.supabaseKey) {
      const prompt = await this.loadFromSupabase(id);
      if (prompt) {
        this.cache.set(id, prompt);
        return prompt;
      }
    }

    // Fall back to YAML
    const prompt = this.loadFromYaml(id);
    if (prompt) {
      this.cache.set(id, prompt);
    }
    return prompt;
  }

  /**
   * Get prompt template content
   */
  async getTemplate(id: string): Promise<string | null> {
    const prompt = await this.get(id);
    return prompt?.template || null;
  }

  /**
   * Fill template with variables
   */
  fill(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    return result;
  }

  /**
   * Get and fill a prompt in one call
   */
  async getAndFill(id: string, variables: Record<string, string>): Promise<string | null> {
    const template = await this.getTemplate(id);
    if (!template) return null;
    return this.fill(template, variables);
  }

  /**
   * List all available prompt IDs
   */
  async listIds(): Promise<string[]> {
    const ids = new Set<string>();

    // Load from Supabase if configured
    if (this.supabaseUrl && this.supabaseKey) {
      try {
        const response = await fetch(
          `${this.supabaseUrl}/rest/v1/nko_prompts?select=id&active=eq.true`,
          {
            headers: {
              apikey: this.supabaseKey,
              Authorization: `Bearer ${this.supabaseKey}`,
            },
          }
        );
        if (response.ok) {
          const rows = await response.json();
          rows.forEach((row: { id: string }) => ids.add(row.id));
        }
      } catch (e) {
        console.warn('Failed to list prompts from Supabase:', e);
      }
    }

    // Load from YAML files
    this.loadAllYamlIds().forEach(id => ids.add(id));

    return Array.from(ids);
  }

  /**
   * List prompts by category
   */
  async listByCategory(category: string): Promise<PromptDefinition[]> {
    const allIds = await this.listIds();
    const prompts: PromptDefinition[] = [];

    for (const id of allIds) {
      const prompt = await this.get(id);
      if (prompt && prompt.category === category) {
        prompts.push(prompt);
      }
    }

    return prompts;
  }

  /**
   * Get all world exploration prompts
   */
  async getWorldPrompts(): Promise<PromptDefinition[]> {
    return this.listByCategory('world_exploration');
  }

  /**
   * Get all frame analysis prompts
   */
  async getFramePrompts(): Promise<PromptDefinition[]> {
    return this.listByCategory('frame_analysis');
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  // Private methods

  private async loadFromSupabase(id: string): Promise<PromptDefinition | null> {
    if (!this.supabaseUrl || !this.supabaseKey) return null;

    try {
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/nko_prompts?id=eq.${id}&active=eq.true`,
        {
          headers: {
            apikey: this.supabaseKey,
            Authorization: `Bearer ${this.supabaseKey}`,
          },
        }
      );

      if (!response.ok) return null;

      const rows = await response.json();
      if (rows.length === 0) return null;

      const row = rows[0];
      return {
        id: row.id,
        name: row.name,
        description: row.description,
        category: row.category,
        cost_tier: row.cost_tier,
        template: row.template,
        output_schema: row.output_schema,
        version: row.version,
        active: row.active,
        tags: row.tags,
      };
    } catch (e) {
      console.warn(`Failed to load prompt ${id} from Supabase:`, e);
      return null;
    }
  }

  private loadFromYaml(id: string): PromptDefinition | null {
    // Search all YAML files
    const files = this.getYamlFiles();
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const data = yaml.load(content) as PromptFile;
        
        if (data.prompts && data.prompts[id]) {
          const prompt = data.prompts[id];
          return {
            ...prompt,
            category: prompt.category || data.category,
            cost_tier: (prompt.cost_tier || data.cost_tier) as 'text_only' | 'multimodal' | 'live',
          };
        }
      } catch (e) {
        console.warn(`Failed to load YAML file ${file}:`, e);
      }
    }

    return null;
  }

  private loadAllYamlIds(): string[] {
    const ids: string[] = [];
    const files = this.getYamlFiles();

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const data = yaml.load(content) as PromptFile;
        
        if (data.prompts) {
          ids.push(...Object.keys(data.prompts));
        }
      } catch (e) {
        console.warn(`Failed to parse YAML file ${file}:`, e);
      }
    }

    return ids;
  }

  private getYamlFiles(): string[] {
    const files: string[] = [];
    
    try {
      const entries = fs.readdirSync(this.yamlDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isFile() && (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml'))) {
          files.push(path.join(this.yamlDir, entry.name));
        }
      }
    } catch (e) {
      console.warn(`Failed to read YAML directory ${this.yamlDir}:`, e);
    }

    return files;
  }
}

// Export singleton instance
export const promptLoader = new PromptLoader();

// Convenience functions
export async function getPrompt(id: string): Promise<string | null> {
  return promptLoader.getTemplate(id);
}

export async function getAndFillPrompt(
  id: string,
  variables: Record<string, string>
): Promise<string | null> {
  return promptLoader.getAndFill(id, variables);
}

