import React from 'react';
import { AppBar, Toolbar, Typography, Container } from '@mui/material';
import { styled } from '@mui/system';

const HeaderAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#FFF9C4', // Light yellow background
  color: theme.palette.primary.main,
  boxShadow: 'none',
}));

const Title = styled(Typography)(({ theme }) => ({
  flexGrow: 1,
  fontFamily: 'Comic Sans MS, Comic Sans, cursive',
  color: theme.palette.primary.main,
  textAlign: 'center',
  fontSize: '2rem',
  padding: theme.spacing(2, 0),
}));

const Header = () => (
  <HeaderAppBar position="static">
    <Container maxWidth="lg">
      <Toolbar>
        <Title variant="h1">
          Välkommen till Förskolekollen
        </Title>
      </Toolbar>
    </Container>
  </HeaderAppBar>
);

export default Header;
