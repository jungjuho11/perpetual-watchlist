'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  Box,
  Chip,
  IconButton,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  Close,
  LinkedIn,
  Email,
  GitHub,
  Coffee,
  Work,
  Movie,
  Star
} from '@mui/icons-material';

interface ContactGateModalProps {
  open: boolean;
  onClose: () => void;
  onProceed: () => void;
  movieTitle: string;
}

const ContactGateModal: React.FC<ContactGateModalProps> = ({
  open,
  onClose,
  onProceed,
  movieTitle,
}) => {
  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  // Reset selected contact when modal closes
  React.useEffect(() => {
    if (!open) {
      setSelectedContact(null);
    }
  }, [open]);

  const contactOptions = [
    {
      id: 'linkedin',
      icon: <LinkedIn />,
      title: 'Connect on LinkedIn',
      description: 'Best for professional opportunities',
      action: () => window.open('https://www.linkedin.com/in/juho-jung-a58442152/', '_blank'),
      color: '#0077B5',
      recommended: true,
    },
    {
      id: 'email',
      icon: <Email />,
      title: 'Send me an email',
      description: 'Direct line for collaboration',
      action: () => window.open(`mailto:jungjuho@yahoo.com?subject=Movie Recommendation: ${movieTitle}&body=Hi Juho,%0A%0AI'd like to recommend "${movieTitle}" for your watchlist!%0A%0A[Tell me why you think I'd enjoy it]%0A%0ABest regards,`, '_blank'),
      color: '#EA4335',
    },
    {
      id: 'github',
      icon: <GitHub />,
      title: 'Check how this is built in GitHub!',
      description: 'Curious about the code? Check it out!',
      action: () => window.open('https://github.com/jungjuho11/perpetual-watchlist', '_blank'),
      color: '#333',
    }
  ];

  const handleContactSelect = (option: typeof contactOptions[0]) => {
    setSelectedContact(option.id);
    option.action();

    // Small delay to show selection, then allow proceeding
    setTimeout(() => {
      onProceed();
    }, 1500);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Movie color="primary" />
            <Typography variant="h6">
              Want to recommend <strong>{movieTitle}</strong>?
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Card sx={{ mb: 3, bgcolor: 'primary.secondary', color: 'white' }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6" gutterBottom>
              🎬 Let&apos;s Connect First!
            </Typography>
            <Typography variant="body2">
              I love recommendations, but I&apos;d love to connect with you even more!
              Choose how you&apos;d like to reach out:
            </Typography>
          </CardContent>
        </Card>

        <Box sx={{ display: 'grid', gap: 2 }}>
          {contactOptions.map((option) => (
            <Card
              key={option.id}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: selectedContact === option.id ? 2 : 1,
                borderColor: selectedContact === option.id ? option.color : 'divider',
                bgcolor: selectedContact === option.id ? `${option.color}15` : 'background.paper',
                '&:hover': {
                  borderColor: option.color,
                  transform: 'translateY(-2px)',
                  boxShadow: 2,
                }
              }}
              onClick={() => handleContactSelect(option)}
            >
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      color: option.color,
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: 28
                    }}
                  >
                    {option.icon}
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {option.title}
                      </Typography>
                      {option.recommended && (
                        <Chip
                          label="Recommended"
                          size="small"
                          color="primary"
                          icon={<Star />}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {option.description}
                    </Typography>
                  </Box>

                  {selectedContact === option.id && (
                    <Typography color="primary" variant="body2" fontWeight="bold">
                      ✓ Opening...
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={onProceed}
            sx={{ mt: 1 }}
          >
            Skip for now (Just browsing)
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ContactGateModal;
