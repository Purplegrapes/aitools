/**
 * TAMP 子包独立 API 接口
 * API 前缀: /tamp-api
 */
import { alovaInstance } from '@/api/core/instance'

/**
 * 获取 TAMP 数据
 * @param params 查询参数
 */
export function getTampData(params?: Record<string, any>) {
  return alovaInstance.Get('/tamp-api/data', {
    params,
  })
}
