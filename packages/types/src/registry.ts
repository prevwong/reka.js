import type { Schema } from './schema';

export const SchemaRegistry: Record<string, Schema> = Object.create(null);

export const getTypeSchema = (type: string) => SchemaRegistry[type];
