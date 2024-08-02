import { createTheme } from '@mui/material/styles';
import { pink, yellow, blueGrey, deepOrange } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: {
      main: pink[400],
    },
    secondary: {
      main: pink[400],
    },
    background: {
      default: yellow[50],
    },
    text: {
      primary: blueGrey[900], // Mörkare färg för bättre kontrast
      secondary: blueGrey[600], // Mjukare sekundärfärg
    },
  },
  typography: {
    fontFamily: 'Comic Sans MS, Comic Sans',
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
      color: blueGrey[800], // Använd primary textfärg
      '@media (max-width:600px)': {
        fontSize: '0.875rem',
      },
    },
    body2: {
      fontSize: '0.875rem',
      color: blueGrey[700], // Använd secondary textfärg
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          textTransform: 'none',
         
          fontSize: '0.8rem', // Standardstorlek för desktop
          padding: '6px 12px', // Standard padding för desktop
       
          '@media (max-width:768px)': {
            fontSize: '0.7rem',
            padding:'5px 12px'
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          margin: 0,
          fontFamily: 'Comic Sans MS, Comic Sans',
          color: blueGrey[900], // Använd primary textfärg som standard
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFEB3B',
          color: deepOrange[900], // Mörkare färg för bättre kontrast
          textAlign: 'center',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFDE7',
          color: blueGrey[800], // Använd primary textfärg
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
