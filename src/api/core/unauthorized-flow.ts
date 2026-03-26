export type UnauthorizedExternalSource = 'miniprogram' | 'h5' | 'internal'

export interface ResolveUnauthorizedFollowUpParams {
  methodUrl: string
  errorMessage: string
  isExternal: boolean
  source: UnauthorizedExternalSource
  loginUrl: string
}

export interface UnauthorizedFollowUp {
  shouldToast: boolean
  externalRedirect: null | {
    source: UnauthorizedExternalSource
    loginUrl: string
  }
}

export function resolveUnauthorizedFollowUp(params: ResolveUnauthorizedFollowUpParams): UnauthorizedFollowUp {
  const { methodUrl, isExternal, source, loginUrl } = params

  return {
    shouldToast: !methodUrl.startsWith('/tools-api') && !methodUrl.startsWith('/valuation-api'),
    externalRedirect: isExternal
      ? {
          source,
          loginUrl,
        }
      : null,
  }
}
