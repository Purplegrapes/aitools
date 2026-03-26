declare module 'js-cookie' {
  const cookie: {
    get: (name: string) => string | undefined
    set: (name: string, value: string) => void
    remove: (name: string) => void
  }

  export default cookie
}
