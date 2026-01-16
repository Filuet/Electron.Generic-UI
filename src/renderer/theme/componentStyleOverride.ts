import { Theme } from '@mui/material/styles';

export default function componentStyleOverrides(theme: Theme): Record<string, unknown> {
  return {
    MuiAppBar: {
      styleOverrides: {
        root: {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.common.white,
          boxShadow: 'none'
        },
        toolbar: {},
        title: {}
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          fontSize: '1.3rem', // 14px -> ~1.3rem
          '& .MuiInputBase-root': {
            color: theme.palette.text.primary,
            fontSize: '1.3rem', // 14px
            padding: 0,
            height: '2.5rem',
            backgroundColor: theme.palette.common.white,
            borderRadius: '0.92rem' // 10px -> ~0.92rem
          },
          '& .MuiFormHelperText-root': {
            color: theme.palette.error.main
          }
        },

        label: {
          color: theme.palette.secondary.main,
          opacity: '0.6',
          '&.Mui-focused': {
            opacity: '1',
            color: theme.palette.secondary.main
          },
          '&.MuiInputLabel-shrink': {
            color: theme.palette.secondary.main
          }
        },

        '& input:-webkit-autofill': {
          WebkitBoxShadow: `0 0 0 100px #f5f5f5 inset`, // 100px -> not critical for scaling usually but keeping logical
          WebkitTextFillColor: theme.palette.secondary.main,
          transition: 'background-color 5000s ease-in-out 0s',
          fontSize: '0.8rem',
          borderRadius: '2.2rem' // 24px -> 2.22rem
        },

        outlined: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '2.2rem', // 24px
            fontSize: '1.66rem', // 18px -> ~1.66rem
            overflow: 'hidden',
            '& fieldset': {
              borderColor: theme.palette.secondary.main,
              borderRadius: '2.2rem', // 24px
              boxShadow: 'none'
            },
            '&:hover fieldset': {
              borderColor: theme.palette.divider
            },
            '&.Mui-focused fieldset': {
              borderColor: theme.palette.divider,
              opacity: '1'
            }
          }
        },

        filled: {
          '& .MuiFilledInput-root': {
            backgroundColor: theme.palette.common.white,
            borderRadius: '2.2rem', // 24px
            '&:hover': {
              backgroundColor: theme.palette.action.hover
            },
            '&.Mui-focused': {
              backgroundColor: theme.palette.background.paper
            }
          }
        },

        standard: {
          '& .MuiInput-root': {
            borderBottom: `2px solid ${theme.palette.secondary.main}`, // Borders are usually fine in px
            '&:hover': {
              borderBottom: `2px solid ${theme.palette.divider}`
            },
            '&.Mui-focused': {
              borderBottom: `2px solid ${theme.palette.divider}`
            }
          }
        }
      }
    },

    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: '1.57rem' // 17px -> ~1.57rem
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none'
          }
        },
        outlined: {
          color: theme.palette.primary.contrastText,
          backgroundColor: theme.palette.primary.main,
          borderRadius: '4.6rem', // 50px -> ~4.6rem
          width: '25rem', // 272px -> ~25.1rem
          height: '5.9rem', // 64px -> ~5.9rem
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none'
          }
        }
      }
    }
  };
}
