import { createTheme } from '@mui/material/styles';
import { pink, purple, yellow, green } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: {
      main: pink[500],
    },
    secondary: {
      main: purple[500],
    },
    background: {
      default: yellow[50],
    },
    text: {
      primary: green[900],
    },
  },
  typography: {
    fontFamily: 'Comic Sans MS, Comic Sans, ',
    h1: {
      fontSize: '3rem',
      fontWeight: 'bold',
      color: pink[500],
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h3: {
      fontSize: '1.5rem',
      color: pink[500],
    },
    body1: {
      fontSize: '1rem',
      color: green[700],
      '@media (max-width:600px)': {
        fontSize: '0.875rem',
      },
    },
    body2: {
      fontSize: '0.875rem',
      color: green[700],
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          textTransform: 'none',
          fontWeight: 'bold',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          margin: 0,
          fontFamily: 'Comic Sans MS, Comic Sans, ',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFEB3B',
          color: '#FF5722',
          textAlign: 'center',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFDE7',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#fff',
        },
      },
    },
  },
});

export default theme;
