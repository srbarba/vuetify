export interface VuetifyComponent {
  from: string
  styles?: string[]
}
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export type ComponentName = keyof typeof import('vuetify/components')
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export type LabComponentName = keyof typeof import('vuetify/labs/components')
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export type DirectiveName = keyof typeof import('vuetify/directives')
export interface VuetifyComponents {
  [key: string]: VuetifyComponent
}
export interface VuetifyDirectives {
  [key: string]: DirectiveName
}
export interface ImportComponents {
  components: VuetifyComponents
  directives: VuetifyDirectives
}
export interface ImportLabsComponents {
  [key: string]: VuetifyComponent
}
export type ImportMaps = [importMaps: Promise<ImportComponents>, importMapsLabs: Promise<ImportLabsComponents>]
