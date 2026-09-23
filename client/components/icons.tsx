import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement>

export const Icons = {
  // Dunder Mifflin workspace mark: a stack of paper
  logo: (props: IconProps) => (
    <svg viewBox="0 0 32 32" fill="none" {...props}>
      <rect x="6" y="9" width="18" height="18" rx="2.5" fill="currentColor" opacity="0.35" />
      <rect x="9" y="6" width="18" height="18" rx="2.5" fill="currentColor" />
      <path
        d="M13 11.5h10M13 15h10M13 18.5h6"
        stroke="hsl(var(--rail))"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  gitHub: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.1-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />
    </svg>
  ),
}
