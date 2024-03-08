import { createVuetify, type ThemeDefinition } from 'vuetify'
//import * as components from 'vuetify/components'
//import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import 'vuetify/styles'

const darkTheme: ThemeDefinition = {
  dark:true,
  colors: {
    primary: "#818181"
  }
}

const vuetify = createVuetify({
    //components,
    //directives,
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
          mdi,
        },
      },
    display: {
        mobileBreakpoint: 'sm'
    },
    theme: {
      defaultTheme: "darkTheme",
      themes: {
        darkTheme
      }
    }
})

export default vuetify