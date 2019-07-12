import createMuiTheme from '@material-ui/core/styles/createMuiTheme'

export const theme = createMuiTheme({
  typography: {
    fontFamily: 'Roboto,"Helvetica Neue",Helvetica,Arial,sans-serif;',
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
})
