import * as React from "react"
import Svg, { Path } from "react-native-svg"

export function FacebookLogo(props: any) {
  return (
    <Svg
      width="800px"
      height="800px"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M225.638 208H202.65a2.65 2.65 0 01-2.649-2.65v-42.7a2.649 2.649 0 012.65-2.65h42.701a2.649 2.649 0 012.649 2.65v42.7a2.65 2.65 0 01-2.649 2.65h-12.232v-18.588h6.24l.934-7.244h-7.174v-4.625c0-2.098.583-3.527 3.59-3.527l3.836-.002v-6.479c-.663-.088-2.94-.285-5.59-.285-5.53 0-9.317 3.376-9.317 9.575v5.343h-6.255v7.244h6.255V208z"
        transform="translate(-200 -160)"
        fill="#4460A0"
        stroke="none"
        strokeWidth={1}
        fillRule="evenodd"
      />
    </Svg>
  )
}

