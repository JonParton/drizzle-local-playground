import {
  AnyColumn,
  AnyTable,
  InferColumnsDataTypes,
  InferModel,
  SQL,
  TableConfig,
  sql,
} from "drizzle-orm";

export function jsonAggBuildObject<T extends Record<string, AnyColumn>>(
  shape: T
) {
  const chunks: SQL[] = [];
  const filters: SQL[] = [];

  Object.entries(shape).forEach(([key, value]) => {
    if (chunks.length > 0) {
      chunks.push(sql.raw(`,`));
    }
    chunks.push(sql.raw(`'${key}',`));
    chunks.push(sql`${value}`);

    if (filters.length > 0) {
      filters.push(sql.raw(` or `));
    }

    filters.push(sql`${value} is not null`);
  });

  return sql<
    InferColumnsDataTypes<T>[]
  >`coalesce(json_agg(json_build_object(${sql.fromList(
    chunks
  )})) filter (where ${sql.fromList(filters)}), '[]')`;
}

export function jsonAgg<Table extends AnyTable<TableConfig>>(table: Table) {
  return sql<
    InferModel<Table>[]
  >`coalesce(json_agg(${table}) filter (where ${table} is not null), '[]')`;
}

export function jsonAggSubQuery<Subquery>(subquery: Subquery) {
  return sql<
    Awaited<Subquery>[]
  >`coalesce(json_agg(${subquery}) filter (where ${subquery} is not null), '[]')`;
}
