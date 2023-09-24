import { createTheme, adaptV4Theme } from '@mui/material/styles'

export const theme = createTheme(adaptV4Theme({
  typography: {
    fontFamily: 'system-ui,Roboto,"Helvetica Neue",Helvetica,Arial,sans-serif;',
    h2: {
      fontSize: '150%',
      fontWeight: 'bold',
      marginBottom: 16,
    },
    h3: {
      fontSize: '120%',
      fontWeight: 'bold',
    },
  },
  overrides: {
    MuiFormGroup: {
      root: {
        flexDirection: 'row',
      },
    },
  },
}))
