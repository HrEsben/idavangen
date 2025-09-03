'use client';

import LogDashboard from "@/components/LogDashboard";
import LogEntryForm from "@/components/LogEntryForm";
import LogHistory from "@/components/LogHistory";
import UserRoleManager from "@/components/UserRoleManager";
import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Tab,
  Tabs,
  Paper,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Chip,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';
import { 
  Dashboard, 
  Add, 
  History, 
  People, 
  Logout,
  AccountCircle,
  School,
  SupervisedUserCircle,
  Psychology
} from '@mui/icons-material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  child_id?: number;
  child_name?: string;
}

interface AppContentProps {
  user: User;
  onLogout: () => void;
}

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function AppContent({ user, onLogout }: AppContentProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLogout = () => {
    onLogout();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'secondary';
      case 'admin': return 'error';
      case 'parent': return 'primary';
      case 'teacher': return 'success';
      default: return 'default';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Administrator';
      case 'parent': return 'Forælder';
      case 'teacher': return 'Lærer';
      default: return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <SupervisedUserCircle />;
      case 'admin': return <Psychology />;
      case 'parent': return <AccountCircle />;
      case 'teacher': return <School />;
      default: return <AccountCircle />;
    }
  };

  // Show users tab only for admins and super admins
  const canManageUsers = user.role === 'admin' || user.role === 'super_admin';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        {/* App Bar */}
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <School sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Idavang - Skolevægring & Trivsel
            </Typography>
            
            {/* User Info */}
            <Box display="flex" alignItems="center" gap={2}>
              <Box textAlign="right">
                <Typography variant="body2" color="inherit">
                  {user.name}
                </Typography>
                <Chip
                  size="small"
                  label={getRoleDisplayName(user.role)}
                  color={getRoleColor(user.role) as any}
                  icon={getRoleIcon(user.role)}
                  sx={{ fontSize: '0.75rem' }}
                />
              </Box>
              <IconButton
                color="inherit"
                onClick={handleMenuClick}
                sx={{ ml: 1 }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {user.name.charAt(0)}
                </Avatar>
              </IconButton>
            </Box>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 2 }} />
                Log ud
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Navigation Tabs */}
        <Paper square elevation={1}>
          <Container maxWidth="lg">
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab 
                icon={<Dashboard />} 
                label="Dashboard" 
                iconPosition="start"
                sx={{ textTransform: 'none', minHeight: 64 }}
              />
              <Tab 
                icon={<Add />} 
                label="Ny Log" 
                iconPosition="start"
                sx={{ textTransform: 'none', minHeight: 64 }}
              />
              <Tab 
                icon={<History />} 
                label="Historik" 
                iconPosition="start"
                sx={{ textTransform: 'none', minHeight: 64 }}
              />
              {canManageUsers && (
                <Tab 
                  icon={<People />} 
                  label="Brugere & Roller" 
                  iconPosition="start"
                  sx={{ textTransform: 'none', minHeight: 64 }}
                />
              )}
            </Tabs>
          </Container>
        </Paper>

        {/* Tab Content */}
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <TabPanel value={activeTab} index={0}>
            <LogDashboard user={user} />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <LogEntryForm user={user} />
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <LogHistory user={user} />
          </TabPanel>
          {canManageUsers && (
            <TabPanel value={activeTab} index={3}>
              <UserRoleManager user={user} />
            </TabPanel>
          )}
        </Container>

        {/* Child Info Footer */}
        {user.child_name && (
          <Paper 
            elevation={2} 
            sx={{ 
              position: 'fixed', 
              bottom: 16, 
              right: 16, 
              p: 2,
              maxWidth: 300,
              bgcolor: 'primary.main',
              color: 'white'
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Aktive barn:
            </Typography>
            <Typography variant="h6">
              {user.child_name}
            </Typography>
          </Paper>
        )}
      </Box>
    </ThemeProvider>
  );
}
