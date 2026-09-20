export interface ProjectImage {
  /** Path without size suffix or extension, e.g. "/page_macbook"; responsive
   *  variants are expected at `${base}-${width}.jpg` for each supported width. */
  base: string
  altKey: string
}

export interface Project {
  id: number
  titleKey: string
  descriptionKey: string
  technologies: string[]
  link?: string
  linkTextKey?: string
  images?: ProjectImage[]
}
