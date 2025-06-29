import * as z from 'zod/v4';
import { ApiErrorResponseSchema } from './schemas';

/**
 * API响应验证工具
 * 处理两种API响应格式:
 * 1. 错误响应: { code: number, message: string, ... }
 * 2. 成功响应: 直接返回数据对象
 */
export class ApiValidator {
  /**
   * 解析并验证API响应
   * @param data API响应数据
   * @param schema 预期数据的Zod schema
   * @returns 解析后的数据
   */
  static parse<T>(data: unknown, schema: z.ZodType<T>): T {
    const errorResult = ApiErrorResponseSchema.safeParse(data);
    if (errorResult.success && errorResult.data.code !== 0) {
      throw new Error(`API Error: ${errorResult.data.message} (Code: ${errorResult.data.code})`);
    }

    const result = schema.safeParse(data);
    if (result.success) {
      return result.data;
    }

    // eslint-disable-next-line no-console
    console.debug(result);
    const formattedErrors = z.treeifyError(result.error);
    throw new Error(`Schema validation failed: ${JSON.stringify(formattedErrors)}`);
  }
}
