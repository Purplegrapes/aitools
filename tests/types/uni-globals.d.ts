declare global {
  var uni: {
    getStorageSync: (key: string) => any
  }

  var useGlobalMessage: () => {
    confirm: (options: any) => void
  }

  var wx: {
    miniProgram?: {
      redirectTo: (options: { url: string, fail?: () => void }) => void
    }
  }
}

export {}
