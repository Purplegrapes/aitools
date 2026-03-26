import 'alova'

declare module 'alova' {
  interface AlovaCustomTypes {
    meta: {
      authRole?: 'visitor' | 'refreshToken'
    }
  }
}
