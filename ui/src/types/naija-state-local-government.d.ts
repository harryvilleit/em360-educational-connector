declare module "naija-state-local-government" {
  interface LgaResponse {
    state: string
    lgas: string[]
  }

  interface NaijaStateLocalGovernment {
    states: () => string[]
    lgas: (state: string) => LgaResponse | undefined
  }

  const NaijaStates: NaijaStateLocalGovernment

  export default NaijaStates
}
