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
        sx: {
          borderRadius: 4,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              p: 1.5,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%)',
              border: '1px solid rgba(25, 118, 210, 0.2)'
            }}>
              <Movie color="primary" sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="600" sx={{ mb: 0.5 }}>
                Want to recommend
              </Typography>
              <Typography variant="h6" color="primary.main" fontWeight="700">
                {movieTitle}?
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Card sx={{
          mb: 3,
          background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
          border: '1px solid rgba(25, 118, 210, 0.2)',
          borderRadius: 3
        }}>
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h5" fontWeight="600" gutterBottom sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #9333ea 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}>
              🎬 Let&apos;s Connect First!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
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
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: selectedContact === option.id ? 2 : 1,
                borderColor: selectedContact === option.id ? option.color : 'rgba(255,255,255,0.1)',
                borderRadius: 3,
                background: selectedContact === option.id
                  ? `linear-gradient(135deg, ${option.color}15 0%, ${option.color}10 100%)`
                  : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                backdropFilter: 'blur(5px)',
                '&:hover': {
                  borderColor: option.color,
                  transform: 'translateY(-3px) scale(1.02)',
                  boxShadow: `0 10px 20px -5px ${option.color}30, 0 4px 6px -2px ${option.color}20`,
                  background: `linear-gradient(135deg, ${option.color}15 0%, ${option.color}10 100%)`
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
                      justifyContent: 'center',
                      fontSize: 28,
                      width: 56,
                      height: 56,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${option.color}15 0%, ${option.color}10 100%)`,
                      border: `1px solid ${option.color}30`
                    }}
                  >
                    {option.icon}
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle1" fontWeight="600">
                        {option.title}
                      </Typography>
                      {option.recommended && (
                        <Chip
                          label="Recommended"
                          size="small"
                          sx={{
                            background: 'linear-gradient(135deg, #1976d2 0%, #9333ea 100%)',
                            color: 'white',
                            fontWeight: 600,
                            '& .MuiChip-icon': { color: 'white' }
                          }}
                          icon={<Star sx={{ fontSize: 16 }} />}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {option.description}
                    </Typography>
                  </Box>

                  {selectedContact === option.id && (
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${option.color}20 0%, ${option.color}15 100%)`,
                      border: `1px solid ${option.color}40`
                    }}>
                      <Typography color={option.color} variant="body2" fontWeight="600">
                        ✓ Opening...
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Divider sx={{ my: 4, opacity: 0.6 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="outlined"
            size="medium"
            onClick={onProceed}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1,
              borderColor: 'rgba(255,255,255,0.3)',
              color: 'text.secondary',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.5)',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
              }
            }}
          >
            Skip for now (Just browsing)
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ContactGateModal;
