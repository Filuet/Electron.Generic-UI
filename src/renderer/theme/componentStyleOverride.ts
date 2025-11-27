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
          fontSize: '14px',
          '& .MuiInputBase-root': {
            color: theme.palette.text.primary,
            fontSize: '14px',
            padding: 0,
            height: '2.5rem',
            backgroundColor: theme.palette.common.white,
            borderRadius: '10px'
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
          WebkitBoxShadow: `0 0 0 100px #f5f5f5 inset`,
          WebkitTextFillColor: theme.palette.secondary.main,
          transition: 'background-color 5000s ease-in-out 0s',
          fontSize: '0.8rem',
          borderRadius: '24px'
        },

        outlined: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '24px',
            fontSize: '18px',
            overflow: 'hidden',
            '& fieldset': {
              borderColor: theme.palette.secondary.main,
              borderRadius: '24px',
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
            borderRadius: '24px',
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
            borderBottom: `2px solid ${theme.palette.secondary.main}`,
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
          fontSize: '17px'
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
          borderRadius: '50px',
          width: '272px',
          height: '64px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none'
          }
        }
      }
    }
  };
}
