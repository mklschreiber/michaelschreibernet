export interface ProjectImage {
  /** Path without size suffix or extension, e.g. "/page_macbook"; responsive
   *  variants are expected at `${base}-${width}.jpg` for each supported width. */
  base: string
  altKey: string
}

export interface ProjectLink {
  /** Absolute external URL; opened in a new tab. */
  url: string
  /** i18n key of the link text. */
  textKey: string
}

export interface Project {
  id: number
  titleKey: string
  descriptionKey: string
  technologies: string[]
  links?: ProjectLink[]
  images?: ProjectImage[]
}
